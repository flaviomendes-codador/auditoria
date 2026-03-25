import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  let query = supabase
    .from('appointments')
    .select('*, patient:patients(*)')
    .order('date')
    .order('time')

  if (date) {
    query = query.eq('date', date)
  } else if (startDate && endDate) {
    query = query.gte('date', startDate).lte('date', endDate)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: body.patient_id,
      date: body.date,
      time: body.time,
      duration_min: body.duration_min ?? 60,
    })
    .select('*, patient:patients(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
