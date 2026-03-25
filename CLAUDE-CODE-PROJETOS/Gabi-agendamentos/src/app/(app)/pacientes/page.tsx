'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Patient } from '@/lib/supabase/types'

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
      {initials}
    </div>
  )
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/patients').then(r => r.json()).then(data => {
      setPatients(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="pt-8 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Pacientes</h1>
        <Link href="/pacientes/novo">
          <Button variant="primary" className="px-4 py-2 text-sm">+ Novo</Button>
        </Link>
      </div>

      <Input placeholder="Buscar paciente..." value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? (
        <p className="text-sm text-text-secondary text-center py-8">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-8">Nenhum paciente encontrado</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(patient => (
            <Link key={patient.id} href={`/pacientes/${patient.id}`}>
              <div className="flex items-center gap-3 rounded-md border border-surface-border bg-surface-card p-3.5 shadow-subtle hover:bg-brand-50 transition-colors">
                <Avatar name={patient.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{patient.name}</p>
                  <p className="text-xs text-text-secondary">
                    {patient.default_weekday != null ? WEEKDAYS[patient.default_weekday] : '—'}
                    {patient.default_time ? ` • ${patient.default_time.slice(0, 5)}` : ''}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
