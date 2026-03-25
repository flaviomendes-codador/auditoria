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
}

export function AppointmentCard({ appointment, appointmentLabel = 'Sessao' }: AppointmentCardProps) {
  const isCancelled = appointment.status === 'cancelled'
  const label = appointmentLabel.charAt(0).toUpperCase() + appointmentLabel.slice(1)

  return (
    <div className="flex items-center gap-3 rounded-md border border-surface-border bg-surface-card p-3.5 shadow-subtle">
      <div className={`h-10 w-1 flex-shrink-0 rounded-full ${statusColors[appointment.status]}`} />
      <div className={`min-w-[44px] text-sm font-bold ${isCancelled ? 'text-text-tertiary line-through' : 'text-brand-500'}`}>
        {formatTime(appointment.time)}
      </div>
      <div className="flex-1 min-w-0">
        <h5 className={`text-[0.85rem] font-semibold truncate ${isCancelled ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
          {appointment.patient?.name ?? 'Paciente'}
        </h5>
        <p className="text-xs text-text-secondary truncate">
          {appointment.alert ? '🔔 Precisa de atencao' : label}
        </p>
      </div>
      <Badge status={appointment.status} />
    </div>
  )
}
