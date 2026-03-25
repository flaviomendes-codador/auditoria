import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { formatTime, formatDate } from '@/lib/utils'
import type { Appointment } from '@/lib/supabase/types'

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  if (id === 'novo') {
    return (
      <div className="pt-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Novo Paciente</h1>
        <p className="text-sm text-text-secondary">Formulario em breve.</p>
      </div>
    )
  }

  const { data: patient } = await supabase.from('patients').select('*').eq('id', id).single()
  if (!patient) notFound()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', id)
    .order('date', { ascending: false })
    .limit(10)

  const list = (appointments ?? []) as Appointment[]
  const total = list.length
  const confirmed = list.filter(a => a.status === 'confirmed').length
  const rate = total > 0 ? Math.round((confirmed / total) * 100) : 0

  const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

  return (
    <div className="pt-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{patient.name}</h1>
        <p className="mt-1 text-sm text-text-secondary">{patient.phone}</p>
      </div>

      <div className="rounded-md border border-surface-border bg-surface-card p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Dia fixo</span>
          <span className="font-medium text-text-primary">
            {patient.default_weekday != null ? WEEKDAYS[patient.default_weekday] : '—'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Horario fixo</span>
          <span className="font-medium text-text-primary">
            {patient.default_time ? formatTime(patient.default_time) : '—'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Taxa de confirmacao</span>
          <span className={`font-bold ${rate >= 80 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
            {rate}%
          </span>
        </div>
        {patient.notes && (
          <div className="pt-2 border-t border-surface-border">
            <p className="text-xs text-text-secondary mb-1">Notas</p>
            <p className="text-sm text-text-primary">{patient.notes}</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold text-text-primary mb-3">Historico ({total} sessoes)</h2>
        {list.length === 0 ? (
          <p className="text-sm text-text-secondary">Sem sessoes registradas</p>
        ) : (
          <div className="space-y-2">
            {list.map(a => (
              <div key={a.id} className="flex items-center justify-between rounded-md border border-surface-border bg-surface-card px-3.5 py-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">{formatDate(a.date)}</p>
                  <p className="text-xs text-text-secondary">{formatTime(a.time)}</p>
                </div>
                <Badge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
