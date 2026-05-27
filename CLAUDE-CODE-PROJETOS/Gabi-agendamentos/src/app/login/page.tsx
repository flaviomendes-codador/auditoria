'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary">
            <span className="font-emoji">🍃</span> Agenda
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Acesse sua conta
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg bg-brand-50 p-6 text-center">
            <p className="font-emoji text-3xl">✨</p>
            <p className="mt-3 text-sm font-medium text-brand-600">
              Link enviado para {email}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Verifique seu email para acessar
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Entrar com Magic Link'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
