'use client'

import { useEffect, useState } from 'react'
import { AppointmentCard } from '@/components/appointments/appointment-card'
import type { Appointment } from '@/lib/supabase/types'

function isoDate(d: Date) {
  return d.toISOString().split('T')[0]
}

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const dateStr = isoDate(currentDate)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/appointments?date=${dateStr}`)
      .then(r => r.json())
      .then(data => { setAppointments(Array.isArray(data) ? data : []); setLoading(false) })
  }, [dateStr])

  function prev() { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d) }
  function next() { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d) }

  const label = currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })
  const isToday = isoDate(currentDate) === isoDate(new Date())

  return (
    <div className="pt-8 space-y-5">
      <h1 className="text-2xl font-bold text-text-primary">Agenda</h1>

      {/* Navegacao de data */}
      <div className="flex items-center justify-between rounded-md border border-surface-border bg-surface-card px-4 py-3">
        <button onClick={prev} className="text-brand-500 font-bold px-2 py-1 hover:bg-brand-50 rounded-sm">‹</button>
        <div className="text-center">
          <p className="text-sm font-semibold text-text-primary capitalize">{label}</p>
          {isToday && <p className="text-xs text-brand-500 font-medium">Hoje</p>}
        </div>
        <button onClick={next} className="text-brand-500 font-bold px-2 py-1 hover:bg-brand-50 rounded-sm">›</button>
      </div>

      {/* Lista de sessoes */}
      {loading ? (
        <p className="text-sm text-text-secondary text-center py-8">Carregando...</p>
      ) : appointments.length === 0 ? (
        <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center">
          <p className="text-sm text-text-secondary">Nenhuma sessao neste dia</p>
          <p className="text-xs text-text-tertiary mt-1">Toque no + para agendar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map(a => <AppointmentCard key={a.id} appointment={a} />)}
        </div>
      )}
    </div>
  )
}
