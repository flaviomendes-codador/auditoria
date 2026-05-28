import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patient_id')

  let query = supabase
    .from('messages')
    .select('*, patient:patients(id, name, phone)')
    .order('sent_at', { ascending: false })
    .limit(200)

  if (patientId) {
    query = query.eq('patient_id', patientId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
