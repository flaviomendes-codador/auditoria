import { NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ active: false, reason: 'Supabase not configured' })
  }

  // Último scan
  const { data: lastReport } = await supabase
    .from('radar_reports')
    .select('id, scanned_at, total_scanned, total_qualified, scan_duration_ms, trending_categories')
    .order('scanned_at', { ascending: false })
    .limit(1)
    .single()

  // Total de scans
  const { count: totalScans } = await supabase
    .from('radar_reports')
    .select('id', { count: 'exact', head: true })

  // Alertas: apps com score > 90 do último scan
  let alerts: { name: string; score: number; category: string }[] = []
  if (lastReport?.id) {
    const { data: reportFull } = await supabase
      .from('radar_reports')
      .select('top_apps')
      .eq('id', lastReport.id)
      .single()

    if (reportFull?.top_apps) {
      alerts = (reportFull.top_apps as any[])
        .filter((a: any) => a.radar_score >= 90)
        .slice(0, 5)
        .map((a: any) => ({ name: a.name, score: a.radar_score, category: a.category }))
    }
  }

  // Seleções ativas
  const { count: activeSelections } = await supabase
    .from('radar_selections')
    .select('id', { count: 'exact', head: true })
    .not('status', 'eq', 'discarded')

  // Histórico de scans (últimos 10)
  const { data: history } = await supabase
    .from('radar_reports')
    .select('id, scanned_at, total_scanned, total_qualified, scan_duration_ms')
    .order('scanned_at', { ascending: false })
    .limit(10)

  const lastScanAt = lastReport?.scanned_at || null
  const hoursSinceLastScan = lastScanAt
    ? Math.round((Date.now() - new Date(lastScanAt).getTime()) / 3600000)
    : null

  return NextResponse.json({
    active: true,
    last_scan: lastScanAt,
    hours_since_last_scan: hoursSinceLastScan,
    next_scan: 'Diário às 06:00 UTC (Vercel Cron)',
    total_scans: totalScans || 0,
    active_selections: activeSelections || 0,
    alerts,
    alerts_count: alerts.length,
    last_report: lastReport,
    history: history || [],
  })
}
