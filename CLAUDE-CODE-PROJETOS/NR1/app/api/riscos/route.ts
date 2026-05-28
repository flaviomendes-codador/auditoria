import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOrganizacaoId } from '@/lib/supabase/queries'

async function getAuthContext() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const orgId = await getOrganizacaoId(user.id)
  if (!orgId) return null
  return { userId: user.id, orgId }
}

const SELECT = `id, tipo, descricao, fonte_geradora, probabilidade, severidade, ativo, created_at,
  risco_cargo(cargo_id, cargos(id, nome))`

export async function GET() {
  const ctx = await getAuthContext()
  if (!ctx) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: riscos, error } = await admin
    .from('riscos')
    .select(SELECT)
    .eq('organizacao_id', ctx.orgId)
    .eq('ativo', true)
    .order('tipo')
    .order('descricao')

  if (error) return NextResponse.json({ message: error.message }, { status: 500 })

  return NextResponse.json({ riscos })
}

export async function POST(request: Request) {
  const ctx = await getAuthContext()
  if (!ctx) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { tipo, descricao, fonteGeradora, probabilidade, severidade, cargoIds } = await request.json()
  if (!tipo || !descricao?.trim()) {
    return NextResponse.json({ message: 'Tipo e descrição são obrigatórios' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: risco, error } = await admin
    .from('riscos')
    .insert({
      organizacao_id: ctx.orgId,
      tipo,
      descricao: descricao.trim(),
      fonte_geradora: fonteGeradora?.trim() || null,
      probabilidade: probabilidade ?? 3,
      severidade: severidade ?? 3,
      created_by: ctx.userId,
      updated_by: ctx.userId,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ message: error.message }, { status: 500 })

  if (cargoIds?.length) {
    await admin.from('risco_cargo').insert(
      cargoIds.map((cargoId: string) => ({ risco_id: risco.id, cargo_id: cargoId }))
    )
  }

  const { data: full } = await admin.from('riscos').select(SELECT).eq('id', risco.id).single()
  return NextResponse.json({ risco: full }, { status: 201 })
}

export async function PUT(request: Request) {
  const ctx = await getAuthContext()
  if (!ctx) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { id, tipo, descricao, fonteGeradora, probabilidade, severidade, cargoIds } = await request.json()
  if (!id || !tipo || !descricao?.trim()) {
    return NextResponse.json({ message: 'id, tipo e descrição são obrigatórios' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('riscos')
    .update({
      tipo,
      descricao: descricao.trim(),
      fonte_geradora: fonteGeradora?.trim() || null,
      probabilidade: probabilidade ?? 3,
      severidade: severidade ?? 3,
      updated_by: ctx.userId,
    })
    .eq('id', id)
    .eq('organizacao_id', ctx.orgId)

  if (error) return NextResponse.json({ message: error.message }, { status: 500 })

  await admin.from('risco_cargo').delete().eq('risco_id', id)
  if (cargoIds?.length) {
    await admin.from('risco_cargo').insert(
      cargoIds.map((cargoId: string) => ({ risco_id: id, cargo_id: cargoId }))
    )
  }

  const { data: full } = await admin.from('riscos').select(SELECT).eq('id', id).single()
  return NextResponse.json({ risco: full })
}

export async function DELETE(request: Request) {
  const ctx = await getAuthContext()
  if (!ctx) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ message: 'id é obrigatório' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin
    .from('riscos')
    .update({ ativo: false, updated_by: ctx.userId })
    .eq('id', id)
    .eq('organizacao_id', ctx.orgId)

  if (error) return NextResponse.json({ message: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
