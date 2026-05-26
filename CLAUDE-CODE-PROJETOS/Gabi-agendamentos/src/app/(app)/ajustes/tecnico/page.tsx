'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Settings } from '@/lib/supabase/types'

export default function TecnicoPage() {
  const [settings, setSettings] = useState<Partial<Settings>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')

  useEffect(() => {
    setWebhookUrl(`${window.location.origin}/api/webhooks/whatsapp`)
    fetch('/api/settings').then(r => r.json()).then(data => { setSettings(data ?? {}); setLoading(false) })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsapp_phone_id: settings.whatsapp_phone_id, whatsapp_token: settings.whatsapp_token }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function copy(value: string) {
    navigator.clipboard.writeText(value)
  }

  if (loading) return <div className="pt-8"><p className="text-sm text-text-secondary">Carregando...</p></div>

  return (
    <div className="pt-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/ajustes" className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-card border border-surface-border text-text-secondary hover:text-text-primary transition">
          ←
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Configurações técnicas</h1>
          <p className="text-xs text-text-secondary">WhatsApp Cloud API</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Credenciais Meta</h2>
          <Input
            label="Phone ID"
            value={settings.whatsapp_phone_id ?? ''}
            onChange={e => setSettings(prev => ({ ...prev, whatsapp_phone_id: e.target.value }))}
            placeholder="Ex: 123456789012345"
          />
          <Input
            label="Token de acesso"
            type="password"
            value={settings.whatsapp_token ?? ''}
            onChange={e => setSettings(prev => ({ ...prev, whatsapp_token: e.target.value }))}
            placeholder="EAAxxxxxx..."
          />
        </section>

        {webhookUrl && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">URL do Webhook</h2>
            <p className="text-xs text-text-tertiary">Cole este endereço no painel da Meta → WhatsApp → Configuration</p>
            <button
              type="button"
              onClick={() => copy(webhookUrl)}
              className="flex w-full items-center justify-between rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-left transition hover:bg-brand-100"
            >
              <span className="break-all text-xs font-mono text-brand-700">{webhookUrl}</span>
              <span className="ml-3 shrink-0 text-xs font-semibold text-brand-500">Copiar</span>
            </button>
          </section>
        )}

        <Button type="submit" className="w-full" disabled={saving}>
          {saved ? '✓ Salvo!' : saving ? 'Salvando...' : 'Salvar credenciais'}
        </Button>
      </form>

      <div className="text-center">
        <Link href="/ajustes/guia" className="text-xs text-brand-500 hover:text-brand-600 transition">
          Ver guia de configuração →
        </Link>
      </div>
    </div>
  )
}
