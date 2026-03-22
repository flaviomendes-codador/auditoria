import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { RadarReport, RadarApp } from './radar-scanner'

// ============================================================
// RADAR DB — Persistência de relatórios e seleções no Supabase
// Fallback silencioso: se Supabase não está configurado, retorna null
// ============================================================

export interface RadarSelection {
  id: string
  report_id: string | null
  app_id: string
  bundle_id: string
  app_name: string
  app_icon: string | null
  category: string | null
  store_url: string | null
  radar_score: number
  mrr_estimated: number | null
  combined_mrr: number | null
  clone_difficulty: string | null
  monetization: string | null
  why_opportunity: string[]
  suggested_improvements: string[]
  target_markets: string[]
  status: 'selected' | 'analyzing' | 'building' | 'launched' | 'discarded'
  selected_at: string
  started_at: string | null
  launched_at: string | null
  notes: string | null
}

// --- Radar Reports ---

export async function saveRadarReport(report: RadarReport): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) return null

  const { data, error } = await supabase
    .from('radar_reports')
    .insert({
      scanned_at: report.scanned_at,
      total_scanned: report.total_scanned,
      total_qualified: report.total_qualified,
      categories_scanned: report.categories_scanned,
      trending_categories: report.trending_categories,
      data_sources: report.data_sources,
      android_coverage: report.android_coverage,
      scan_duration_ms: report.scan_duration_ms,
      top_apps: report.top_apps,
      filters_applied: report.filters_applied,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[radar-db] Erro ao salvar report:', error.message)
    return null
  }

  return data.id
}

export async function getRadarReports(limit = 10): Promise<any[]> {
  if (!isSupabaseConfigured() || !supabase) return []

  const { data, error } = await supabase
    .from('radar_reports')
    .select('id, scanned_at, total_scanned, total_qualified, scan_duration_ms, categories_scanned, trending_categories')
    .order('scanned_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[radar-db] Erro ao buscar reports:', error.message)
    return []
  }

  return data || []
}

export async function getRadarReportById(id: string): Promise<any | null> {
  if (!isSupabaseConfigured() || !supabase) return null

  const { data, error } = await supabase
    .from('radar_reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

// --- Radar Selections ---

export async function selectAppForProduction(
  app: RadarApp,
  reportId: string | null
): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) return null

  // Verificar se já está selecionado (evitar duplicata)
  const { data: existing } = await supabase
    .from('radar_selections')
    .select('id, status')
    .eq('bundle_id', app.bundleId)
    .not('status', 'eq', 'discarded')
    .limit(1)

  if (existing && existing.length > 0) {
    return existing[0].id // Já selecionado
  }

  const { data, error } = await supabase
    .from('radar_selections')
    .insert({
      report_id: reportId,
      app_id: app.appId,
      bundle_id: app.bundleId,
      app_name: app.name,
      app_icon: app.icon,
      category: app.category,
      store_url: app.storeUrl,
      radar_score: app.radar_score,
      mrr_estimated: app.mrr_estimated,
      combined_mrr: app.combinedMRR,
      clone_difficulty: app.clone_difficulty,
      monetization: app.monetization,
      why_opportunity: app.why_opportunity,
      suggested_improvements: app.suggested_improvements,
      target_markets: app.target_markets,
      status: 'selected',
    })
    .select('id')
    .single()

  if (error) {
    console.error('[radar-db] Erro ao selecionar app:', error.message)
    return null
  }

  return data.id
}

export async function updateSelectionStatus(
  id: string,
  status: RadarSelection['status'],
  notes?: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false

  const update: Record<string, any> = { status }
  if (status === 'analyzing') update.started_at = new Date().toISOString()
  if (status === 'launched') update.launched_at = new Date().toISOString()
  if (notes) update.notes = notes

  const { error } = await supabase
    .from('radar_selections')
    .update(update)
    .eq('id', id)

  if (error) {
    console.error('[radar-db] Erro ao atualizar seleção:', error.message)
    return false
  }

  return true
}

export async function getActiveSelections(): Promise<RadarSelection[]> {
  if (!isSupabaseConfigured() || !supabase) return []

  const { data, error } = await supabase
    .from('radar_selections')
    .select('*')
    .not('status', 'eq', 'discarded')
    .order('selected_at', { ascending: false })

  if (error) {
    console.error('[radar-db] Erro ao buscar seleções:', error.message)
    return []
  }

  return (data || []) as RadarSelection[]
}

export async function discardSelection(id: string, reason?: string): Promise<boolean> {
  return updateSelectionStatus(id, 'discarded', reason)
}
