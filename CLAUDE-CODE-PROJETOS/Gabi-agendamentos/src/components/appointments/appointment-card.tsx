'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { formatTime } from '@/lib/utils'
import type { Appointment } from '@/lib/supabase/types'

const statusColors: Record<string, string> = {
  confirmed: 'bg-emerald-500',
  pending: 'bg-amber-400',
  cancelled: 'bg-red-500',
  rescheduling: 'bg-sky-500',
  no_show: 'bg-gray-400',
}

interface AppointmentCardProps {
  appointment: Appointment
  appointmentLabel?: string
  onStatusChange?: (id: string, status: string) => void
}

export function AppointmentCard({ appointment, appointmentLabel = 'Sessão', onStatusChange }: AppointmentCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(appointment.status)
  const router = useRouter()

  const isCancelled = currentStatus === 'cancelled'
  const label = appointmentLabel.charAt(0).toUpperCase() + appointmentLabel.slice(1)

  async function changeStatus(status: string) {
    setLoading(true)
    const res = await fetch(`/api/appointments/${appointment.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setCurrentStatus(status as Appointment['status'])
      onStatusChange?.(appointment.id, status)
      router.refresh()
    }
    setLoading(false)
    setExpanded(false)
  }

  return (
    <div className="rounded-md border border-surface-border bg-surface-card shadow-subtle overflow-hidden">
      <button
        className="flex w-full items-center gap-3 p-3.5 text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <div className={`h-10 w-1 flex-shrink-0 rounded-full ${statusColors[currentStatus]}`} />
        <div className={`min-w-[44px] text-sm font-bold ${isCancelled ? 'text-text-tertiary line-through' : 'text-brand-500'}`}>
          {formatTime(appointment.time)}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className={`text-[0.85rem] font-semibold truncate ${isCancelled ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
            {appointment.patient?.name ?? 'Paciente'}
          </h5>
          <p className="text-xs text-text-secondary truncate">
            {appointment.alert ? '🔔 Precisa de atenção' : label}
          </p>
        </div>
        <Badge status={currentStatus} />
      </button>

      {expanded && (
        <div className="flex gap-2 border-t border-surface-border px-3.5 pb-3 pt-3">
          {currentStatus !== 'confirmed' && !isCancelled && (
            <button
              disabled={loading}
              onClick={() => changeStatus('confirmed')}
              className="flex-1 rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              Confirmar
            </button>
          )}
          {!isCancelled && (
            <button
              disabled={loading}
              onClick={() => changeStatus('cancelled')}
              className="flex-1 rounded-md bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          {isCancelled && (
            <button
              disabled={loading}
              onClick={() => changeStatus('pending')}
              className="flex-1 rounded-md bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              Reativar
            </button>
          )}
          <button
            onClick={() => setExpanded(false)}
            className="px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  )
}
