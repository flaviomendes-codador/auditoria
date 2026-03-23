import type { RadarSelection } from './radar-db'
import type { AppDeepProfile, PricingTier } from '@/types/deep-profile'

// ============================================================
// FACTORY ENGINE — Agente 2: Fabrica de MVPs
// REESCRITO: usa AppDeepProfile (dados reais) em vez de templates
// Todas as funcoes recebem o profile real do app analisado
// ============================================================

// --- PRICING: Clone = Original - 20% ---

function clonePricing(original: PricingTier[]): PricingTier[] {
  if (original.length === 0) {
    return [
      { name: 'Free', price: '$0', price_value: 0, period: 'free', features: ['Funcionalidades basicas', 'Uso limitado', 'Com anuncios discretos'] },
      { name: 'Pro', price: '$3.99/month', price_value: 3.99, period: 'monthly', features: ['Tudo do Free', 'Uso ilimitado', 'Sem anuncios'] },
      { name: 'Premium', price: '$7.99/month', price_value: 7.99, period: 'monthly', features: ['Tudo do Pro', 'Features avancadas', 'Suporte prioritario'] },
    ]
  }

  return original.map(tier => {
    if (tier.price_value === 0) return { ...tier }
    const clonePrice = Math.round(tier.price_value * 0.80 * 100) / 100 // -20%
    return {
      ...tier,
      name: tier.name,
      price: `$${clonePrice}/${tier.period === 'yearly' ? 'year' : tier.period === 'one-time' ? 'once' : 'month'}`,
      price_value: clonePrice,
    }
  })
}

// --- Fase 1: Analise & Modelagem (REAL) ---

export interface AppTeardown {
  app_name: string
  category: string
  value_proposition: string
  core_features: string[]
  loved_features: string[]
  pain_points: string[]
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
    original_pricing: PricingTier[]
    clone_pricing: PricingTier[]
    trial_days: number
  }
  estimated_days: number
  target_markets: string[]
  competitive_edge: string
  icp: AppDeepProfile['icp']
  competitors_local: AppDeepProfile['competitors_local']
  market_sizing: AppDeepProfile['market_sizing']
  positioning: string[]
  gap_analysis: AppDeepProfile['gap_analysis']
  languages_supported: string[]
  screenshots_count: number
  content_rating: string
  tech_stack_original: string[]
}

function inferStackFromProfile(profile: AppDeepProfile, category: string): AppTeardown['stack_recommendation'] {
  const hasCamera = profile.permissions.some(p => /camera|photo/i.test(p))
  const hasLocation = profile.permissions.some(p => /location|gps/i.test(p))
  const hasPayments = profile.tech_stack_detected.some(t => /stripe|paddle|paypal/i.test(t))
  const hasRealtime = profile.permissions.some(p => /contacts|phone/i.test(p)) || category === 'Social'
  const featureCount = profile.real_features.length

  const extras: string[] = []
  if (hasCamera) extras.push('Camera/Image Picker')
  if (hasLocation) extras.push('Geolocation API')
  if (hasPayments || true) extras.push('RevenueCat (IAP)')
  if (hasRealtime) extras.push('Supabase Realtime')
  extras.push('Push Notifications (Expo)')
  extras.push('Analytics (PostHog)')

  if (category === 'Finance') extras.push('PIX API (BR)', 'UPI (IN)')
  if (category === 'Health & Fitness') extras.push('HealthKit/Google Fit')
  if (category === 'Education') extras.push('Video Player', 'Quiz Engine')

  return {
    frontend: featureCount > 10 ? 'React Native (Expo) + NativeWind' : 'React Native (Expo)',
    backend: 'Next.js API Routes + Supabase Edge Functions',
    database: hasRealtime ? 'Supabase (PostgreSQL + Realtime + RLS)' : 'Supabase (PostgreSQL + RLS)',
    deploy: 'Vercel (web) + EAS Build (mobile)',
    extras: extras.slice(0, 8),
  }
}

function estimateDaysFromProfile(profile: AppDeepProfile): number {
  const featureCount = profile.real_features.length
  const screenshotCount = profile.screenshots_ios.length + profile.screenshots_android.length
  const hasPayments = profile.pricing_tiers_real.length > 1
  const hasComplexFeatures = profile.permissions.length > 5

  let days = 3 // base
  days += Math.ceil(featureCount * 0.5) // ~0.5 dias por feature
  days += Math.ceil(screenshotCount * 0.3) // telas = complexidade visual
  if (hasPayments) days += 2
  if (hasComplexFeatures) days += 3

  return Math.max(5, Math.min(30, days))
}

export function generateTeardown(selection: RadarSelection, profile: AppDeepProfile): AppTeardown {
  const category = selection.category || 'Utilities'

  // Features reais do app (nao de dicionario)
  const core_features = profile.real_features.length > 0
    ? profile.real_features
    : [`Feature principal de ${category}`, 'Dashboard', 'Configuracoes', 'Perfil']

  // Features elogiadas nos reviews
  const loved_features = profile.reviews_positive.map(r => r.theme)

  // Pain points reais dos reviews negativos
  const pain_points = profile.reviews_negative.map(r => `${r.theme} (${r.frequency}x mencionado)`)

  // Melhorias derivadas dos dados reais
  const improvements: string[] = []
  if (profile.gap_analysis.language_gap) {
    const missing: string[] = []
    if (!profile.languages.some(l => /^pt/i.test(l))) missing.push('PT-BR')
    if (!profile.languages.some(l => /^es/i.test(l))) missing.push('ES')
    if (!profile.languages.some(l => /^hi/i.test(l))) missing.push('Hindi')
    improvements.push(`Localizacao completa: ${missing.join(', ')} (original so tem ${profile.languages.slice(0, 5).join(', ') || 'EN'})`)
  }
  if (profile.gap_analysis.pricing_gap) {
    const maxOriginal = Math.max(...profile.pricing_tiers_real.map(t => t.price_value), 0)
    improvements.push(`Pricing 20% mais barato: original cobra $${maxOriginal}/mes`)
  }
  for (const pain of profile.reviews_negative.slice(0, 3)) {
    improvements.push(`Resolver: "${pain.theme}" — mencionado ${pain.frequency}x em reviews negativos`)
  }
  if (profile.gap_analysis.local_payment_gap) {
    improvements.push('Integrar pagamentos locais: PIX (BR), OXXO (MX), UPI (IN)')
  }
  if (profile.gap_analysis.ux_gaps.length > 0) {
    improvements.push(`UX superior: resolver ${profile.gap_analysis.ux_gaps.join(', ')}`)
  }

  // Competitive edge real
  const edges = profile.positioning.slice(0, 3)
  const competitive_edge = edges.join('. ') || `Clone localizado de ${selection.app_name} com 20% desconto`

  return {
    app_name: selection.app_name,
    category,
    value_proposition: profile.value_proposition,
    core_features,
    loved_features,
    pain_points,
    improvements,
    stack_recommendation: inferStackFromProfile(profile, category),
    monetization_model: {
      type: selection.monetization || 'Free + IAP',
      original_pricing: profile.pricing_tiers_real,
      clone_pricing: clonePricing(profile.pricing_tiers_real),
      trial_days: 7,
    },
    estimated_days: estimateDaysFromProfile(profile),
    target_markets: selection.target_markets || ['Brasil', 'Mexico', 'India'],
    competitive_edge,
    icp: profile.icp,
    competitors_local: profile.competitors_local,
    market_sizing: profile.market_sizing,
    positioning: profile.positioning,
    gap_analysis: profile.gap_analysis,
    languages_supported: profile.languages,
    screenshots_count: profile.screenshots_ios.length + profile.screenshots_android.length,
    content_rating: profile.content_rating,
    tech_stack_original: profile.tech_stack_detected,
  }
}

// --- Fase 2: Build Checklist (baseada em features REAIS) ---

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
        { id: 'b4', label: 'Configurar autenticacao (Supabase Auth)', done: false },
        { id: 'b5', label: 'Setup CI/CD e ambiente de staging', done: false },
      ],
    },
    {
      name: `Features Core (${teardown.core_features.length} features reais do app)`,
      items: teardown.core_features.map((f, i) => ({
        id: `f${i}`,
        label: `Implementar: ${f}`,
        done: false,
      })),
    },
    {
      name: `Resolver Pain Points (${teardown.pain_points.length} dores dos usuarios)`,
      items: teardown.pain_points.slice(0, 5).map((p, i) => ({
        id: `p${i}`,
        label: `Fix: ${p}`,
        done: false,
      })),
    },
    {
      name: 'Monetizacao',
      items: [
        { id: 'm1', label: `Integrar RevenueCat para ${teardown.monetization_model.type}`, done: false },
        { id: 'm2', label: `Criar paywall com ${teardown.monetization_model.clone_pricing.length} tiers (20% mais barato que original)`, done: false },
        { id: 'm3', label: `Implementar trial de ${teardown.monetization_model.trial_days} dias`, done: false },
        { id: 'm4', label: 'Testar fluxo completo de compra', done: false },
        ...(teardown.gap_analysis.local_payment_gap ? [
          { id: 'm5', label: 'Integrar PIX (BR)', done: false },
          { id: 'm6', label: 'Integrar UPI (IN)', done: false },
        ] : []),
      ],
    },
    {
      name: 'Localizacao',
      items: teardown.target_markets.map((m, i) => ({
        id: `l${i}`,
        label: `Traduzir para ${m === 'Brasil' ? 'PT-BR' : m === 'Mexico' ? 'ES-MX' : m === 'India' ? 'Hindi/EN-IN' : m}`,
        done: false,
      })),
    },
    {
      name: 'Deploy & App Store',
      items: [
        { id: 'd1', label: 'Build de producao', done: false },
        { id: 'd2', label: `Screenshots para App Store (${teardown.screenshots_count} telas do original como referencia)`, done: false },
        { id: 'd3', label: 'Icone do app (1024x1024)', done: false },
        { id: 'd4', label: 'Descricao ASO otimizada (PT-BR, ES, EN)', done: false },
        { id: 'd5', label: 'Submeter para Apple Review', done: false },
        { id: 'd6', label: 'Submeter para Google Play', done: false },
        { id: 'd7', label: 'Testar em device real', done: false },
      ],
    },
  ]

  const total = phases.reduce((sum, p) => sum + p.items.length, 0)
  return { phases, total_items: total, completed_items: 0 }
}

// --- Fase 3: Funis & Copy (baseados em ICP e pain points REAIS) ---

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
  const icp = teardown.icp
  const clonePrice = teardown.monetization_model.clone_pricing.find(t => t.price_value > 0)?.price || '$3.99/month'
  const topFeature = teardown.core_features[0] || 'funcionalidade principal'
  const painPoint = icp.primary_pain || 'falta de opcoes acessiveis'

  return {
    landing_page: {
      headline: `Resolva "${painPoint}" de vez — em portugues, por ${clonePrice}`,
      subheadline: `Tudo que o ${name} oferece nos EUA, agora localizado para voce. ${teardown.core_features.slice(0, 3).join(', ')} e mais.`,
      cta: `Teste gratis por ${teardown.monetization_model.trial_days} dias`,
      hero_bullets: [
        topFeature,
        `${teardown.monetization_model.trial_days} dias gratis, sem cartao`,
        `A partir de ${clonePrice} (20% mais barato que ${name})`,
        `100% em ${icp.language_gap.length > 0 ? icp.language_gap[0] : 'portugues'}`,
        ...(teardown.loved_features.length > 0 ? [`${teardown.loved_features[0]} — a feature mais amada pelos usuarios`] : []),
      ].slice(0, 5),
      social_proof: teardown.competitors_local.length > 0
        ? `Melhor avaliado que ${teardown.competitors_local.filter(c => c.rating < 4).length} concorrentes locais`
        : '+1.000 pessoas ja estao usando',
      urgency: `Oferta de lancamento: ${clonePrice} (preco sobe em breve)`,
    },
    quiz_flow: {
      title: `Descubra como resolver "${painPoint}"`,
      questions: [
        {
          question: `Qual seu maior desafio com ${teardown.category.toLowerCase()}?`,
          options: [
            icp.primary_pain,
            ...(icp.secondary_pains.slice(0, 2)),
            'Outro',
          ].filter(Boolean).slice(0, 4),
        },
        {
          question: 'O que mais te frustra nos apps que voce ja tentou?',
          options: [
            ...teardown.pain_points.slice(0, 3).map(p => p.split('(')[0].trim()),
            'Nenhum me atendeu bem',
          ].slice(0, 4),
        },
        {
          question: 'O que mais importa pra voce?',
          options: ['App em portugues', 'Preco justo', `${topFeature}`, 'Facilidade de uso'],
        },
      ],
      result_cta: `Perfeito! Seu plano personalizado esta pronto. Comece gratis agora.`,
    },
    email_sequence: [
      { subject: `Bem-vindo! Seu trial de ${teardown.monetization_model.trial_days} dias comecou`, preview: `Veja como usar ${topFeature}`, purpose: 'Onboarding + first value', send_day: 0 },
      { subject: `Voce ja experimentou "${topFeature}"?`, preview: 'A maioria dos usuarios comeca por aqui', purpose: 'Feature highlight + engagement', send_day: 1 },
      { subject: `Como resolver "${painPoint}" em 3 passos`, preview: 'Dica dos nossos melhores usuarios', purpose: 'Pain point solution + social proof', send_day: 3 },
      { subject: `Seu trial acaba em ${Math.ceil(teardown.monetization_model.trial_days / 2)} dias`, preview: `Garanta ${clonePrice} — 20% mais barato que ${name}`, purpose: 'Mid-trial urgency', send_day: Math.ceil(teardown.monetization_model.trial_days / 2) },
      { subject: 'Ultimo dia do seu trial gratuito', preview: `Assine agora por apenas ${clonePrice}`, purpose: 'Trial expiry conversion', send_day: teardown.monetization_model.trial_days - 1 },
      { subject: 'Sentimos sua falta...', preview: 'Oferta especial de retorno', purpose: 'Win-back (desconto extra 10%)', send_day: teardown.monetization_model.trial_days + 3 },
    ],
  }
}

// --- Fase 4: Go-to-Market (baseado em ICP e posicionamento REAL) ---

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
  const icp = teardown.icp
  const clonePrice = teardown.monetization_model.clone_pricing.find(t => t.price_value > 0)?.price || '$3.99/month'
  const painPoint = icp.primary_pain
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const topFeature = teardown.core_features[0] || teardown.category.toLowerCase()

  return {
    ad_creatives: [
      {
        platform: 'Meta (Feed)',
        format: 'Imagem 1080x1080',
        headline: `"${painPoint}" — resolvido por ${clonePrice}/mes`,
        primary_text: `O ${name} cobra mais e nem tem em portugues. Criamos uma versao melhor: ${teardown.core_features.slice(0, 3).join(', ')}. Teste gratis por ${teardown.monetization_model.trial_days} dias.`,
        cta: 'Baixar Gratis',
      },
      {
        platform: 'Meta (Stories)',
        format: 'Video 9:16 (15s)',
        headline: `${name} em portugues por ${clonePrice}`,
        primary_text: `Hook: "Voce ainda sofre com ${painPoint}?" -> Mostrar o app resolvendo -> CTA download`,
        cta: 'Saiba Mais',
      },
      {
        platform: 'TikTok/Kwai',
        format: 'Video UGC 9:16 (30s)',
        headline: `Descobri a versao brasileira do ${name}`,
        primary_text: `Hook: "POV: voce descobre que existe ${topFeature} em portugues por ${clonePrice}" -> Screen recording -> Reacao -> CTA`,
        cta: 'Link na Bio',
      },
      {
        platform: 'Google Ads (Search)',
        format: 'Texto',
        headline: `${teardown.category} App - Gratis por ${teardown.monetization_model.trial_days} dias`,
        primary_text: `Alternativa ao ${name} em portugues. 20% mais barato. ${topFeature}. Baixe agora.`,
        cta: 'Instalar',
      },
    ],
    social_accounts: [
      {
        platform: 'Instagram',
        handle_suggestion: `@${slug}.app`,
        bio: `${topFeature} em portugues. ${clonePrice}/mes. ${teardown.positioning[0] || 'Feito pro Brasil'}. Link na bio.`,
        setup_done: false,
      },
      {
        platform: 'TikTok',
        handle_suggestion: `@${slug}app`,
        bio: `${teardown.category} simplificado. Resolve "${painPoint}". Teste gratis.`,
        setup_done: false,
      },
      {
        platform: 'Twitter/X',
        handle_suggestion: `@${slug}_app`,
        bio: `Alternativa brasileira ao ${name}. ${teardown.category}. ${clonePrice}/mes.`,
        setup_done: false,
      },
    ],
    launch_checklist: [
      { id: 'g1', label: 'Criar conta de anuncios Meta Business', done: false },
      { id: 'g2', label: 'Criar conta TikTok Ads', done: false },
      { id: 'g3', label: 'Instalar pixel Meta no app/landing', done: false },
      { id: 'g4', label: `Gravar 3 videos UGC focados em "${painPoint}" (15-30s cada)`, done: false },
      { id: 'g5', label: `Criar 5 variacoes de imagem comparando com ${name}`, done: false },
      { id: 'g6', label: `Configurar campanha Meta ($10/dia) — ICP: ${icp.age_range}, ${icp.gender_skew}`, done: false },
      { id: 'g7', label: 'Configurar campanha TikTok ($10/dia)', done: false },
      { id: 'g8', label: 'Publicar 3 posts organicos no Instagram', done: false },
      { id: 'g9', label: 'Publicar 2 videos organicos no TikTok', done: false },
      { id: 'g10', label: 'Monitorar CPI e CPA por 48h', done: false },
    ],
  }
}
