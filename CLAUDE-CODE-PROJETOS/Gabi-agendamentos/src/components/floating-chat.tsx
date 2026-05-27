'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const WELCOME: Message = {
  role: 'assistant',
  content:
    'Olá! Posso ajudar com dúvidas sobre o app: cadastro de pacientes, agendamentos, configuração do WhatsApp e mais. O que você precisa? 🍃',
}

export function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 150)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      })

      if (res.status === 503) {
        setUnavailable(true)
        setLoading(false)
        return
      }

      if (!res.ok) throw new Error('Erro na resposta')

      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let reply = ''
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        reply += dec.decode(value, { stream: true })
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: reply },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ocorreu um erro. Tente novamente.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (unavailable) return null

  return (
    <div className="fixed bottom-24 right-4 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div
          className="flex w-80 max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-surface-border bg-white shadow-xl"
          style={{ maxHeight: 'min(50vh, 400px)' }}
        >
          {/* Cabeçalho */}
          <div className="flex shrink-0 items-center gap-2 rounded-t-2xl bg-brand-500 px-4 py-3">
            <span className="font-emoji text-lg">🍃</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Assistente</p>
              <p className="text-xs text-white/70">Dúvidas sobre o app</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-lg leading-none text-white/70 transition hover:text-white"
              aria-label="Fechar assistente"
            >
              ✕
            </button>
          </div>

          {/* Mensagens */}
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {messages.map((msg, i) => {
                const isLastLoading =
                  loading && i === messages.length - 1 && msg.role === 'assistant'
                return (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'rounded-br-sm bg-brand-500 text-white'
                          : 'rounded-bl-sm bg-surface-page text-text-primary'
                      }`}
                    >
                      {isLastLoading && !msg.content ? (
                        <span className="inline-flex gap-0.5">
                          {[0, 100, 200].map((delay) => (
                            <span
                              key={delay}
                              className="animate-bounce text-lg leading-none"
                              style={{ animationDelay: `${delay}ms` }}
                            >
                              ·
                            </span>
                          ))}
                        </span>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={send}
            className="flex shrink-0 gap-2 border-t border-surface-border p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunta sobre o app..."
              disabled={loading}
              className="min-w-0 flex-1 rounded-xl border border-surface-border px-3 py-2 text-sm outline-none transition focus:border-brand-300 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white transition active:scale-95 disabled:opacity-40"
              aria-label="Enviar"
            >
              ↑
            </button>
          </form>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-xl text-white shadow-lg transition hover:bg-brand-600 active:scale-95"
        aria-label={open ? 'Fechar assistente' : 'Abrir assistente'}
      >
        <span className="font-emoji">{open ? '✕' : '?'}</span>
      </button>
    </div>
  )
}
