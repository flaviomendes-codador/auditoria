import { NextRequest, NextResponse } from 'next/server'
import { runRadarScan, runRadarScanQuick } from '@/lib/services/radar-scanner'
import { ITUNES_CATEGORIES } from '@/lib/services/itunes'
import { saveRadarReport, getRadarReports } from '@/lib/services/radar-db'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') // null = scan completo
  const minRadar  = parseInt(searchParams.get('minRadar') || '0')
  const maxMRR    = parseInt(searchParams.get('maxMrr') || '100000000')
  const difficulty = searchParams.get('difficulty') // Easy, Medium, Hard
  const limit     = parseInt(searchParams.get('limit') || '30')
  const history   = searchParams.get('history') // "true" = retorna histórico

  try {
    // Histórico de scans
    if (history === 'true') {
      const reports = await getRadarReports(20)
      return NextResponse.json({ reports })
    }

    const t0 = Date.now()

    if (category) {
      // Scan rápido de uma categoria
      let apps = await runRadarScanQuick(category)

      apps = apps.filter(a => {
        if (a.radar_score < minRadar) return false
        if (a.mrr_estimated > maxMRR) return false
        if (difficulty && a.clone_difficulty !== difficulty) return false
        return true
      })

      return NextResponse.json({
        mode: 'quick',
        category,
        apps: apps.slice(0, limit),
        total: apps.length,
        elapsed_ms: Date.now() - t0,
        data_source: 'iTunes App Store RSS (dados reais)',
      })
    }

    // Scan completo de todas as categorias
    const report = await runRadarScan()

    // Persistir no Supabase (fire-and-forget)
    const reportId = await saveRadarReport(report)

    let filtered = report.top_apps.filter(a => {
      if (a.radar_score < minRadar) return false
      if (a.mrr_estimated > maxMRR) return false
      if (difficulty && a.clone_difficulty !== difficulty) return false
      return true
    })

    return NextResponse.json({
      ...report,
      report_id: reportId,
      top_apps: filtered.slice(0, limit),
      total_qualified: filtered.length,
      elapsed_ms: Date.now() - t0,
      categories_available: Object.keys(ITUNES_CATEGORIES),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: 'Radar scan falhou', detail: message, top_apps: [] },
      { status: 500 }
    )
  }
}
