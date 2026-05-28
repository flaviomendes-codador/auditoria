import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOrganizacaoId } from '@/lib/supabase/queries'
import { CargosClient } from './CargosClient'

export default async function CargosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const orgId = await getOrganizacaoId(user.id)
  if (!orgId) redirect('/onboarding')

  const admin = createAdminClient()

  const [{ data: cargos }, { data: setores }] = await Promise.all([
    admin
      .from('cargos')
      .select(`
        id, nome, descricao, num_colaboradores, ativo, created_at,
        cargo_setor(setor_id, setores(id, nome))
      `)
      .eq('organizacao_id', orgId)
      .eq('ativo', true)
      .order('nome'),
    admin
      .from('setores')
      .select('id, nome')
      .eq('organizacao_id', orgId)
      .eq('ativo', true)
      .order('nome'),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <CargosClient cargos={(cargos ?? []) as any} setores={setores ?? []} orgId={orgId} />
}
