import { fetchMultipleCountries, calcOpportunityScore, estimateMRRRange, estimatePenetration, isGlobalMegaApp, fetchAppLookupBatch, ITUNES_CATEGORIES } from './itunes'
import type { MRREstimate, ItunesCountry } from './itunes'
import { fetchGPlayMultipleCountries, isGPlayMegaApp, estimateAndroidMRR } from './google-play'
import { fetchTrendData, calcTrendScore, categoryToSearchTerms } from './google-trends'
import { cache, TTL } from './cache'

// ============================================================
// RADAR SCANNER — MVP Factory Intelligence
// Escaneia TODAS as categorias, cruza US vs LatAm/India,
// aplica scoring para encontrar oportunidades de clone/MVP
// Fontes: iTunes App Store + Google Play Store + Google Trends
// ============================================================

export interface RadarApp {
  appId: string
  bundleId: string
  name: string
  icon: string
  category: string
  storeUrl: string
  price: number
  // Rankings por país
  rankUS: number
  rankBR: number | null
  rankMX: number | null
  rankIN: number | null
  rankGB: number | null
  // Revenue
  mrr_estimated: number
  mrr_range: MRREstimate
  // Scores
  opportunity_score: number
  clone_difficulty: 'Easy' | 'Medium' | 'Hard'
  radar_score: number // Score final ponderado para MVP factory
  // Penetração
  latam_penetration: number
  india_penetration: number
  latam_absent: boolean // Não aparece no top grossing LatAm
  india_absent: boolean // Não aparece no top grossing India
  // Reviews
  reviewCount: number
  rating: number
  // Monetização
  monetization: 'Free + IAP' | 'Subscription' | 'Paid' | 'Unknown'
  // Android (Google Play)
  androidMatch: boolean          // Encontrado também no Google Play
  androidRankUS: number | null
  androidRankBR: number | null
  androidRankIN: number | null
  androidInstalls: string        // "1,000,000+" format
  androidMRR: number             // MRR estimado Android
  combinedMRR: number            // iOS + Android MRR estimado
  platform: 'iOS' | 'Android' | 'Both'
  // Google Trends
  trendScore: number             // 0-100 baseado no Google Trends
  trendDirection: 'rising' | 'stable' | 'declining' | 'unknown'
  // Metadata
  why_opportunity: string[]
  suggested_improvements: string[]
  target_markets: string[]
  data_sources: string[]
  last_scanned: string
}

export interface RadarReport {
  scanned_at: string
  total_scanned: number
  total_qualified: number
  categories_scanned: string[]
  top_apps: RadarApp[]
  scan_duration_ms: number
  data_sources: string[]
  android_coverage: number      // % de apps com match Android
  trending_categories: string[] // categorias com trend rising
  filters_applied: {
    min_mrr: number
    monetization: string
    markets: string[]
  }
}

// Critérios eliminatórios e de scoring
const RADAR_CONFIG = {
  MIN_MRR: 30_000,                    // MRR mínimo $30K
  MONETIZATION_FILTER: 'iap_only',    // Apenas in-app purchase, não ads
  SCAN_LIMIT_PER_CATEGORY: 100,       // Top 100 por categoria
  TARGET_COUNTRIES: ['br', 'mx', 'in', 'gb'] as ItunesCountry[],

  // Pesos do Radar Score (total = 100)
  WEIGHTS: {
    mrr_strength: 12,        // MRR alto = mercado validado
    gap_latam: 22,           // Gap grande em LatAm = oportunidade
    gap_india: 12,           // Gap grande em India = oportunidade
    low_complexity: 18,      // Fácil de clonar = prioridade MVP
    review_sentiment: 8,     // Reviews ruins = espaço pra melhorar
    monetization_fit: 13,    // IAP/subscription = nosso modelo
    cross_platform: 8,       // Presente em ambas as stores = mercado maior
    trend_momentum: 7,       // Google Trends crescendo = timing bom
  }
}

// Classificar dificuldade de clone baseado na categoria e tipo de app
function classifyCloneDifficulty(category: string, price: number, reviewCount: number): 'Easy' | 'Medium' | 'Hard' {
  const easyCategories = ['Utilities', 'Lifestyle', 'Productivity', 'Education']
  const hardCategories = ['Social', 'Entertainment']

  if (hardCategories.includes(category)) return 'Hard'
  if (easyCategories.includes(category) && reviewCount < 50000) return 'Easy'
  if (reviewCount > 200000) return 'Hard'
  if (reviewCount > 50000) return 'Medium'
  return 'Easy'
}

// Classificar tipo de monetização
function classifyMonetization(price: number): RadarApp['monetization'] {
  if (price === 0) return 'Free + IAP'
  if (price >= 4.99) return 'Subscription'
  if (price > 0) return 'Paid'
  return 'Unknown'
}

// Gerar razões de oportunidade
function generateWhyOpportunity(app: {
  rankUS: number, rankBR: number | null, rankMX: number | null, rankIN: number | null,
  mrr_estimated: number, rating: number, reviewCount: number, category: string
}): string[] {
  const reasons: string[] = []

  if (app.mrr_estimated >= 100_000) {
    reasons.push(`MRR estimado $${(app.mrr_estimated / 1000).toFixed(0)}K — mercado altamente validado`)
  } else if (app.mrr_estimated >= 50_000) {
    reasons.push(`MRR estimado $${(app.mrr_estimated / 1000).toFixed(0)}K — mercado validado`)
  } else {
    reasons.push(`MRR estimado $${(app.mrr_estimated / 1000).toFixed(0)}K — mercado com potencial`)
  }

  if (app.rankBR === null && app.rankMX === null) {
    reasons.push('Ausente do top grossing em TODA a LatAm — zero concorrência local')
  } else if (app.rankBR === null) {
    reasons.push('Ausente do top grossing no Brasil — mercado aberto')
  }

  if (app.rankIN === null) {
    reasons.push('Ausente do top grossing na Índia — 1.4B de potenciais usuários')
  }

  if (app.rating < 4.0 && app.reviewCount > 1000) {
    reasons.push(`Rating ${app.rating.toFixed(1)}★ com ${app.reviewCount.toLocaleString()} reviews — usuários insatisfeitos = oportunidade de melhoria`)
  }

  if (app.rankUS <= 20) {
    reasons.push(`Top ${app.rankUS} nos EUA em ${app.category} — demanda comprovada massiva`)
  } else if (app.rankUS <= 50) {
    reasons.push(`Top ${app.rankUS} nos EUA — demanda comprovada`)
  }

  return reasons
}

// Sugestões de melhoria baseadas nos dados
function generateImprovements(app: {
  rating: number, reviewCount: number, price: number, category: string,
  rankBR: number | null, rankIN: number | null
}): string[] {
  const improvements: string[] = []

  improvements.push('Localização completa (PT-BR, ES, Hindi)')

  if (app.price > 0) {
    improvements.push('Modelo freemium com trial — reduzir barreira de entrada')
  }

  if (app.rating < 4.2) {
    improvements.push('UX melhorada — resolver dores dos reviews negativos')
  }

  improvements.push('Pricing adaptado (50-70% mais barato que o original)')
  improvements.push('Onboarding simplificado com quiz personalizado')

  if (app.category === 'Health & Fitness' || app.category === 'Education') {
    improvements.push('Gamificação e streaks para retenção')
  }

  if (app.category === 'Finance') {
    improvements.push('Integração com bancos/PIX locais')
  }

  return improvements
}

// Calcular Radar Score — score ponderado final para priorização MVP
function calcRadarScore(app: {
  mrr_estimated: number
  opportunity_score: number
  clone_difficulty: 'Easy' | 'Medium' | 'Hard'
  rating: number
  reviewCount: number
  monetization: string
  latam_absent: boolean
  india_absent: boolean
  latam_penetration: number
  india_penetration: number
  androidMatch?: boolean
  combinedMRR?: number
  trendScore?: number
}): number {
  const w = RADAR_CONFIG.WEIGHTS
  let score = 0

  // MRR strength: quanto maior o MRR, mais validado o mercado
  const mrr = app.combinedMRR || app.mrr_estimated
  if (mrr >= 500_000) score += w.mrr_strength
  else if (mrr >= 200_000) score += w.mrr_strength * 0.85
  else if (mrr >= 100_000) score += w.mrr_strength * 0.7
  else if (mrr >= 50_000) score += w.mrr_strength * 0.5
  else score += w.mrr_strength * 0.3

  // Gap LatAm: quanto maior o gap, melhor
  if (app.latam_absent) score += w.gap_latam
  else if (app.latam_penetration < 10) score += w.gap_latam * 0.8
  else if (app.latam_penetration < 30) score += w.gap_latam * 0.5
  else score += w.gap_latam * 0.2

  // Gap India
  if (app.india_absent) score += w.gap_india
  else if (app.india_penetration < 10) score += w.gap_india * 0.8
  else if (app.india_penetration < 30) score += w.gap_india * 0.5
  else score += w.gap_india * 0.2

  // Clone difficulty: fácil = mais pontos (MVP factory prioriza velocidade)
  if (app.clone_difficulty === 'Easy') score += w.low_complexity
  else if (app.clone_difficulty === 'Medium') score += w.low_complexity * 0.5
  else score += w.low_complexity * 0.15

  // Review sentiment: rating baixo = oportunidade de fazer melhor
  if (app.rating > 0 && app.rating < 3.5 && app.reviewCount > 500) score += w.review_sentiment
  else if (app.rating < 4.0 && app.reviewCount > 1000) score += w.review_sentiment * 0.7
  else if (app.rating < 4.3) score += w.review_sentiment * 0.4
  else score += w.review_sentiment * 0.2

  // Monetization fit: IAP e subscription = nosso modelo
  if (app.monetization === 'Free + IAP' || app.monetization === 'Subscription') score += w.monetization_fit
  else if (app.monetization === 'Paid') score += w.monetization_fit * 0.4
  else score += w.monetization_fit * 0.1

  // Cross-platform: presente em iOS + Android = mercado maior e validado
  if (app.androidMatch) score += w.cross_platform
  else score += w.cross_platform * 0.3

  // Trend momentum: Google Trends crescendo = bom timing
  const ts = app.trendScore ?? 50
  if (ts >= 70) score += w.trend_momentum
  else if (ts >= 50) score += w.trend_momentum * 0.5
  else score += w.trend_momentum * 0.1

  return Math.round(score)
}

// Buscar trend data por categoria (com fallback silencioso)
async function getCategoryTrend(category: string): Promise<{ score: number; direction: 'rising' | 'stable' | 'declining' | 'unknown' }> {
  try {
    const terms = categoryToSearchTerms(category)
    const trend = await fetchTrendData(terms[0])
    if (trend) return { score: calcTrendScore(trend), direction: trend.trend }
  } catch { /* silencioso */ }
  return { score: 50, direction: 'unknown' }
}

// Scan completo — escaneia todas as categorias com iOS + Android + Trends
export async function runRadarScan(): Promise<RadarReport & { fromCache?: boolean }> {
  const cacheKey = 'radar:full-scan-v2'
  const cached = cache.get<RadarReport>(cacheKey)
  if (cached) return { ...cached, fromCache: true }

  const t0 = Date.now()
  const allApps: RadarApp[] = []
  const categories = Object.keys(ITUNES_CATEGORIES)
  const trendingCategories: string[] = []

  // Buscar trends de todas as categorias em paralelo
  const trendResults = await Promise.allSettled(
    categories.map(cat => getCategoryTrend(cat))
  )
  const categoryTrends: Record<string, { score: number; direction: string }> = {}
  categories.forEach((cat, i) => {
    const result = trendResults[i]
    const trend = result.status === 'fulfilled' ? result.value : { score: 50, direction: 'unknown' }
    categoryTrends[cat] = trend
    if (trend.direction === 'rising') trendingCategories.push(cat)
  })

  // Escanear todas as categorias em paralelo (batches de 3)
  for (let i = 0; i < categories.length; i += 3) {
    const batch = categories.slice(i, i + 3)
    const batchResults = await Promise.allSettled(
      batch.map(cat => scanCategory(cat, categoryTrends[cat]))
    )

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        allApps.push(...result.value)
      }
    }
  }

  // Deduplicar por bundleId
  const seen = new Set<string>()
  const unique = allApps.filter(app => {
    if (seen.has(app.bundleId)) return false
    seen.add(app.bundleId)
    return true
  })

  // Filtros eliminatórios
  const qualified = unique.filter(app => {
    if (app.combinedMRR < RADAR_CONFIG.MIN_MRR && app.mrr_estimated < RADAR_CONFIG.MIN_MRR) return false
    if (app.monetization === 'Paid' && app.price > 0 && app.price < 2) return false
    return true
  })

  qualified.sort((a, b) => b.radar_score - a.radar_score)

  const androidCount = qualified.filter(a => a.androidMatch).length

  const report: RadarReport = {
    scanned_at: new Date().toISOString(),
    total_scanned: unique.length,
    total_qualified: qualified.length,
    categories_scanned: categories,
    top_apps: qualified.slice(0, 30),
    scan_duration_ms: Date.now() - t0,
    data_sources: [
      'iTunes App Store RSS (rankings reais iOS)',
      'Google Play Store (rankings reais Android)',
      'Google Trends (validação de demanda)',
    ],
    android_coverage: qualified.length > 0 ? Math.round((androidCount / qualified.length) * 100) : 0,
    trending_categories: trendingCategories,
    filters_applied: {
      min_mrr: RADAR_CONFIG.MIN_MRR,
      monetization: 'In-App Purchase / Subscription (excluindo ads-only)',
      markets: ['US (base)', 'BR', 'MX', 'IN', 'GB'],
    }
  }

  cache.set(cacheKey, report, TTL.LONG)
  return report
}

// Scan de uma categoria específica com iOS + Android + Trends
async function scanCategory(
  category: string,
  trendInfo?: { score: number; direction: string }
): Promise<RadarApp[]> {
  const limit = RADAR_CONFIG.SCAN_LIMIT_PER_CATEGORY

  // Buscar iOS e Android em paralelo
  const [itunesData, gplayData] = await Promise.all([
    fetchMultipleCountries(category, ['us', ...RADAR_CONFIG.TARGET_COUNTRIES], limit),
    fetchGPlayMultipleCountries(category, ['us', 'br', 'in'], Math.min(limit, 60)).catch(() => ({} as Record<string, any[]>)),
  ])

  const us = itunesData['us'] || []
  if (us.length === 0) return []

  const brMap = new Map((itunesData['br'] || []).map(a => [a.bundleId, a.rank]))
  const mxMap = new Map((itunesData['mx'] || []).map(a => [a.bundleId, a.rank]))
  const inMap = new Map((itunesData['in'] || []).map(a => [a.bundleId, a.rank]))
  const gbMap = new Map((itunesData['gb'] || []).map(a => [a.bundleId, a.rank]))

  // Google Play maps — indexar por nome normalizado (cross-platform matching)
  const gplayUS = gplayData['us'] || []
  const gplayBR = gplayData['br'] || []
  const gplayIN = gplayData['in'] || []

  const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)
  const gplayUSMap = new Map(gplayUS.map(a => [normalize(a.title), a]))
  const gplayBRMap = new Map(gplayBR.map(a => [normalize(a.title), a]))
  const gplayINMap = new Map(gplayIN.map(a => [normalize(a.title), a]))

  const lookupData = await fetchAppLookupBatch(us.map(a => a.appId))

  const trendScore = trendInfo?.score ?? 50
  const trendDirection = (trendInfo?.direction ?? 'unknown') as 'rising' | 'stable' | 'declining' | 'unknown'

  const now = new Date().toISOString()

  return us
    .filter(app => !isGlobalMegaApp(app.bundleId))
    .map((app): RadarApp => {
      const rankBR = brMap.get(app.bundleId) ?? null
      const rankMX = mxMap.get(app.bundleId) ?? null
      const rankIN = inMap.get(app.bundleId) ?? null
      const rankGB = gbMap.get(app.bundleId) ?? null

      const latamRanks = [rankBR, rankMX].filter((r): r is number => r !== null)
      const rankLatam = latamRanks.length > 0
        ? Math.round(latamRanks.reduce((s, r) => s + r, 0) / latamRanks.length)
        : null

      const range = estimateMRRRange(app.rank, app.price, category)
      const lookup = lookupData.get(app.appId)
      const reviewCount = lookup?.userRatingCount ?? 0
      const rating = lookup?.averageRating ?? 0

      // Cross-platform matching com Google Play (por nome normalizado)
      const normalName = normalize(app.name)
      const gplayMatch = gplayUSMap.get(normalName) || null
      const gplayBRMatch = gplayBRMap.get(normalName) || null
      const gplayINMatch = gplayINMap.get(normalName) || null

      const androidMatch = gplayMatch !== null
      const androidRankUS = gplayMatch?.rank ?? null
      const androidRankBR = gplayBRMatch?.rank ?? null
      const androidRankIN = gplayINMatch?.rank ?? null
      const androidInstalls = gplayMatch?.installs ?? '0'
      const androidMRR = androidRankUS ? estimateAndroidMRR(androidRankUS, category) : 0
      const combinedMRR = range.mid + androidMRR
      const platform = androidMatch ? 'Both' as const : 'iOS' as const

      const monetization = classifyMonetization(app.price)
      const clone_difficulty = classifyCloneDifficulty(category, app.price, reviewCount)

      const latam_penetration = estimatePenetration(app.rank, rankLatam)
      const india_penetration = estimatePenetration(app.rank, rankIN)
      const latam_absent = rankBR === null && rankMX === null
      const india_absent = rankIN === null

      const opportunity_score = Math.round(
        (calcOpportunityScore(app.rank, rankLatam) + calcOpportunityScore(app.rank, rankIN)) / 2
      )

      const partial = {
        mrr_estimated: range.mid,
        opportunity_score,
        clone_difficulty,
        rating,
        reviewCount,
        monetization,
        latam_absent,
        india_absent,
        latam_penetration,
        india_penetration,
        androidMatch,
        combinedMRR,
        trendScore,
      }

      const radar_score = calcRadarScore(partial)

      const target_markets: string[] = []
      if (latam_absent || latam_penetration < 30) target_markets.push('Brasil', 'México')
      if (india_absent || india_penetration < 30) target_markets.push('Índia')

      const data_sources = ['iTunes App Store']
      if (androidMatch) data_sources.push('Google Play Store')
      if (trendInfo) data_sources.push('Google Trends')

      return {
        appId: app.appId,
        bundleId: app.bundleId,
        name: app.name,
        icon: app.icon,
        category,
        storeUrl: app.storeUrl,
        price: app.price,
        rankUS: app.rank,
        rankBR, rankMX, rankIN, rankGB,
        mrr_estimated: range.mid,
        mrr_range: range,
        opportunity_score,
        clone_difficulty,
        radar_score,
        latam_penetration,
        india_penetration,
        latam_absent,
        india_absent,
        reviewCount,
        rating,
        monetization,
        androidMatch,
        androidRankUS,
        androidRankBR,
        androidRankIN,
        androidInstalls,
        androidMRR,
        combinedMRR,
        platform,
        trendScore,
        trendDirection,
        why_opportunity: generateWhyOpportunity({ rankUS: app.rank, rankBR, rankMX, rankIN, mrr_estimated: combinedMRR, rating, reviewCount, category }),
        suggested_improvements: generateImprovements({ rating, reviewCount, price: app.price, category, rankBR, rankIN }),
        target_markets,
        data_sources,
        last_scanned: now,
      }
    })
}

// Scan rápido — apenas uma categoria
export async function runRadarScanQuick(category: string): Promise<RadarApp[]> {
  const cacheKey = `radar:quick-v2:${category}`
  const cached = cache.get<RadarApp[]>(cacheKey)
  if (cached) return cached

  const trend = await getCategoryTrend(category)
  const results = await scanCategory(category, trend)
  const qualified = results
    .filter(app => app.combinedMRR >= RADAR_CONFIG.MIN_MRR || app.mrr_estimated >= RADAR_CONFIG.MIN_MRR)
    .sort((a, b) => b.radar_score - a.radar_score)

  cache.set(cacheKey, qualified, TTL.LONG)
  return qualified
}
