'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [exchanging, setExchanging] = useState(false)

  // Supabase redireciona o code para cá — troca por sessão direto
  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) return

    setExchanging(true)
    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (!error) {
        router.replace('/painel')
      } else {
        setExchanging(false)
      }
    })
  }, [searchParams, router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOtp({ email })
    setSent(true)
    setLoading(false)
  }

  if (exchanging) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-page">
        <div className="text-center space-y-2">
          <p className="text-3xl font-emoji">🍃</p>
          <p className="text-sm text-text-secondary">Entrando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary">
            <span className="font-emoji">🍃</span> Agenda
          </h1>
          <p className="mt-2 text-sm text-text-secondary">Acesse sua conta</p>
        </div>

        {sent ? (
          <div className="rounded-lg bg-brand-50 p-6 text-center">
            <p className="font-emoji text-3xl">✨</p>
            <p className="mt-3 text-sm font-medium text-brand-600">
              Link enviado para {email}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Verifique seu email e clique no link para entrar
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-surface-page">
        <p className="text-3xl font-emoji">🍃</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
