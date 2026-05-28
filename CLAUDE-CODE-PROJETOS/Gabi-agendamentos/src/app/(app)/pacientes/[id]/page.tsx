import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatTime, formatDate } from '@/lib/utils'
import type { Appointment } from '@/lib/supabase/types'

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === 'novo') {
    return null
  }

  const supabase = await createServerSupabaseClient()
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
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="pt-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{patient.name}</h1>
          <p className="mt-1 text-sm text-text-secondary">{patient.phone}</p>
        </div>
        <Link
          href={`/pacientes/${id}/editar`}
          className="rounded-md border border-surface-border bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-brand-50 hover:text-brand-600 transition-colors"
        >
          Editar
        </Link>
      </div>

      <div className="rounded-md border border-surface-border bg-surface-card p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Dia fixo</span>
          <span className="font-medium text-text-primary">
            {patient.default_weekday != null ? WEEKDAYS[patient.default_weekday] : '—'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Horário fixo</span>
          <span className="font-medium text-text-primary">
            {patient.default_time ? formatTime(patient.default_time) : '—'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Taxa de confirmação</span>
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

      <Link
        href={`/agenda?patient_id=${id}&date=${today}`}
        className="flex w-full items-center justify-center rounded-md bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
      >
        + Nova sessão
      </Link>

      <div>
        <h2 className="text-base font-semibold text-text-primary mb-3">Histórico ({total} sessões)</h2>
        {list.length === 0 ? (
          <p className="text-sm text-text-secondary">Sem sessões registradas</p>
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
