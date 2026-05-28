'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function EditarPacientePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [form, setForm] = useState({ name: '', phone: '', weekday: '', time: '', notes: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/patients/${id}`).then(r => r.json()).then(p => {
      if (p && p.name) {
        setForm({
          name: p.name ?? '',
          phone: p.phone ?? '',
          weekday: p.default_weekday != null ? String(p.default_weekday) : '',
          time: p.default_time ? p.default_time.slice(0, 5) : '',
          notes: p.notes ?? '',
        })
      }
      setLoading(false)
    })
  }, [id])

  function set(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/patients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        default_weekday: form.weekday !== '' ? Number(form.weekday) : null,
        default_time: form.time || null,
        notes: form.notes || null,
      }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Erro ao salvar')
      setSaving(false)
      return
    }
    router.push(`/pacientes/${id}`)
  }

  if (loading) {
    return <div className="pt-8"><p className="text-sm text-text-secondary">Carregando...</p></div>
  }

  return (
    <div className="pt-8 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-xl font-bold text-brand-500 px-1 py-1">‹</button>
        <h1 className="text-2xl font-bold text-text-primary">Editar Paciente</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome completo" value={form.name} onChange={e => set('name', e.target.value)} required />
        <Input label="Telefone (WhatsApp)" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} required />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-secondary">Dia fixo</label>
          <select
            value={form.weekday}
            onChange={e => set('weekday', e.target.value)}
            className="w-full rounded-md border-[1.5px] border-surface-border bg-white px-4 py-3.5 text-[0.9rem] text-text-primary outline-none focus:border-brand-300 focus:ring-[3px] focus:ring-brand-50"
          >
            <option value="">— Sem dia fixo —</option>
            {WEEKDAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
        </div>

        <Input label="Horário fixo" type="time" value={form.time} onChange={e => set('time', e.target.value)} />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-secondary">Notas</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={3}
            className="w-full rounded-md border-[1.5px] border-surface-border bg-white px-4 py-3 text-[0.9rem] text-text-primary placeholder:text-text-tertiary resize-none outline-none focus:border-brand-300 focus:ring-[3px] focus:ring-brand-50"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={saving || !form.name || !form.phone}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </form>
    </div>
  )
}
