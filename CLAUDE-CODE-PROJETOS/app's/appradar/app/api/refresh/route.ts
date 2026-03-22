import { NextRequest, NextResponse } from 'next/server'
import { runRadarScan } from '@/lib/services/radar-scanner'
import { saveRadarReport, selectAppForProduction } from '@/lib/services/radar-db'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret')

  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let radarStatus = 'skipped'
  let reportId: string | null = null
  const autoSelected: string[] = []

  try {
    const report = await runRadarScan()

    // Persistir no Supabase (só scan novo)
    if (!report.fromCache) {
      reportId = await saveRadarReport(report)
    }

    radarStatus = `scanned ${report.total_scanned} apps, ${report.total_qualified} qualified`

    // Auto-selecionar Top 2 para produção
    // Critérios: radar_score >= 80, clone_difficulty Easy ou Medium, ausente em LatAm
    const candidates = report.top_apps
      .filter(a => a.radar_score >= 80 && a.clone_difficulty !== 'Hard' && a.latam_absent)
      .slice(0, 2)

    for (const app of candidates) {
      const selId = await selectAppForProduction(app, reportId)
      if (selId) autoSelected.push(app.name)
    }

  } catch (e) {
    radarStatus = `failed: ${e instanceof Error ? e.message : String(e)}`
  }

  return NextResponse.json({
    status: 'success',
    message: 'Radar scan completo',
    timestamp: new Date().toISOString(),
    radar: radarStatus,
    report_id: reportId,
    auto_selected: autoSelected,
    next_refresh: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  })
}

export async function POST(req: NextRequest) {
  return GET(req)
}
