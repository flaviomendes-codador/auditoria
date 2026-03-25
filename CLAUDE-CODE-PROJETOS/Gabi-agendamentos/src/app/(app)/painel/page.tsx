import { createServerSupabaseClient } from '@/lib/supabase/server'
import { greetingByTime } from '@/lib/utils'
import { StatsRow } from '@/components/dashboard/stats-row'
import { AppointmentCard } from '@/components/appointments/appointment-card'
import type { Appointment, Settings } from '@/lib/supabase/types'

export default async function PainelPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = new Date().toISOString().split('T')[0]
  const hour = new Date().getHours()

  const [{ data: appointments }, { data: settings }] = await Promise.all([
    supabase.from('appointments').select('*, patient:patients(*)').eq('date', today).order('time'),
    supabase.from('settings').select('owner_name, brand_emoji, appointment_label').eq('id', user?.id ?? '').single(),
  ])

  const list = (appointments ?? []) as Appointment[]
  const s = settings as Pick<Settings, 'owner_name' | 'brand_emoji' | 'appointment_label'> | null
  const ownerName = s?.owner_name ?? 'voce'
  const brandEmoji = s?.brand_emoji ?? ''
  const appointmentLabel = s?.appointment_label ?? 'sessao'

  const confirmed = list.filter(a => a.status === 'confirmed').length
  const pending = list.filter(a => a.status === 'pending').length
  const cancelled = list.filter(a => a.status === 'cancelled').length

  return (
    <div className="pt-8 space-y-5">
      <div>
        <p className="text-sm text-text-secondary">
          {greetingByTime(hour)}, {ownerName} <span className="font-emoji">{brandEmoji}</span>
        </p>
        <h1 className="mt-1 text-2xl font-bold text-text-primary">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
        </h1>
      </div>

      <StatsRow confirmed={confirmed} pending={pending} cancelled={cancelled} />

      <div className="space-y-2">
        <h2 className="text-base font-semibold text-text-primary">Agenda de hoje</h2>
        {list.length === 0 ? (
          <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center">
            <p className="text-sm text-text-secondary">Nenhuma {appointmentLabel} hoje</p>
          </div>
        ) : (
          list.map(appointment => (
            <AppointmentCard key={appointment.id} appointment={appointment} appointmentLabel={appointmentLabel} />
          ))
        )}
      </div>
    </div>
  )
}
