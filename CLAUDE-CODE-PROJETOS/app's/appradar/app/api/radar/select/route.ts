import { NextRequest, NextResponse } from 'next/server'
import { selectAppForProduction, getActiveSelections, updateSelectionStatus, discardSelection } from '@/lib/services/radar-db'

export const dynamic = 'force-dynamic'

// GET — listar seleções ativas
export async function GET() {
  const selections = await getActiveSelections()
  return NextResponse.json({ selections })
}

// POST — selecionar app para produção
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { app, report_id } = body

  if (!app?.bundleId || !app?.name) {
    return NextResponse.json({ error: 'App data required' }, { status: 400 })
  }

  const id = await selectAppForProduction(app, report_id || null)

  if (!id) {
    return NextResponse.json({ error: 'Falha ao selecionar app (Supabase não configurado?)' }, { status: 500 })
  }

  return NextResponse.json({ id, status: 'selected' })
}

// PATCH — atualizar status da seleção
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, status, notes } = body

  if (!id || !status) {
    return NextResponse.json({ error: 'id e status required' }, { status: 400 })
  }

  if (status === 'discarded') {
    const ok = await discardSelection(id, notes)
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: 'Falha ao descartar' }, { status: 500 })
  }

  const ok = await updateSelectionStatus(id, status, notes)
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: 'Falha ao atualizar' }, { status: 500 })
}
