'use client'

import { useEffect, useState } from 'react'
import type { MessageTemplate } from '@/lib/supabase/types'

const TEMPLATE_LABELS: Record<string, string> = {
  confirmation: 'Confirmacao',
  followup: 'Follow-up',
  reminder: 'Lembrete do dia',
  cancellation: 'Cancelamento',
}

function TemplateCard({ template, onSave }: { template: MessageTemplate; onSave: (id: string, content: string) => void }) {
  const [content, setContent] = useState(template.content)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/templates/${template.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) })
    onSave(template.id, content)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="rounded-md border border-surface-border bg-surface-card p-4 space-y-3">
      <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide">{TEMPLATE_LABELS[template.type]}</p>
      <textarea
        className="w-full rounded-sm border border-surface-border bg-surface-page px-3 py-2 text-sm text-text-primary resize-none outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-50"
        rows={4}
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <p className="text-xs text-text-tertiary">Variaveis: {'{nome}'} {'{hora}'} {'{dia_semana}'} {'{brand_emoji}'} {'{appointment_label}'}</p>
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-sm bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar'}
      </button>
    </div>
  )
}

export default function MensagensPage() {
  const [tab, setTab] = useState<'conversas' | 'templates'>('templates')
  const [templates, setTemplates] = useState<MessageTemplate[]>([])

  useEffect(() => {
    if (tab === 'templates') {
      fetch('/api/templates').then(r => r.json()).then(data => setTemplates(Array.isArray(data) ? data : []))
    }
  }, [tab])

  return (
    <div className="pt-8 space-y-5">
      <h1 className="text-2xl font-bold text-text-primary">Mensagens</h1>

      <div className="flex gap-1 rounded-md bg-surface-border p-1">
        {(['conversas', 'templates'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 rounded-sm py-2 text-sm font-medium transition-colors ${tab === t ? 'bg-white text-text-primary shadow-subtle' : 'text-text-secondary'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'conversas' && (
        <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center">
          <p className="text-sm text-text-secondary">Historico de conversas disponivel em breve</p>
        </div>
      )}

      {tab === 'templates' && (
        <div className="space-y-3">
          {templates.map(t => (
            <TemplateCard key={t.id} template={t} onSave={(id, content) => setTemplates(prev => prev.map(x => x.id === id ? { ...x, content } : x))} />
          ))}
        </div>
      )}
    </div>
  )
}
