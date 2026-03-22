import { NextRequest, NextResponse } from 'next/server'
import { getActiveSelections, updateSelectionStatus } from '@/lib/services/radar-db'
import { generateTeardown, generateBuildChecklist, generateFunnelPack, generateGTMPack } from '@/lib/services/factory-engine'
import type { RadarSelection } from '@/lib/services/radar-db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const selectionId = searchParams.get('id')
  const phase = searchParams.get('phase') // 1, 2, 3, 4

  const selections = await getActiveSelections()

  // Se pediu detalhes de uma seleção específica
  if (selectionId) {
    const sel = selections.find(s => s.id === selectionId)
    if (!sel) {
      return NextResponse.json({ error: 'Seleção não encontrada' }, { status: 404 })
    }

    const teardown = generateTeardown(sel)

    const result: any = {
      selection: sel,
      teardown,
    }

    if (!phase || phase === '2') {
      result.build_checklist = generateBuildChecklist(teardown)
    }
    if (!phase || phase === '3') {
      result.funnel_pack = generateFunnelPack(teardown)
    }
    if (!phase || phase === '4') {
      result.gtm_pack = generateGTMPack(teardown)
    }

    return NextResponse.json(result)
  }

  // Pipeline overview: todos os apps com suas fases
  const pipeline = selections.map(sel => {
    const teardown = generateTeardown(sel)
    const statusPhase = getPhaseFromStatus(sel.status)

    return {
      id: sel.id,
      app_name: sel.app_name,
      app_icon: sel.app_icon,
      category: sel.category,
      radar_score: sel.radar_score,
      combined_mrr: sel.combined_mrr,
      mrr_estimated: sel.mrr_estimated,
      clone_difficulty: sel.clone_difficulty,
      status: sel.status,
      current_phase: statusPhase,
      estimated_days: teardown.estimated_days,
      target_markets: teardown.target_markets,
      selected_at: sel.selected_at,
      started_at: sel.started_at,
      launched_at: sel.launched_at,
    }
  })

  // KPIs
  const kpis = {
    total: pipeline.length,
    by_status: {
      selected: pipeline.filter(p => p.status === 'selected').length,
      analyzing: pipeline.filter(p => p.status === 'analyzing').length,
      building: pipeline.filter(p => p.status === 'building').length,
      launched: pipeline.filter(p => p.status === 'launched').length,
    },
    avg_radar_score: pipeline.length > 0
      ? Math.round(pipeline.reduce((s, p) => s + p.radar_score, 0) / pipeline.length)
      : 0,
    total_estimated_days: pipeline
      .filter(p => p.status !== 'launched')
      .reduce((s, p) => s + p.estimated_days, 0),
  }

  return NextResponse.json({ pipeline, kpis })
}

// Avançar fase de um app
export async function PATCH(req: NextRequest) {
  const { id, action } = await req.json()

  if (!id || !action) {
    return NextResponse.json({ error: 'id e action obrigatórios' }, { status: 400 })
  }

  const statusMap: Record<string, RadarSelection['status']> = {
    start_analysis: 'analyzing',
    start_build: 'building',
    launch: 'launched',
    discard: 'discarded',
  }

  const newStatus = statusMap[action]
  if (!newStatus) {
    return NextResponse.json({ error: `Ação inválida: ${action}` }, { status: 400 })
  }

  const ok = await updateSelectionStatus(id, newStatus)
  if (!ok) {
    return NextResponse.json({ error: 'Falha ao atualizar' }, { status: 500 })
  }

  return NextResponse.json({ success: true, new_status: newStatus })
}

function getPhaseFromStatus(status: string): number {
  switch (status) {
    case 'selected': return 1
    case 'analyzing': return 1
    case 'building': return 2
    case 'launched': return 4
    default: return 0
  }
}
