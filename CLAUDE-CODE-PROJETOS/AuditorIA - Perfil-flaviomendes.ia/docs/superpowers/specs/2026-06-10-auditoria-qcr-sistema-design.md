# Spec: Sistema Auditoria QCR™ — Flávio Mendes

**Data:** 2026-06-10  
**Status:** Aprovado  
**Produto:** Lead magnet de diagnóstico — quiz interativo com resultado personalizado e CTA WhatsApp

---

## 1. Visão Geral

Sistema web completo para a Auditoria QCR™ de Flávio Mendes. O usuário responde 12 perguntas sobre sua operação comercial, preenche um formulário de captura, e recebe um diagnóstico com score individualizado por bloco (Q/C/R) e recomendação de próximo passo via WhatsApp.

**Objetivo de negócio:** Capturar leads qualificados (donos de empresa com operação comercial ativa) e conduzi-los para uma conversa estratégica com Flávio.

---

## 2. Stack Técnico

- **Framework:** Next.js 15 (App Router)
- **Estilo:** Tailwind CSS + design system da landing aprovada (oklch dark mode, Bricolage Grotesque)
- **Backend:** Supabase (PostgreSQL + client JS)
- **Deploy:** Vercel
- **Linguagem:** TypeScript

---

## 3. Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page (landing-v1 convertida para Next.js) |
| `/quiz` | Tela de início do quiz |
| `/quiz/[step]` | Perguntas 1–12 (rota dinâmica) |
| `/quiz/captura` | Formulário de lead (nome, empresa, WhatsApp) |
| `/quiz/resultado` | Tela de resultado com score e CTA WhatsApp |

**Proteção:** Acesso direto a `/quiz/resultado` sem fluxo completo redireciona para `/quiz`.

---

## 4. Fluxo do Usuário

1. Usuário chega na landing `/` (via anúncio, WhatsApp, etc.)
2. Clica em "Fazer Auditoria QCR™" → vai para `/quiz`
3. Clica em "Começar" → `/quiz/1`
4. Responde cada pergunta com um clique → auto-avança para próxima (350ms de feedback visual)
5. Após pergunta 12 → vai para `/quiz/captura`
6. Preenche nome, empresa, WhatsApp → submit
7. Sistema calcula scores, grava no Supabase → redireciona para `/quiz/resultado?id=[lead_id]`
8. Vê resultado completo com CTA WhatsApp pré-preenchido

**Estado do quiz:** Respostas salvas em `sessionStorage` conforme o usuário avança. Back button funciona para rever/alterar respostas.

**UTM:** `utm_source` capturado da URL na landing e salvo no `sessionStorage` para gravar no Supabase.

---

## 5. Banco de Dados (Supabase)

### Tabela `leads`

```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
nome        text NOT NULL
empresa     text NOT NULL
whatsapp    text NOT NULL
score_total integer        -- 0–100
score_q     integer        -- score bloco Qualificar
score_c     integer        -- score bloco Conectar
score_r     integer        -- score bloco Recuperar
nivel       text           -- 'critico' | 'atencao' | 'bom' | 'excelente'
gargalo     text           -- 'Q' | 'C' | 'R'
utm_source  text
created_at  timestamptz DEFAULT now()
```

### Tabela `respostas`

```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
lead_id     uuid REFERENCES leads(id)
pergunta    integer        -- 1–12
bloco       text           -- 'Q' | 'C' | 'R'
valor       integer        -- 0, 33, 67 ou 100
created_at  timestamptz DEFAULT now()
```

---

## 6. Sistema de Scoring

- Cada pergunta tem 4 opções valendo **0, 33, 67 ou 100 pontos**
- **Score do bloco** = média aritmética das 4 perguntas do bloco (inteiro)
- **Score total** = média dos 3 scores de bloco (inteiro)
- **Gargalo** = bloco com menor score individual

### Níveis

| Score | Nível | Badge |
|-------|-------|-------|
| 0–39 | Crítico | vermelho |
| 40–69 | Atenção | amarelo |
| 70–89 | Bom | verde |
| 90–100 | Excelente | azul |

---

## 7. As 12 Perguntas

### Bloco Q — Qualificar (perguntas 1–4)

**P1 — Como sua equipe identifica quais leads têm maior potencial de compra?**
- (0) Não temos critério definido — todos recebem a mesma atenção
- (33) Informalmente, por feeling da equipe
- (67) Temos alguns critérios, mas não são seguidos de forma consistente
- (100) Processo estruturado com critérios claros aplicados em todos os leads

**P2 — Com que frequência leads sem perfil consomem tempo da equipe de vendas?**
- (0) Frequentemente — não conseguimos filtrar antes do atendimento
- (33) Às vezes — depende do vendedor
- (67) Raramente — temos um filtro, mas não é perfeito
- (100) Quase nunca — nosso processo de qualificação é eficiente

**P3 — Sua equipe registra informações de qualificação dos leads em algum sistema?**
- (0) Não registramos nada
- (33) Registramos de forma irregular, depende do vendedor
- (67) Registramos na maioria dos casos
- (100) Sempre registramos com campos padronizados

**P4 — Você consegue priorizar quais leads abordar primeiro com base em dados objetivos?**
- (0) Não — a ordem é por chegada ou preferência do vendedor
- (33) Às vezes — depende da percepção do vendedor
- (67) Na maioria das vezes, com base em informações básicas
- (100) Sempre — temos score ou critério objetivo de priorização

### Bloco C — Conectar (perguntas 5–8)

**P5 — Em quanto tempo sua empresa responde a um novo lead?**
- (0) Mais de 24 horas
- (33) Entre 1 e 24 horas
- (67) Entre 15 minutos e 1 hora
- (100) Em menos de 15 minutos

**P6 — Como sua equipe conduz a primeira conversa com um lead?**
- (0) Sem roteiro — cada vendedor age como preferir
- (33) Existe um roteiro básico, mas raramente seguido
- (67) A maioria segue um roteiro, com variações
- (100) Roteiro estruturado, seguido de forma consistente por todos

**P7 — O lead sabe exatamente qual é o próximo passo após o primeiro contato?**
- (0) Raramente — a conversa termina sem definir próximos passos
- (33) Às vezes — depende do vendedor
- (67) Na maioria das vezes definimos próximos passos
- (100) Sempre — o próximo passo é acordado e registrado em todo contato

**P8 — Com que clareza sua empresa comunica o valor do produto/serviço no primeiro contato?**
- (0) A comunicação é genérica e pouco diferenciada
- (33) Razoável, mas não adaptada ao perfil do lead
- (67) Boa — adaptamos a comunicação na maioria dos casos
- (100) Excelente — comunicação personalizada e focada no problema do lead

### Bloco R — Recuperar (perguntas 9–12)

**P9 — O que acontece com leads que não responderam após o primeiro contato?**
- (0) Nada — ficam parados até alguém lembrar
- (33) Fazemos uma tentativa manual esporádica
- (67) Temos uma sequência de follow-up, mas não é consistente
- (100) Processo automatizado e estruturado de reativação

**P10 — Com quantas tentativas sua equipe insiste em um lead antes de desistir?**
- (0) Uma ou duas tentativas no máximo
- (33) Três a quatro tentativas sem critério definido
- (67) Seguimos um número definido de tentativas com intervalo padronizado
- (100) Processo multi-canal com tentativas e intervalos estratégicos definidos

**P11 — Sua empresa possui um processo para reativar leads antigos (mais de 30 dias sem contato)?**
- (0) Não — leads antigos são considerados perdidos
- (33) Às vezes fazemos contato manual, sem processo definido
- (67) Temos uma prática de reativação, mas não é sistemática
- (100) Processo estruturado de reativação com critérios e cadência definidos

**P12 — Você consegue identificar qual etapa do processo comercial tem maior taxa de abandono?**
- (0) Não temos visibilidade sobre isso
- (33) Temos uma percepção, mas sem dados concretos
- (67) Sabemos onde perdemos mais, com dados parciais
- (100) Monitoramos cada etapa com dados claros e tomamos ações corretivas

---

## 8. Design das Telas

**Sistema visual:** Idêntico à landing aprovada — dark mode oklch, Bricolage Grotesque, sem emojis, tom executivo, preto/branco/cinza.

### `/quiz` — Início
- Logo / wordmark "Auditoria QCR™"
- Título e subtítulo: "12 perguntas. Menos de 3 minutos. Resultado imediato."
- Barra de progresso zerada
- Botão: "Começar Auditoria"
- Micro-copy: "Gratuito · Sem cadastro até o resultado"

### `/quiz/[step]` — Pergunta
- Topo: barra de progresso (`pergunta X de 12`) + label do bloco (`Q — Qualificação`)
- Pergunta em fonte grande, centralizada
- 4 cards de resposta empilhados (full-width mobile)
- Click → highlight 350ms → auto-avança
- Botão "← Voltar" discreto no topo esquerdo

### `/quiz/captura` — Formulário
- Cabeçalho: "Seu diagnóstico está pronto."
- Subheader: "Para revelar, precisamos de:"
- 3 campos: Nome, Empresa, WhatsApp
- Botão: "Ver meu Score QCR™ →"
- Micro-copy: "Seus dados não serão compartilhados. Usados apenas para contato com Flávio."

### `/quiz/resultado` — Resultado
- Score total (número grande)
- Badge de nível (Crítico / Atenção / Bom / Excelente)
- 3 barras de progresso: Q / C / R com scores individuais
- **Estimativa de impacto:** frase calculada com base no score do gargalo (ex: "Empresas com score de Recuperação abaixo de 40 perdem em média 30% das oportunidades que já demonstraram interesse.")
- **Bloco de insight:** texto diagnóstico específico pelo bloco gargalo + nível (ver seção 11)
- CTA: "Agendar conversa com Flávio →"
  - Abre WhatsApp: `https://wa.me/55[numero]?text=[mensagem pré-preenchida]`
  - Mensagem: "Olá Flávio, fiz a Auditoria QCR™. Score: [X]. Gargalo principal: [bloco]. Empresa: [empresa]. Quero entender como melhorar."

---

## 9. Componentes Principais

```
src/
  app/
    page.tsx                  → Landing page
    quiz/
      page.tsx                → Tela de início
      [step]/
        page.tsx              → Tela de pergunta (client component)
      captura/
        page.tsx              → Formulário de lead
      resultado/
        page.tsx              → Tela de resultado
  components/
    quiz/
      QuizProgress.tsx        → Barra de progresso
      QuizQuestion.tsx        → Pergunta + cards de resposta
      QuizCapture.tsx         → Formulário de lead
      QuizResult.tsx          → Score + barras + CTA
    ui/
      Button.tsx
      Card.tsx
  lib/
    questions.ts              → Array com as 12 perguntas e opções
    scoring.ts                → Funções de cálculo de score e nível
    supabase.ts               → Client Supabase
    quiz-storage.ts           → Helpers sessionStorage
```

---

## 11. Textos de Diagnóstico (tela de resultado)

O texto exibido é determinado pelo **bloco gargalo** (menor score) + **nível** desse bloco.

### Gargalo Q — Qualificar

| Nível | Texto |
|-------|-------|
| Crítico (0–39) | "Sua equipe trata todos os leads da mesma forma. Isso significa que oportunidades de alto valor estão competindo por atenção com contatos sem potencial — e ambos perdem." |
| Atenção (40–69) | "Sua qualificação é inconsistente. Alguns vendedores identificam boas oportunidades, outros não. O resultado é imprevisível e difícil de escalar." |
| Bom (70–89) | "Sua qualificação está no caminho certo. O próximo passo é tornar o processo sistemático para que todos os vendedores obtenham resultados similares." |
| Excelente (90–100) | "Qualificação sólida. Você sabe exatamente onde investir o tempo da equipe comercial." |

### Gargalo C — Conectar

| Nível | Texto |
|-------|-------|
| Crítico (0–39) | "Sua empresa está perdendo leads no momento mais crítico: o primeiro contato. Velocidade e condução insuficientes fazem o lead perder interesse antes mesmo de receber uma proposta." |
| Atenção (40–69) | "Sua capacidade de conexão varia conforme o vendedor. Leads que chegam a um profissional melhor convertem. Os demais, não. Isso é um risco operacional." |
| Bom (70–89) | "Sua equipe conecta bem na maioria dos casos. Padronizar os critérios de próximo passo elevará sua conversão de forma consistente." |
| Excelente (90–100) | "Conexão eficiente. Você responde rápido, comunica valor e define próximos passos com clareza." |

### Gargalo R — Recuperar

| Nível | Texto |
|-------|-------|
| Crítico (0–39) | "Existe receita parada na sua operação neste momento. Leads que demonstraram interesse e foram esquecidos. Sem processo de recuperação, você está descartando oportunidades que já custaram dinheiro para atrair." |
| Atenção (40–69) | "Sua recuperação é parcial e dependente de iniciativa individual. Quando alguém lembra, o follow-up acontece. Quando não lembra, o lead some. Isso é receita que escapa pelo descuido operacional." |
| Bom (70–89) | "Você tem processo de recuperação, mas ele não é sistemático o suficiente. Automatizar a cadência multiplicará os resultados sem exigir mais esforço da equipe." |
| Excelente (90–100) | "Recuperação bem estruturada. Você não deixa oportunidades morrerem por falta de acompanhamento." |

---

## 10. Decisões Técnicas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Roteamento do quiz | `/quiz/[step]` (rotas por pergunta) | Back button funciona nativamente |
| Estado do quiz | `sessionStorage` | Persiste refresh, limpa ao fechar aba |
| Auto-avanço | `setTimeout(350ms)` + `router.push` | Feedback visual antes de navegar |
| Insert Supabase | Único insert no submit da captura | Evita dados parciais no banco |
| UTM capture | `sessionStorage` na landing | Disponível no submit da captura |
| Número do WhatsApp | Variável de ambiente `NEXT_PUBLIC_WHATSAPP` | Sem hardcode |
