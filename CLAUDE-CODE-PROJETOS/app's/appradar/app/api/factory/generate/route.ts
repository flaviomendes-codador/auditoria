import { NextRequest, NextResponse } from 'next/server'
import { getActiveSelections } from '@/lib/services/radar-db'
import { generateTeardown } from '@/lib/services/factory-engine'
import { generateAppProject } from '@/lib/services/app-generator'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const selections = await getActiveSelections()
  const sel = selections.find(s => s.id === id)
  if (!sel) return NextResponse.json({ error: 'Seleção não encontrada' }, { status: 404 })

  const teardown = generateTeardown(sel)
  const project = generateAppProject(teardown)

  return NextResponse.json(project)
}
