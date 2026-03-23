import { NextRequest, NextResponse } from 'next/server'
import { getActiveSelections, updateSelectionStatus } from '@/lib/services/radar-db'
import { analyzeAppDeep } from '@/lib/services/app-deep-analyzer'
import { generateTeardown, generateBuildChecklist, generateFunnelPack, generateGTMPack } from '@/lib/services/factory-engine'
import type { RadarSelection } from '@/lib/services/radar-db'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const selectionId = searchParams.get('id')
  const phase = searchParams.get('phase') // 1, 2, 3, 4

  const selections = await getActiveSelections()

  // Se pediu detalhes de uma selecao especifica — roda analise REAL
  if (selectionId) {
    const sel = selections.find(s => s.id === selectionId)
    if (!sel) {
      return NextResponse.json({ error: 'Selecao nao encontrada' }, { status: 404 })
    }

    // Analise deep real — 3 camadas em paralelo
    const profile = await analyzeAppDeep(sel)
    const teardown = generateTeardown(sel, profile)

    const result: any = {
      selection: sel,
      profile, // dados brutos da analise real
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

  // Pipeline overview — analise light pra lista (sem deep analysis)
  const pipeline = await Promise.all(selections.map(async (sel) => {
    // Deep analysis completa para cada app no pipeline
    let profile = null
    let teardown = null
    try {
      profile = await analyzeAppDeep(sel)
      teardown = generateTeardown(sel, profile)
    } catch {
      // Fallback minimo se analise falhar
    }

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
      estimated_days: teardown?.estimated_days || 10,
      target_markets: teardown?.target_markets || sel.target_markets || ['Brasil', 'Mexico', 'India'],
      selected_at: sel.selected_at,
      started_at: sel.started_at,
      launched_at: sel.launched_at,
      // Dados da analise real
      value_proposition: teardown?.value_proposition || '',
      features_count: teardown?.core_features.length || 0,
      pain_points_count: teardown?.pain_points.length || 0,
      competitors_count: teardown?.competitors_local.length || 0,
      icp_summary: profile?.icp ? `${profile.icp.age_range}, ${profile.icp.use_context}` : '',
    }
  }))

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

// Avancar fase de um app
export async function PATCH(req: NextRequest) {
  const { id, action } = await req.json()

  if (!id || !action) {
    return NextResponse.json({ error: 'id e action obrigatorios' }, { status: 400 })
  }

  const statusMap: Record<string, RadarSelection['status']> = {
    start_analysis: 'analyzing',
    start_build: 'building',
    launch: 'launched',
    discard: 'discarded',
  }

  const newStatus = statusMap[action]
  if (!newStatus) {
    return NextResponse.json({ error: `Acao invalida: ${action}` }, { status: 400 })
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
