import { NextRequest, NextResponse } from 'next/server'
import { getRadarReports, getRadarReportById } from '@/lib/services/radar-db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  // Relatório específico
  if (id) {
    const report = await getRadarReportById(id)
    if (!report) {
      return NextResponse.json({ error: 'Report não encontrado' }, { status: 404 })
    }

    const topApps = (report.top_apps || []).slice(0, 10)

    return NextResponse.json({
      report_id: report.id,
      scanned_at: report.scanned_at,
      total_scanned: report.total_scanned,
      total_qualified: report.total_qualified,
      scan_duration_ms: report.scan_duration_ms,
      trending_categories: report.trending_categories,
      android_coverage: report.android_coverage,
      top_10: topApps.map((app: any, i: number) => ({
        rank: i + 1,
        name: app.name,
        category: app.category,
        radar_score: app.radar_score,
        combined_mrr: app.combinedMRR || app.mrr_estimated,
        clone_difficulty: app.clone_difficulty,
        platform: app.platform,
        latam_absent: app.latam_absent,
        india_absent: app.india_absent,
        trend_direction: app.trendDirection,
        why_opportunity: app.why_opportunity,
        store_url: app.storeUrl,
      })),
    })
  }

  // Últimos relatórios
  const reports = await getRadarReports(10)

  return NextResponse.json({
    reports: reports.map(r => ({
      id: r.id,
      scanned_at: r.scanned_at,
      total_scanned: r.total_scanned,
      total_qualified: r.total_qualified,
      scan_duration_ms: r.scan_duration_ms,
    })),
  })
}
