import { createClient } from '@supabase/supabase-js'

// Cliente com service_role — bypassa RLS
// NUNCA expor no frontend; usar apenas em Server Actions e API Routes
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase admin credentials não configuradas')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
