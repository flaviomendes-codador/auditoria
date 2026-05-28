import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId,
      email,
      nome,
      perfil,
      nomeOrganizacao,
      cnpj,
      numColaboradores,
    } = body

    if (!userId || !nome || !perfil || !nomeOrganizacao) {
      return NextResponse.json(
        { message: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Verifica se usuário já tem perfil (idempotência)
    const { data: existing } = await admin
      .from('usuarios')
      .select('id')
      .eq('id', userId)
      .single()

    if (existing) {
      return NextResponse.json({ ok: true })
    }

    // Cria organização
    const { data: org, error: orgError } = await admin
      .from('organizacoes')
      .insert({
        nome: nomeOrganizacao,
        cnpj: cnpj ?? null,
        num_colaboradores: numColaboradores ?? null,
      })
      .select('id')
      .single()

    if (orgError || !org) {
      throw new Error('Erro ao criar organização: ' + orgError?.message)
    }

    // Cria perfil do usuário
    const { error: userError } = await admin.from('usuarios').insert({
      id: userId,
      organizacao_id: org.id,
      nome,
      email,
      perfil,
    })

    if (userError) {
      // Rollback da organização criada
      await admin.from('organizacoes').delete().eq('id', org.id)
      throw new Error('Erro ao criar usuário: ' + userError.message)
    }

    // Cria configuração padrão de IA
    await admin.from('ai_config').insert({ organizacao_id: org.id })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ message }, { status: 500 })
  }
}
