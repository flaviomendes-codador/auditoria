import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const body = await request.json()

  const result = await sendWhatsAppMessage(body.phone, body.content)

  const { data, error } = await supabase
    .from('messages')
    .insert({
      patient_id: body.patient_id,
      appointment_id: body.appointment_id ?? null,
      direction: 'outbound',
      type: 'manual',
      content: body.content,
      wapi_status: result.success ? 'sent' : 'failed',
      wapi_message_id: result.messageId ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: data, whatsapp: result })
}
