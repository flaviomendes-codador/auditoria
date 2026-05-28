'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function NovoPacientePage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', weekday: '', time: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const res = await fetch('/api/patients', {
      method: 'POST',
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
    const patient = await res.json()
    router.push(`/pacientes/${patient.id}`)
  }

  return (
    <div className="pt-8 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-xl font-bold text-brand-500 px-1 py-1">‹</button>
        <h1 className="text-2xl font-bold text-text-primary">Novo Paciente</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome completo" value={form.name} onChange={e => set('name', e.target.value)} required />
        <Input label="Telefone (WhatsApp)" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="(11) 99999-9999" />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-secondary">Dia fixo (opcional)</label>
          <select
            value={form.weekday}
            onChange={e => set('weekday', e.target.value)}
            className="w-full rounded-md border-[1.5px] border-surface-border bg-white px-4 py-3.5 text-[0.9rem] text-text-primary outline-none focus:border-brand-300 focus:ring-[3px] focus:ring-brand-50"
          >
            <option value="">— Sem dia fixo —</option>
            {WEEKDAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
        </div>

        <Input label="Horário fixo (opcional)" type="time" value={form.time} onChange={e => set('time', e.target.value)} />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-secondary">Notas (opcional)</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={3}
            placeholder="Observações sobre o paciente..."
            className="w-full rounded-md border-[1.5px] border-surface-border bg-white px-4 py-3 text-[0.9rem] text-text-primary placeholder:text-text-tertiary resize-none outline-none focus:border-brand-300 focus:ring-[3px] focus:ring-brand-50"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={saving || !form.name || !form.phone}>
          {saving ? 'Salvando...' : 'Cadastrar paciente'}
        </Button>
      </form>
    </div>
  )
}
