'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, ShieldCheck } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nome: '',
    perfil: '',
    nomeOrganizacao: '',
    cnpj: '',
    numColaboradores: '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Cria organização e usuário via API Route para usar service_role
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          nome: form.nome,
          perfil: form.perfil,
          nomeOrganizacao: form.nomeOrganizacao,
          cnpj: form.cnpj || null,
          numColaboradores: form.numColaboradores
            ? parseInt(form.numColaboradores)
            : null,
        }),
      })

      if (!res.ok) {
        const { message } = await res.json()
        throw new Error(message ?? 'Erro ao salvar dados')
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600 text-white">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 leading-tight">NR-1 Compliance</p>
            <p className="text-xs text-slate-500">Configure sua conta</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">Bem-vindo</h1>
          <p className="text-sm text-slate-500 mb-6">
            Preencha os dados para configurar sua organização
          </p>

          {error && (
            <Alert variant="destructive" className="mb-4 py-2">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="nome" className="text-sm text-slate-700">
                  Seu nome <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nome"
                  placeholder="Nome completo"
                  value={form.nome}
                  onChange={(e) => set('nome', e.target.value)}
                  required
                  disabled={loading}
                  className="h-10"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="perfil" className="text-sm text-slate-700">
                  Perfil de acesso <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.perfil}
                  onValueChange={(v) => set('perfil', v)}
                  required
                >
                  <SelectTrigger id="perfil" className="h-10">
                    <SelectValue placeholder="Selecione seu perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rh_operacional">RH Operacional</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                    <SelectItem value="responsavel_tecnico">Responsável Técnico</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="nomeOrganizacao" className="text-sm text-slate-700">
                  Nome da empresa <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nomeOrganizacao"
                  placeholder="Razão social ou nome fantasia"
                  value={form.nomeOrganizacao}
                  onChange={(e) => set('nomeOrganizacao', e.target.value)}
                  required
                  disabled={loading}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cnpj" className="text-sm text-slate-700">
                  CNPJ
                </Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={form.cnpj}
                  onChange={(e) => set('cnpj', e.target.value)}
                  disabled={loading}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="numColaboradores" className="text-sm text-slate-700">
                  Nº de colaboradores
                </Label>
                <Input
                  id="numColaboradores"
                  type="number"
                  placeholder="Ex: 120"
                  min="1"
                  value={form.numColaboradores}
                  onChange={(e) => set('numColaboradores', e.target.value)}
                  disabled={loading}
                  className="h-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-cyan-600 hover:bg-cyan-700 text-white mt-2"
              disabled={loading || !form.nome || !form.perfil || !form.nomeOrganizacao}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Começar a usar'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
