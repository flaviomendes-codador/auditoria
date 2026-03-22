import type { RadarSelection } from './radar-db'

// ============================================================
// FACTORY ENGINE — Agente 2: Fábrica de MVPs
// Gera teardown, checklists, copy e criativos para cada fase
// ============================================================

// --- Fase 1: Análise & Modelagem ---

export interface AppTeardown {
  app_name: string
  category: string
  core_features: string[]
  improvements: string[]
  stack_recommendation: {
    frontend: string
    backend: string
    database: string
    deploy: string
    extras: string[]
  }
  monetization_model: {
    type: string
    pricing_tiers: { name: string; price: string; features: string[] }[]
    trial_days: number
  }
  estimated_days: number
  target_markets: string[]
  competitive_edge: string
}

const STACK_BY_CATEGORY: Record<string, AppTeardown['stack_recommendation']> = {
  'Finance': {
    frontend: 'React Native (Expo)',
    backend: 'Next.js API Routes + Supabase',
    database: 'Supabase (PostgreSQL + RLS)',
    deploy: 'Vercel + EAS Build',
    extras: ['PIX API', 'Plaid (US)', 'Stripe Billing'],
  },
  'Health & Fitness': {
    frontend: 'React Native (Expo)',
    backend: 'Next.js API Routes + Supabase',
    database: 'Supabase (PostgreSQL)',
    deploy: 'Vercel + EAS Build',
    extras: ['HealthKit/Google Fit', 'Push Notifications', 'Charts (Victory)'],
  },
  'Education': {
    frontend: 'React Native (Expo)',
    backend: 'Next.js API Routes + Supabase',
    database: 'Supabase (PostgreSQL)',
    deploy: 'Vercel + EAS Build',
    extras: ['Video Player', 'Quiz Engine', 'Gamification (streaks)'],
  },
  'Productivity': {
    frontend: 'React Native (Expo)',
    backend: 'Next.js API Routes + Supabase',
    database: 'Supabase (PostgreSQL + Realtime)',
    deploy: 'Vercel + EAS Build',
    extras: ['Calendar Sync', 'Notifications', 'Offline Storage'],
  },
  default: {
    frontend: 'React Native (Expo)',
    backend: 'Next.js API Routes + Supabase',
    database: 'Supabase (PostgreSQL)',
    deploy: 'Vercel + EAS Build',
    extras: ['Push Notifications', 'Analytics (PostHog)'],
  },
}

const CORE_FEATURES_BY_CATEGORY: Record<string, string[]> = {
  'Finance': ['Dashboard financeiro', 'Tracking de gastos', 'Categorização automática', 'Gráficos e relatórios', 'Alertas de orçamento', 'Export CSV/PDF'],
  'Health & Fitness': ['Tracking de atividades', 'Planos de treino', 'Dashboard de progresso', 'Lembretes diários', 'Integração wearables', 'Histórico visual'],
  'Education': ['Aulas em vídeo/texto', 'Quiz interativo', 'Sistema de progresso', 'Certificados', 'Gamificação', 'Busca de conteúdo'],
  'Productivity': ['Task management', 'Calendário', 'Notas rápidas', 'Templates', 'Colaboração', 'Sincronização multi-device'],
  'Lifestyle': ['Perfil personalizado', 'Feed de conteúdo', 'Favoritos/Salvos', 'Compartilhamento social', 'Notificações', 'Configurações'],
  'Photo & Video': ['Editor de mídia', 'Filtros/Efeitos', 'Galeria', 'Compartilhamento', 'Templates prontos', 'Export em alta resolução'],
  'Utilities': ['Função principal simples', 'Configurações rápidas', 'Widget', 'Histórico de uso', 'Backup/Sync', 'Modo offline'],
  'Business': ['Dashboard KPIs', 'Relatórios', 'CRM básico', 'Integração email', 'Export dados', 'Multi-usuário'],
  'Social': ['Feed de conteúdo', 'Perfil de usuário', 'Mensagens', 'Seguir/Curtir', 'Notificações', 'Busca'],
  'Entertainment': ['Catálogo de conteúdo', 'Player/Viewer', 'Recomendações', 'Favoritos', 'Compartilhamento', 'Modo offline'],
}

export function generateTeardown(selection: RadarSelection): AppTeardown {
  const category = selection.category || 'Utilities'
  const stack = STACK_BY_CATEGORY[category] || STACK_BY_CATEGORY.default
  const coreFeatures = CORE_FEATURES_BY_CATEGORY[category] || CORE_FEATURES_BY_CATEGORY['Utilities']
  const mrr = selection.combined_mrr || selection.mrr_estimated || 50000

  const priceLow = mrr >= 200000 ? '$4.99' : mrr >= 100000 ? '$2.99' : '$1.99'
  const priceMid = mrr >= 200000 ? '$9.99' : mrr >= 100000 ? '$6.99' : '$4.99'
  const priceHigh = mrr >= 200000 ? '$19.99' : mrr >= 100000 ? '$14.99' : '$9.99'

  const difficulty = selection.clone_difficulty || 'Medium'
  const days = difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 10 : 18

  return {
    app_name: selection.app_name,
    category,
    core_features: coreFeatures,
    improvements: selection.suggested_improvements || [
      'Localização completa (PT-BR, ES, Hindi)',
      'Pricing 50-70% mais barato que original',
      'Onboarding simplificado com quiz',
      'UX mais limpa e moderna',
    ],
    stack_recommendation: stack,
    monetization_model: {
      type: selection.monetization || 'Free + IAP',
      pricing_tiers: [
        { name: 'Free', price: '$0', features: ['Funcionalidades básicas', '3 usos/dia', 'Com anúncios discretos'] },
        { name: 'Pro', price: `${priceLow}/mês`, features: ['Tudo do Free', 'Uso ilimitado', 'Sem anúncios', 'Suporte prioritário'] },
        { name: 'Premium', price: `${priceMid}/mês`, features: ['Tudo do Pro', 'Features avançadas', 'Export dados', 'Acesso antecipado'] },
      ],
      trial_days: 7,
    },
    estimated_days: days,
    target_markets: selection.target_markets || ['Brasil', 'México', 'Índia'],
    competitive_edge: `Clone localizado de ${selection.app_name} com pricing ${priceLow}-${priceMid}/mês (50-70% mais barato), UX otimizada para mercados emergentes, e onboarding em idioma local.`,
  }
}

// --- Fase 2: Build Checklist ---

export interface BuildChecklist {
  phases: {
    name: string
    items: { id: string; label: string; done: boolean }[]
  }[]
  total_items: number
  completed_items: number
}

export function generateBuildChecklist(teardown: AppTeardown): BuildChecklist {
  const phases = [
    {
      name: 'Setup do Projeto',
      items: [
        { id: 'b1', label: `Criar projeto ${teardown.stack_recommendation.frontend}`, done: false },
        { id: 'b2', label: `Configurar ${teardown.stack_recommendation.database}`, done: false },
        { id: 'b3', label: 'Definir schema do banco (tabelas, RLS)', done: false },
        { id: 'b4', label: 'Configurar autenticação (Supabase Auth)', done: false },
        { id: 'b5', label: 'Setup CI/CD e ambiente de staging', done: false },
      ],
    },
    {
      name: 'Features Core',
      items: teardown.core_features.map((f, i) => ({
        id: `f${i}`,
        label: `Implementar: ${f}`,
        done: false,
      })),
    },
    {
      name: 'Monetização',
      items: [
        { id: 'm1', label: `Integrar Stripe/RevenueCat para ${teardown.monetization_model.type}`, done: false },
        { id: 'm2', label: `Criar paywall com ${teardown.monetization_model.pricing_tiers.length} tiers`, done: false },
        { id: 'm3', label: `Implementar trial de ${teardown.monetization_model.trial_days} dias`, done: false },
        { id: 'm4', label: 'Testar fluxo completo de compra', done: false },
      ],
    },
    {
      name: 'Localização',
      items: teardown.target_markets.map((m, i) => ({
        id: `l${i}`,
        label: `Traduzir para ${m === 'Brasil' ? 'PT-BR' : m === 'México' ? 'ES-MX' : m === 'Índia' ? 'Hindi/EN-IN' : m}`,
        done: false,
      })),
    },
    {
      name: 'Deploy & App Store',
      items: [
        { id: 'd1', label: 'Build de produção', done: false },
        { id: 'd2', label: 'Screenshots para App Store (6.5" e 5.5")', done: false },
        { id: 'd3', label: 'Ícone do app (1024x1024)', done: false },
        { id: 'd4', label: 'Descrição ASO otimizada (PT-BR, ES, EN)', done: false },
        { id: 'd5', label: 'Submeter para Apple Review', done: false },
        { id: 'd6', label: 'Submeter para Google Play', done: false },
        { id: 'd7', label: 'Testar em device real', done: false },
      ],
    },
  ]

  const total = phases.reduce((sum, p) => sum + p.items.length, 0)
  return { phases, total_items: total, completed_items: 0 }
}

// --- Fase 3: Funis & Copy ---

export interface FunnelPack {
  landing_page: {
    headline: string
    subheadline: string
    cta: string
    hero_bullets: string[]
    social_proof: string
    urgency: string
  }
  quiz_flow: {
    title: string
    questions: { question: string; options: string[] }[]
    result_cta: string
  }
  email_sequence: {
    subject: string
    preview: string
    purpose: string
    send_day: number
  }[]
}

export function generateFunnelPack(teardown: AppTeardown): FunnelPack {
  const name = teardown.app_name
  const cat = teardown.category
  const price = teardown.monetization_model.pricing_tiers[1]?.price || '$4.99/mês'

  return {
    landing_page: {
      headline: `O app de ${cat.toLowerCase()} que faltava no Brasil`,
      subheadline: `Tudo que o ${name} oferece nos EUA — agora em português, mais barato e feito pra você.`,
      cta: `Teste grátis por ${teardown.monetization_model.trial_days} dias`,
      hero_bullets: [
        teardown.core_features[0] || 'Funcionalidade principal completa',
        `${teardown.monetization_model.trial_days} dias grátis, sem cartão`,
        `A partir de ${price}`,
        '100% em português',
      ],
      social_proof: '+1.000 pessoas já estão usando',
      urgency: `Oferta de lançamento: ${price} (preço sobe em breve)`,
    },
    quiz_flow: {
      title: `Descubra como ${cat === 'Finance' ? 'organizar suas finanças' : cat === 'Health & Fitness' ? 'atingir seus objetivos fitness' : cat === 'Education' ? 'acelerar seu aprendizado' : cat === 'Productivity' ? 'dobrar sua produtividade' : 'melhorar sua rotina'}`,
      questions: [
        {
          question: `Qual seu maior desafio com ${cat.toLowerCase()}?`,
          options: ['Não sei por onde começar', 'Já tentei outros apps', 'Preciso de algo em português', 'Quero algo mais barato'],
        },
        {
          question: 'Com que frequência você usaria o app?',
          options: ['Todo dia', 'Algumas vezes por semana', 'Quando precisar', 'Não sei ainda'],
        },
        {
          question: 'O que mais importa pra você?',
          options: ['Facilidade de uso', 'Preço acessível', 'Funcionalidades completas', 'Suporte em português'],
        },
      ],
      result_cta: `Perfeito! Seu plano personalizado está pronto. Comece grátis agora.`,
    },
    email_sequence: [
      { subject: `Bem-vindo! Seu trial de ${teardown.monetization_model.trial_days} dias começou`, preview: 'Veja como aproveitar ao máximo', purpose: 'Onboarding + first value', send_day: 0 },
      { subject: `Você já experimentou ${teardown.core_features[0]?.toLowerCase() || 'a feature principal'}?`, preview: 'A maioria dos usuários começa por aqui', purpose: 'Feature highlight + engagement', send_day: 1 },
      { subject: 'Dica: como os melhores usuários usam o app', preview: '3 truques que fazem diferença', purpose: 'Social proof + tips', send_day: 3 },
      { subject: `Seu trial acaba em ${Math.ceil(teardown.monetization_model.trial_days / 2)} dias`, preview: `Garanta o preço de lançamento: ${price}`, purpose: 'Mid-trial urgency', send_day: Math.ceil(teardown.monetization_model.trial_days / 2) },
      { subject: 'Último dia do seu trial gratuito', preview: `Assine agora por apenas ${price}`, purpose: 'Trial expiry conversion', send_day: teardown.monetization_model.trial_days - 1 },
      { subject: 'Sentimos sua falta...', preview: 'Oferta especial de retorno', purpose: 'Win-back (desconto)', send_day: teardown.monetization_model.trial_days + 3 },
    ],
  }
}

// --- Fase 4: Go-to-Market ---

export interface GTMPack {
  ad_creatives: {
    platform: string
    format: string
    headline: string
    primary_text: string
    cta: string
  }[]
  social_accounts: {
    platform: string
    handle_suggestion: string
    bio: string
    setup_done: boolean
  }[]
  launch_checklist: { id: string; label: string; done: boolean }[]
}

export function generateGTMPack(teardown: AppTeardown): GTMPack {
  const name = teardown.app_name
  const cat = teardown.category
  const price = teardown.monetization_model.pricing_tiers[1]?.price || '$4.99/mês'
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '')

  return {
    ad_creatives: [
      {
        platform: 'Meta (Feed)',
        format: 'Imagem 1080x1080',
        headline: `Chega de pagar caro por app de ${cat.toLowerCase()}`,
        primary_text: `O ${name} cobra 3x mais e nem tem em português. Testamos e criamos uma versão melhor — a partir de ${price}. Teste grátis por ${teardown.monetization_model.trial_days} dias.`,
        cta: 'Baixar Grátis',
      },
      {
        platform: 'Meta (Stories)',
        format: 'Vídeo 9:16 (15s)',
        headline: `${name} em português por ${price}`,
        primary_text: 'Hook: "Você ainda paga caro num app que nem tem em português?" → Mostrar o app → CTA download',
        cta: 'Saiba Mais',
      },
      {
        platform: 'TikTok/Kwai',
        format: 'Vídeo UGC 9:16 (30s)',
        headline: `Descobri a versão brasileira do ${name}`,
        primary_text: 'Hook: "POV: você descobre que existe uma versão brasileira do [app gringo]" → Screen recording do app → Reação → CTA',
        cta: 'Link na Bio',
      },
      {
        platform: 'Google Ads (Search)',
        format: 'Texto',
        headline: `${cat} App - Grátis por ${teardown.monetization_model.trial_days} dias`,
        primary_text: `Alternativa ao ${name} em português. Mais barato, mais simples. Baixe agora.`,
        cta: 'Instalar',
      },
    ],
    social_accounts: [
      { platform: 'Instagram', handle_suggestion: `@${slug}.app`, bio: `O app de ${cat.toLowerCase()} feito pro Brasil. ${price}/mês. Link na bio.`, setup_done: false },
      { platform: 'TikTok', handle_suggestion: `@${slug}app`, bio: `${cat} simplificado. Teste grátis.`, setup_done: false },
      { platform: 'Twitter/X', handle_suggestion: `@${slug}_app`, bio: `Alternativa brasileira ao ${name}. ${cat}. ${price}/mês.`, setup_done: false },
    ],
    launch_checklist: [
      { id: 'g1', label: 'Criar conta de anúncios Meta Business', done: false },
      { id: 'g2', label: 'Criar conta TikTok Ads', done: false },
      { id: 'g3', label: 'Instalar pixel Meta no app/landing', done: false },
      { id: 'g4', label: 'Gravar 3 vídeos UGC (15-30s cada)', done: false },
      { id: 'g5', label: 'Criar 5 variações de imagem para feed', done: false },
      { id: 'g6', label: 'Configurar campanha Meta ($10/dia teste)', done: false },
      { id: 'g7', label: 'Configurar campanha TikTok ($10/dia teste)', done: false },
      { id: 'g8', label: 'Publicar 3 posts orgânicos no Instagram', done: false },
      { id: 'g9', label: 'Publicar 2 vídeos orgânicos no TikTok', done: false },
      { id: 'g10', label: 'Monitorar CPI e CPA por 48h', done: false },
    ],
  }
}
