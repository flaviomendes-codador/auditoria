import { NextRequest, NextResponse } from 'next/server'
import { getActiveSelections } from '@/lib/services/radar-db'
import { analyzeAppDeep } from '@/lib/services/app-deep-analyzer'
import { generateTeardown } from '@/lib/services/factory-engine'
import { generateAppProject } from '@/lib/services/app-generator'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const selections = await getActiveSelections()
  const sel = selections.find(s => s.id === id)
  if (!sel) return NextResponse.json({ error: 'Seleção não encontrada' }, { status: 404 })

  const profile = await analyzeAppDeep(sel)
  const teardown = generateTeardown(sel, profile)
  const project = generateAppProject(teardown)

  return NextResponse.json(project)
}
