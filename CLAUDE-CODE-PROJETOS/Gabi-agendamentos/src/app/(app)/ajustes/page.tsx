'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Settings } from '@/lib/supabase/types'

export default function AjustesPage() {
  const [settings, setSettings] = useState<Partial<Settings>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => { setSettings(data ?? {}); setLoading(false) })
  }, [])

  function update(key: keyof Settings, value: string | number) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="pt-8"><p className="text-sm text-text-secondary">Carregando...</p></div>

  return (
    <div className="pt-8 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Ajustes</h1>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Branding (white-label) */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Personalizacao</h2>
          <Input label="Seu nome" value={settings.owner_name ?? ''} onChange={e => update('owner_name', e.target.value)} />
          <Input label="Nome do negocio" value={settings.business_name ?? ''} onChange={e => update('business_name', e.target.value)} />
          <Input label="Emoji de marca (ex: 🍃 ✨)" value={settings.brand_emoji ?? ''} onChange={e => update('brand_emoji', e.target.value)} />
          <Input label="Tipo de consulta (sessao, consulta, aula...)" value={settings.appointment_label ?? ''} onChange={e => update('appointment_label', e.target.value)} />
        </section>

        {/* Automacao */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Automacao</h2>
          <Input label="Horario de envio da confirmacao" type="time" value={settings.confirmation_time ?? '18:00'} onChange={e => update('confirmation_time', e.target.value)} />
          <Input label="Horas de espera para follow-up" type="number" min={1} max={24} value={settings.followup_delay_hours ?? 3} onChange={e => update('followup_delay_hours', Number(e.target.value))} />
          <Input label="Horario do lembrete do dia" type="time" value={settings.reminder_time ?? '07:00'} onChange={e => update('reminder_time', e.target.value)} />
          <Input label="Duracao padrao (minutos)" type="number" min={15} max={240} value={settings.default_duration_min ?? 60} onChange={e => update('default_duration_min', Number(e.target.value))} />
          <Input label="Intervalo entre sessoes (minutos)" type="number" min={0} max={60} value={settings.break_between_min ?? 15} onChange={e => update('break_between_min', Number(e.target.value))} />
        </section>

        {/* WhatsApp */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">WhatsApp Business</h2>
            <Link
              href="/ajustes/guia"
              className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-500 hover:bg-brand-100 transition"
            >
              📖 Como configurar?
            </Link>
          </div>
          <Input label="Phone ID (Meta)" value={settings.whatsapp_phone_id ?? ''} onChange={e => update('whatsapp_phone_id', e.target.value)} />
          <Input label="Token de acesso" type="password" value={settings.whatsapp_token ?? ''} onChange={e => update('whatsapp_token', e.target.value)} />
        </section>

        {/* Modulo futuro */}
        <section className="rounded-md border border-surface-border bg-surface-page p-4 opacity-50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-secondary">Modulo Financeiro</h2>
            <span className="rounded-pill bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-600">Em breve</span>
          </div>
          <p className="mt-1 text-xs text-text-tertiary">Valor por sessao, controle de pagamentos, relatorio mensal.</p>
        </section>

        <Button type="submit" className="w-full" disabled={saving}>
          {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar configuracoes'}
        </Button>
      </form>
    </div>
  )
}
