import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOrganizacaoId } from '@/lib/supabase/queries'
import { RiscosClient } from './RiscosClient'

export default async function RiscosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const orgId = await getOrganizacaoId(user.id)
  if (!orgId) redirect('/onboarding')

  const admin = createAdminClient()
  const [riscosRes, cargosRes] = await Promise.all([
    admin
      .from('riscos')
      .select('id, tipo, descricao, fonte_geradora, probabilidade, severidade, ativo, created_at, risco_cargo(cargo_id, cargos(id, nome))')
      .eq('organizacao_id', orgId)
      .eq('ativo', true)
      .order('tipo')
      .order('descricao'),
    admin
      .from('cargos')
      .select('id, nome')
      .eq('organizacao_id', orgId)
      .eq('ativo', true)
      .order('nome'),
  ])

  return (
    <RiscosClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      riscos={(riscosRes.data ?? []) as any}
      cargos={cargosRes.data ?? []}
      orgId={orgId}
    />
  )
}
