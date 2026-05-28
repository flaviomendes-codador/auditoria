'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AppointmentCard } from '@/components/appointments/appointment-card'
import type { Appointment, Patient } from '@/lib/supabase/types'

function isoDate(d: Date) {
  return d.toISOString().split('T')[0]
}

function NovaSessionForm({
  date,
  preselectedPatientId,
  onClose,
  onCreated,
}: {
  date: string
  preselectedPatientId?: string
  onClose: () => void
  onCreated: (a: Appointment) => void
}) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientId, setPatientId] = useState(preselectedPatientId ?? '')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/patients').then(r => r.json()).then(data => setPatients(Array.isArray(data) ? data : []))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: patientId, date, time, duration_min: duration }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Erro ao salvar')
      setSaving(false)
      return
    }
    const appt = await res.json()
    onCreated(appt)
    onClose()
  }

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">Nova sessão</p>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-secondary text-xl leading-none">×</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Paciente</label>
          <select
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
            required
            className="w-full rounded-md border-[1.5px] border-surface-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-300"
          >
            <option value="">Selecionar paciente</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Horário</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              required
              className="w-full rounded-md border-[1.5px] border-surface-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-300"
            />
          </div>
          <div className="w-28 space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Duração (min)</label>
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              min={15} max={240} step={15}
              className="w-full rounded-md border-[1.5px] border-surface-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-300"
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={saving || !patientId || !time}
          className="w-full rounded-md bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Salvando...' : 'Agendar'}
        </button>
      </form>
    </div>
  )
}

function AgendaContent() {
  const searchParams = useSearchParams()
  const preselectedPatientId = searchParams.get('patient_id') ?? undefined
  const initialDate = searchParams.get('date')

  const [currentDate, setCurrentDate] = useState(() => {
    if (initialDate) {
      const [y, m, d] = initialDate.split('-').map(Number)
      return new Date(y, m - 1, d)
    }
    return new Date()
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(!!preselectedPatientId)

  const dateStr = isoDate(currentDate)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/appointments?date=${dateStr}`)
      .then(r => r.json())
      .then(data => { setAppointments(Array.isArray(data) ? data : []); setLoading(false) })
  }, [dateStr])

  function prev() { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d) }
  function next() { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d) }

  function handleCreated(a: Appointment) {
    setAppointments(prev => [...prev, a].sort((x, y) => x.time.localeCompare(y.time)))
  }

  function handleStatusChange(id: string, status: string) {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: status as Appointment['status'] } : a))
  }

  const label = currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })
  const isToday = isoDate(currentDate) === isoDate(new Date())

  return (
    <div className="pt-8 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Agenda</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white text-xl font-bold shadow-md hover:bg-brand-600 transition-colors"
        >
          {showForm ? '×' : '+'}
        </button>
      </div>

      <div className="flex items-center justify-between rounded-md border border-surface-border bg-surface-card px-4 py-3">
        <button onClick={prev} className="text-brand-500 font-bold px-2 py-1 hover:bg-brand-50 rounded-sm">‹</button>
        <div className="text-center">
          <p className="text-sm font-semibold text-text-primary capitalize">{label}</p>
          {isToday && <p className="text-xs text-brand-500 font-medium">Hoje</p>}
        </div>
        <button onClick={next} className="text-brand-500 font-bold px-2 py-1 hover:bg-brand-50 rounded-sm">›</button>
      </div>

      {showForm && (
        <NovaSessionForm
          date={dateStr}
          preselectedPatientId={preselectedPatientId}
          onClose={() => setShowForm(false)}
          onCreated={handleCreated}
        />
      )}

      {loading ? (
        <p className="text-sm text-text-secondary text-center py-8">Carregando...</p>
      ) : appointments.length === 0 ? (
        <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center">
          <p className="text-sm text-text-secondary">Nenhuma sessão neste dia</p>
          <p className="text-xs text-text-tertiary mt-1">Toque no + para agendar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map(a => (
            <AppointmentCard key={a.id} appointment={a} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AgendaPage() {
  return (
    <Suspense fallback={<div className="pt-8"><p className="text-sm text-text-secondary">Carregando...</p></div>}>
      <AgendaContent />
    </Suspense>
  )
}
