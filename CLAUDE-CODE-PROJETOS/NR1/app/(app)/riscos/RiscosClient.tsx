'use client'

import { useState } from 'react'
import { ShieldAlert, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

// ── Tipos ───────────────────────────────────────────────

type TipoRisco = 'fisico' | 'quimico' | 'biologico' | 'ergonomico' | 'mecanico' | 'psicossocial'

interface Cargo { id: string; nome: string }
interface RiscoCargo { cargo_id: string; cargos: Cargo | null }
interface Risco {
  id: string
  tipo: TipoRisco
  descricao: string
  fonte_geradora: string | null
  probabilidade: number
  severidade: number
  ativo: boolean
  created_at: string
  risco_cargo: RiscoCargo[]
}

interface RiscosClientProps {
  riscos: Risco[]
  cargos: Cargo[]
  orgId: string
}

// ── Constantes ──────────────────────────────────────────

const TIPOS: { value: TipoRisco; label: string; badge: string }[] = [
  { value: 'fisico',       label: 'Físico',            badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'quimico',      label: 'Químico',           badge: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'biologico',    label: 'Biológico',         badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'ergonomico',   label: 'Ergonômico',        badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'mecanico',     label: 'Mecânico/Acidente', badge: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'psicossocial', label: 'Psicossocial',      badge: 'bg-pink-100 text-pink-700 border-pink-200' },
]

const PROBABILIDADE_LABELS: Record<number, string> = {
  1: '1 — Remota',
  2: '2 — Improvável',
  3: '3 — Possível',
  4: '4 — Provável',
  5: '5 — Frequente',
}

const SEVERIDADE_LABELS: Record<number, string> = {
  1: '1 — Insignificante',
  2: '2 — Leve',
  3: '3 — Moderada',
  4: '4 — Grave',
  5: '5 — Catastrófica',
}

function tipoMeta(tipo: TipoRisco) {
  return TIPOS.find((t) => t.value === tipo) ?? TIPOS[0]
}

function classifyRisk(probabilidade: number, severidade: number) {
  const score = probabilidade * severidade
  if (score >= 15) return { label: 'Crítico', score, cls: 'bg-red-100 text-red-700 border border-red-200' }
  if (score >= 9)  return { label: 'Alto',    score, cls: 'bg-orange-100 text-orange-700 border border-orange-200' }
  if (score >= 5)  return { label: 'Médio',   score, cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200' }
  return             { label: 'Baixo',   score, cls: 'bg-green-100 text-green-700 border border-green-200' }
}

// ── Componente principal ────────────────────────────────

export function RiscosClient({ riscos: initial, cargos, orgId }: RiscosClientProps) {
  const [riscos, setRiscos] = useState(initial)
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Risco | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    tipo: '' as TipoRisco | '',
    descricao: '',
    fonteGeradora: '',
    probabilidade: 3,
    severidade: 3,
    cargoIds: [] as string[],
  })

  function setF<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function toggleCargo(id: string) {
    setForm((p) => ({
      ...p,
      cargoIds: p.cargoIds.includes(id)
        ? p.cargoIds.filter((c) => c !== id)
        : [...p.cargoIds, id],
    }))
  }

  function openCreate() {
    setEditing(null)
    setForm({ tipo: '', descricao: '', fonteGeradora: '', probabilidade: 3, severidade: 3, cargoIds: [] })
    setDialogOpen(true)
  }

  function openEdit(risco: Risco) {
    setEditing(risco)
    setForm({
      tipo: risco.tipo,
      descricao: risco.descricao,
      fonteGeradora: risco.fonte_geradora ?? '',
      probabilidade: risco.probabilidade,
      severidade: risco.severidade,
      cargoIds: risco.risco_cargo.map((rc) => rc.cargo_id),
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.tipo || !form.descricao.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/riscos', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editing?.id,
          tipo: form.tipo,
          descricao: form.descricao.trim(),
          fonteGeradora: form.fonteGeradora.trim() || null,
          probabilidade: form.probabilidade,
          severidade: form.severidade,
          cargoIds: form.cargoIds,
          orgId,
        }),
      })

      if (!res.ok) {
        const { message } = await res.json()
        throw new Error(message)
      }

      const { risco } = await res.json()

      if (editing) {
        setRiscos((prev) => prev.map((r) => (r.id === risco.id ? risco : r)))
        toast.success('Risco atualizado')
      } else {
        setRiscos((prev) => [...prev, risco])
        toast.success('Risco registrado')
      }
      setDialogOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível salvar o risco')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/riscos?id=${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setRiscos((prev) => prev.filter((r) => r.id !== deleteId))
      toast.success('Risco removido')
    } catch {
      toast.error('Não foi possível remover o risco')
    } finally {
      setDeleteId(null)
    }
  }

  const riscosFiltrados = filtroTipo === 'todos'
    ? riscos
    : riscos.filter((r) => r.tipo === filtroTipo)

  const preview = classifyRisk(form.probabilidade, form.severidade)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventário de Riscos</h1>
          <p className="text-sm text-slate-500 mt-1">
            {riscos.length} risco{riscos.length !== 1 ? 's' : ''} mapeado{riscos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openCreate} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
          <Plus size={16} />
          Novo Risco
        </Button>
      </div>

      {/* Filtro por tipo */}
      {riscos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroTipo('todos')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              filtroTipo === 'todos'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            Todos ({riscos.length})
          </button>
          {TIPOS.map((tipo) => {
            const count = riscos.filter((r) => r.tipo === tipo.value).length
            if (count === 0) return null
            return (
              <button
                key={tipo.value}
                onClick={() => setFiltroTipo(tipo.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  filtroTipo === tipo.value
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {tipo.label} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Tabela ou empty state */}
      {riscosFiltrados.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 flex flex-col items-center justify-center text-center">
          <ShieldAlert size={40} className="text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">
            {riscos.length === 0 ? 'Nenhum risco mapeado' : 'Nenhum risco nesta categoria'}
          </p>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            {riscos.length === 0
              ? 'Mapeie os riscos ocupacionais para iniciar o inventário do PGR'
              : 'Selecione outra categoria ou limpe o filtro'}
          </p>
          {riscos.length === 0 && (
            <Button onClick={openCreate} variant="outline" className="gap-2">
              <Plus size={14} />
              Registrar primeiro risco
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Descrição / Fonte</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Cargos expostos</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">P</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">S</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Classificação</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {riscosFiltrados.map((risco) => {
                const meta = tipoMeta(risco.tipo)
                const nivel = classifyRisk(risco.probabilidade, risco.severidade)
                const nomeCargos = risco.risco_cargo
                  .map((rc) => rc.cargos?.nome)
                  .filter(Boolean) as string[]

                return (
                  <tr key={risco.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${meta.badge}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-slate-900 line-clamp-2">{risco.descricao}</p>
                      {risco.fonte_geradora && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{risco.fonte_geradora}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {nomeCargos.length > 0 ? (
                          nomeCargos.slice(0, 3).map((nome) => (
                            <Badge key={nome} variant="secondary" className="text-xs bg-slate-100 text-slate-600 font-normal">
                              {nome}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-slate-300 text-xs italic">—</span>
                        )}
                        {nomeCargos.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-400 font-normal">
                            +{nomeCargos.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-slate-700 font-mono text-xs font-semibold">{risco.probabilidade}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-slate-700 font-mono text-xs font-semibold">{risco.severidade}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${nivel.cls}`}>
                        {nivel.label}
                        <span className="opacity-60 font-mono">{nivel.score}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost" size="sm"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
                          onClick={() => openEdit(risco)}
                          aria-label="Editar"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                          onClick={() => setDeleteId(risco.id)}
                          aria-label="Remover"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Risco' : 'Novo Risco Ocupacional'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Tipo */}
            <div className="space-y-1.5">
              <Label>Tipo de risco <span className="text-red-500">*</span></Label>
              <Select value={form.tipo} onValueChange={(v) => setF('tipo', v as TipoRisco)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <Label>Descrição <span className="text-red-500">*</span></Label>
              <Textarea
                placeholder="Ex: Exposição a ruído acima de 85 dB por equipamentos de refrigeração"
                value={form.descricao}
                onChange={(e) => setF('descricao', e.target.value)}
                disabled={saving}
                rows={2}
                className="resize-none"
                autoFocus
              />
            </div>

            {/* Fonte geradora */}
            <div className="space-y-1.5">
              <Label>Fonte geradora</Label>
              <Input
                placeholder="Ex: Compressores, câmaras frias, má iluminação..."
                value={form.fonteGeradora}
                onChange={(e) => setF('fonteGeradora', e.target.value)}
                disabled={saving}
              />
            </div>

            {/* Matriz de risco */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Probabilidade</Label>
                <Select
                  value={String(form.probabilidade)}
                  onValueChange={(v) => setF('probabilidade', Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>{PROBABILIDADE_LABELS[n]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Severidade</Label>
                <Select
                  value={String(form.severidade)}
                  onValueChange={(v) => setF('severidade', Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>{SEVERIDADE_LABELS[n]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview da classificação */}
            <div className={`flex items-center justify-between rounded-lg px-4 py-3 ${preview.cls}`}>
              <span className="text-sm font-medium">Classificação resultante</span>
              <span className="font-bold text-base">
                {preview.label} &mdash; P×S = {preview.score}
              </span>
            </div>

            {/* Cargos expostos */}
            {cargos.length > 0 && (
              <div className="space-y-2">
                <Label>Cargos expostos</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto rounded-md border border-slate-200 p-3">
                  {cargos.map((cargo) => (
                    <label
                      key={cargo.id}
                      className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                    >
                      <Checkbox
                        checked={form.cargoIds.includes(cargo.id)}
                        onCheckedChange={() => toggleCargo(cargo.id)}
                        disabled={saving}
                      />
                      {cargo.nome}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.tipo || !form.descricao.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Registrar risco'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover risco?</AlertDialogTitle>
            <AlertDialogDescription>
              O risco será removido do inventário. Ações vinculadas a ele perderão o vínculo. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
