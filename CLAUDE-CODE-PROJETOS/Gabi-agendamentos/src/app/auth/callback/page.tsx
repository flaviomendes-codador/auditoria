'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Entrando...')

  useEffect(() => {
    const supabase = createClient()

    async function handle() {
      const code = searchParams.get('code')
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      // PKCE flow (magic link moderno)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) { router.replace('/painel'); return }
      }

      // OTP flow (fallback)
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as 'magiclink' | 'recovery' | 'email' })
        if (!error) { router.replace('/painel'); return }
      }

      // Sessão já existe (hash fragment resolvido pelo cliente)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) { router.replace('/painel'); return }

      setStatus('Não foi possível fazer login. Tente novamente.')
      setTimeout(() => router.replace('/login'), 2500)
    }

    handle()
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page">
      <div className="text-center space-y-2">
        <p className="text-2xl font-emoji">🍃</p>
        <p className="text-sm text-text-secondary">{status}</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-surface-page">
        <p className="text-2xl font-emoji">🍃</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
