---
title: Factory Deep Analysis - Analise Real de Apps para Clonagem
date: 2026-03-22
status: approved
---

# Factory Deep Analysis — Design Spec

## Problema

O sistema atual de clonagem (Agente 2 / Factory Engine) gera teardowns, funis e GTM 100% genericos. Usa dicionarios estaticos por categoria (`CORE_FEATURES_BY_CATEGORY`, `STACK_BY_CATEGORY`) em vez de analisar o app real. Resultado: todos os clones de Finance recebem as mesmas 6 features, mesma stack, mesma copy.

## Solucao

Pipeline de analise real em 3 camadas paralelas que roda automaticamente quando um app entra no factory. Zero intervencao humana. Zero preguica.

## Arquitetura

```
App entra no Factory (Top 2 do Radar)
         |
         |-- Camada 1: DATA EXTRACTION (API) --- OBRIGATORIA
         |   iTunes Lookup Full + Google Play .app() + Reviews
         |
         |-- Camada 2: SITE ANALYSIS (Fetch HTML) --- OBRIGATORIA
         |   Parse do site do dev: pricing, features, stack, social proof
         |
         |-- Camada 3: MARKET & ICP INTELLIGENCE --- OBRIGATORIA
         |   Concorrentes locais (BR/MX/IN) + ICP + Sizing + Trends
         |
         v
   AppDeepProfile (dados reais)
         |
         v
   generateTeardown()  -- features reais, nao templates
   generateFunnels()   -- copy baseada em ICP/pain points reais
   generateGTM()       -- criativos com diferenciais reais
```

Todas as 3 camadas rodam em paralelo no Next.js server via Promise.allSettled.

---

## Camada 1: Data Extraction (API)

### Novo arquivo: `lib/services/app-deep-analyzer.ts`

### Fontes de dados:

**iTunes Lookup API** (individual, nao batch):
- description: texto completo do app
- screenshotUrls: screenshots iOS
- releaseNotes: changelog recente
- languageCodesISO2A: idiomas suportados
- sellerUrl: site do desenvolvedor (alimenta Camada 2)
- fileSizeBytes: tamanho (indica complexidade)
- contentAdvisoryRating: publico alvo (4+, 12+, 17+)
- minimumOsVersion: indica se e moderno ou legado
- averageUserRating, userRatingCount

**Google Play Scraper `.app(appId)`**:
- description + descriptionHTML: descricao completa com formatacao
- screenshots: URLs screenshots Android
- reviews (via `.reviews()`): top 40 reviews com texto real
- histogram: distribuicao de ratings [1, 2, 3, 4, 5]
- recentChanges: changelog
- developer: nome, email, site
- permissions: o que o app pede (indica features)
- installs: numero real de instalacoes
- categories: categorias detalhadas

### Parsing inteligente:

1. Descricao: extrair bullets/listas (linhas com marcadores) = features reais
2. Value proposition: primeiras 2-3 frases da descricao
3. Keywords de monetizacao: "premium", "subscribe", "unlock", "pro"
4. Reviews positivos (4-5 estrelas): temas elogiados = features que funcionam
5. Reviews negativos (1-2 estrelas): dores reais = oportunidade de melhoria
6. Permissions: camera = foto/video, location = local-based, contacts = social

---

## Camada 2: Site Analysis (Fetch HTML)

### Processo:

1. Pegar `sellerUrl` da iTunes Lookup
2. `fetch()` do HTML do site do desenvolvedor
3. Parse com regex/string matching:

**Pricing:**
- Buscar links/sections com "pricing", "plans", "subscribe"
- Extrair tiers reais (nome, preco, features por tier)
- Modelo: freemium, trial, one-time, subscription

**Stack/Tecnologias:**
- Meta tags, scripts carregados, headers
- Frameworks (React, Vue, Angular)
- Analytics (GA, Mixpanel, Amplitude)
- Pagamentos (Stripe, Paddle, RevenueCat)

**Features do site:**
- Headlines e value propositions
- Feature sections (grids/cards)
- Social proof (numeros de usuarios, logos, depoimentos)
- CTAs principais (indica funil e estrategia)

**Fallback:** Se sellerUrl nao existe ou falha, camada nao bloqueia. Camadas 1 e 3 garantem dados suficientes.

---

## Camada 3: Market & ICP Intelligence

### 3A: Analise Competitiva Real

1. **Radar data proprio** — apps da mesma categoria que JA aparecem no top grossing de BR/MX/IN
   - Sao os concorrentes locais reais
   - Nome, ranking, MRR, rating de cada
   - Zero = confirma gap real
   - Existem = analisar onde sao fracos

2. **Google Play `.search()`** — busca por keywords em portugues/espanhol/hindi
   - Ex: Finance US -> busca "controle financeiro" na Play Store BR
   - Encontra alternativas locais fora do top grossing
   - Rating, installs, descricao

3. **Google Trends comparativo** — infra existente
   - Trend do termo em ingles (US) vs portugues (BR) vs espanhol (MX)
   - Demanda alta US + baixa BR = timing confirmado

### 3B: ICP Profile

Gerado dos dados reais:

| Input Real | Output ICP |
|-----------|------------|
| contentAdvisoryRating: 4+ | Publico: todas as idades |
| contentAdvisoryRating: 17+ | Publico: adultos |
| Categoria Finance + reviews "salary/budget" | Jovens adultos 22-35 |
| Categoria Health + reviews "gym/workout" | Praticantes academia 18-40 |
| permissions: camera, gallery | Criacao de conteudo visual |
| permissions: location | Uso local-based |
| Pricing $9.99/mes original | Poder aquisitivo medio-alto |
| Idiomas: so EN | LatAm: 100% underserved |
| Idiomas: EN, ES, PT | LatAm: parcialmente servido |
| Installs 1M+ mas rating 3.2 | Usuarios insatisfeitos |

### 3C: Market Sizing

- TAM: total installs da categoria nos mercados-alvo
- SAM: fatia acessivel (mesma subcategoria, mesmo modelo)
- SOM: meta realista (baseada em installs dos menores na regiao)

### 3D: Posicionamento

3 diferenciais reais:
1. O que o original NAO tem nos mercados-alvo (idioma, features locais)
2. O que concorrentes locais fazem MAL (reviews negativos deles)
3. Timing (Google Trends confirmando demanda)

---

## Interfaces TypeScript

```typescript
interface ReviewInsight {
  theme: string        // "slow loading", "missing feature X"
  sentiment: 'positive' | 'negative'
  frequency: number    // quantas vezes aparece
  example_quote: string
}

interface PricingTier {
  name: string         // "Free", "Pro", "Premium"
  price: string        // "$9.99/month"
  price_value: number  // 9.99
  period: 'monthly' | 'yearly' | 'one-time' | 'free'
  features: string[]
}

interface LocalCompetitor {
  name: string
  app_id: string
  store: 'ios' | 'android'
  country: string
  rating: number
  installs: string
  description_snippet: string
  weaknesses: string[] // derivado de reviews negativos
}

interface ICPProfile {
  age_range: string
  gender_skew: string        // "balanced", "male-leaning", "female-leaning"
  income_level: string       // derivado do pricing original
  primary_pain: string       // pain point #1 dos reviews
  secondary_pains: string[]
  use_context: string        // "daily habit", "occasional need", "professional"
  device_preference: string  // derivado de iOS vs Android split
  language_gap: string[]     // idiomas que faltam
}

interface TrendComparison {
  term_us: string
  term_br: string
  term_mx: string
  score_us: number
  score_br: number
  score_mx: number
  direction: 'rising' | 'stable' | 'declining'
}

interface GapAnalysis {
  language_gap: boolean      // nao tem PT/ES/HI
  pricing_gap: boolean       // caro demais pra emergentes
  feature_gaps: string[]     // features pedidas em reviews que nao existem
  ux_gaps: string[]          // problemas de UX dos reviews
  local_payment_gap: boolean // nao aceita PIX, UPI, OXXO
}

interface MarketSizing {
  tam: number  // total addressable
  sam: number  // serviceable addressable
  som: number  // serviceable obtainable
  tam_source: string
  confidence: 'high' | 'medium' | 'low'
}

interface AppDeepProfile {
  // Camada 1: Data
  real_features: string[]
  value_proposition: string
  reviews_positive: ReviewInsight[]
  reviews_negative: ReviewInsight[]
  languages: string[]
  permissions: string[]
  screenshots_ios: string[]
  screenshots_android: string[]
  release_notes: string
  app_size_mb: number
  content_rating: string
  histogram: number[]  // [1star, 2star, 3star, 4star, 5star]

  // Camada 2: Site
  developer_url: string
  pricing_tiers_real: PricingTier[]
  site_features: string[]
  site_social_proof: string[]
  tech_stack_detected: string[]

  // Camada 3: Market
  icp: ICPProfile
  competitors_local: LocalCompetitor[]
  market_sizing: MarketSizing
  trend_comparison: TrendComparison
  positioning: string[]       // 3 diferenciais reais
  gap_analysis: GapAnalysis
}
```

---

## Mudancas no Factory Engine

### generateTeardown() — usa AppDeepProfile

| Campo | Antes | Depois |
|-------|-------|--------|
| core_features | Dicionario estatico | Features parseadas da descricao REAL |
| improvements | 4 frases genericas | Baseadas em reviews negativos + gaps |
| stack_recommendation | Mesma pra toda categoria | Baseada em permissions, features, complexidade |
| monetization_model | 3 tiers genericos | Tiers do original com 20% desconto |
| competitive_edge | "Clone localizado" | Diferenciais reais da analise competitiva |
| estimated_days | 5/10/18 fixo | Baseado em num real de features + telas |

### Novos campos no teardown:
- icp_profile
- competitors_local
- market_sizing
- pain_points (top 5 dos reviews negativos)
- loved_features (top 5 dos reviews positivos)
- languages_supported
- pricing_original (tiers reais)
- screenshots_count
- positioning (3 diferenciais)

### generateFunnelPack() — personalizado

- headline: baseado no value proposition real + pain point #1 do ICP
- quiz_flow: perguntas derivadas dos pain points reais
- email_sequence: menciona features e dores reais

### generateGTMPack() — personalizado

- ad_creatives: hook com pain point #1, comparacao real com original
- social_accounts: bio com posicionamento real
- launch_checklist: canais onde o ICP real esta

---

## Regra de Pricing do Clone

Preco do clone = preco real do original **menos 20%**.

Ex: Original $9.99/mes -> Clone $7.99/mes

Aplicado a todos os tiers proporcionalmente.

---

## Arquivos a criar/modificar

### Criar:
- `lib/services/app-deep-analyzer.ts` — Engine principal das 3 camadas
- `types/deep-profile.ts` — Interfaces AppDeepProfile e dependencias

### Modificar:
- `lib/services/factory-engine.ts` — Reescrever para usar AppDeepProfile
- `app/api/factory/route.ts` — Chamar analyzeAppDeep() antes de gerar teardown
- `lib/services/google-play.ts` — Adicionar funcoes .app() e .reviews() e .search()
- `lib/services/itunes.ts` — Adicionar fetchAppFullDetails() individual
- `app/factory/page.tsx` — Mostrar dados reais no UI (features, reviews, ICP, competitors)
