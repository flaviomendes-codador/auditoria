'use client'

import { useEffect, useState } from 'react'
import type { Message, MessageTemplate } from '@/lib/supabase/types'

const TEMPLATE_LABELS: Record<string, string> = {
  confirmation: 'Confirmação',
  followup: 'Follow-up',
  reminder: 'Lembrete do dia',
  cancellation: 'Cancelamento',
}

function formatMsgTime(sent_at: string) {
  const d = new Date(sent_at)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
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
      <p className="text-xs text-text-tertiary">Variáveis: {'{nome}'} {'{hora}'} {'{dia_semana}'} {'{brand_emoji}'} {'{appointment_label}'}</p>
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

interface Conversation {
  patientId: string
  patientName: string
  lastMessage: Message
  messages: Message[]
}

function ConversaThread({ conv, thread, onBack, onSent }: {
  conv: Conversation
  thread: Message[]
  onBack: () => void
  onSent: (msg: Message) => void
}) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [localThread, setLocalThread] = useState(thread)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    const res = await fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: conv.patientId, phone: conv.lastMessage.patient?.phone, content: text.trim() }),
    })
    if (res.ok) {
      const { message } = await res.json()
      const newMsg = { ...message, patient: conv.lastMessage.patient }
      setLocalThread(prev => [...prev, newMsg])
      onSent(newMsg)
      setText('')
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-brand-500 mb-3">
        <span className="text-lg">‹</span> {conv.patientName}
      </button>
      <div className="flex-1 space-y-2 pb-4">
        {localThread.map(msg => (
          <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
              msg.direction === 'outbound'
                ? 'rounded-tr-sm bg-brand-500 text-white'
                : 'rounded-tl-sm bg-surface-card border border-surface-border text-text-primary'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className={`mt-1 text-[0.65rem] ${msg.direction === 'outbound' ? 'text-brand-100' : 'text-text-tertiary'}`}>
                {formatMsgTime(msg.sent_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-surface-border">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Digite uma mensagem..."
          className="flex-1 rounded-full border border-surface-border bg-surface-page px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-300"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
        >
          ➤
        </button>
      </form>
    </div>
  )
}

function ConversasList() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/messages')
      .then(r => r.json())
      .then(data => { setMessages(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  // Agrupar por paciente, mostrar mais recente primeiro
  const conversations: Conversation[] = Object.values(
    messages.reduce<Record<string, Conversation>>((acc, msg) => {
      const pid = msg.patient_id
      if (!acc[pid]) {
        acc[pid] = {
          patientId: pid,
          patientName: msg.patient?.name ?? 'Paciente',
          lastMessage: msg,
          messages: [],
        }
      }
      acc[pid].messages.push(msg)
      if (new Date(msg.sent_at) > new Date(acc[pid].lastMessage.sent_at)) {
        acc[pid].lastMessage = msg
      }
      return acc
    }, {})
  ).sort((a, b) => new Date(b.lastMessage.sent_at).getTime() - new Date(a.lastMessage.sent_at).getTime())

  if (loading) {
    return <p className="text-sm text-text-secondary text-center py-8">Carregando...</p>
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center space-y-2">
        <p className="text-2xl">💬</p>
        <p className="text-sm text-text-secondary">Nenhuma conversa ainda</p>
        <p className="text-xs text-text-tertiary">As respostas dos pacientes aparecerão aqui</p>
      </div>
    )
  }

  if (selected) {
    const conv = conversations.find(c => c.patientId === selected)
    if (!conv) return null
    const thread = [...conv.messages].sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime())

    return <ConversaThread conv={conv} thread={thread} onBack={() => setSelected(null)} onSent={msg => setMessages(prev => [...prev, msg])} />
  }

  return (
    <div className="space-y-2">
      {conversations.map(conv => (
        <button
          key={conv.patientId}
          onClick={() => setSelected(conv.patientId)}
          className="flex w-full items-center gap-3 rounded-md border border-surface-border bg-surface-card p-3.5 text-left hover:bg-brand-50 transition-colors"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
            {conv.patientName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">{conv.patientName}</p>
              <p className="text-xs text-text-tertiary flex-shrink-0 ml-2">{formatMsgTime(conv.lastMessage.sent_at)}</p>
            </div>
            <p className="text-xs text-text-secondary truncate mt-0.5">
              {conv.lastMessage.direction === 'outbound' ? 'Você: ' : ''}{conv.lastMessage.content}
            </p>
          </div>
          {conv.lastMessage.direction === 'inbound' && (
            <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-500" />
          )}
        </button>
      ))}
    </div>
  )
}

export default function MensagensPage() {
  const [tab, setTab] = useState<'conversas' | 'templates'>('conversas')
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

      {tab === 'conversas' && <ConversasList />}

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
