import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppShell } from '@/components/layout/AppShell'
import type { Perfil } from '@/components/layout/nav-items'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Busca perfil de negócio via admin client (bypassa RLS para o próprio usuário)
  const admin = createAdminClient()
  const { data: usuario } = await admin
    .from('usuarios')
    .select('nome, perfil, organizacoes(nome)')
    .eq('id', user.id)
    .single()

  // Se não tem perfil cadastrado, redireciona para onboarding
  if (!usuario) redirect('/onboarding')

  const perfil = usuario.perfil as Perfil
  const org = usuario.organizacoes
  const nomeOrganizacao =
    org && !Array.isArray(org) ? (org as { nome: string }).nome : 'Minha Empresa'

  return (
    <AppShell
      nomeUsuario={usuario.nome}
      emailUsuario={user.email ?? ''}
      perfil={perfil}
      nomeOrganizacao={nomeOrganizacao}
    >
      {children}
    </AppShell>
  )
}
