import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { classifyResponse } from '@/lib/whatsapp/classifier'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'
import { renderTemplate } from '@/lib/whatsapp/templates'
import { weekdayName, formatTime, normalizePhone } from '@/lib/utils'

// Usar service role — webhook nao tem sessao de usuario autenticado
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET — Verificacao do webhook pela Meta
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Verificacao falhou' }, { status: 403 })
}

// POST — Mensagem recebida do WhatsApp
export async function POST(request: NextRequest) {
  const body = await request.json()
  const supabase = getAdminClient()

  // Extrair mensagem do payload do WhatsApp Cloud API
  const entry = body.entry?.[0]
  const change = entry?.changes?.[0]
  const message = change?.value?.messages?.[0]

  if (!message) {
    return NextResponse.json({ status: 'no_message' })
  }

  const phone = message.from
  const phoneNormalized = normalizePhone(phone)
  const isText = message.type === 'text'
  const text = isText ? (message.text?.body ?? '') : ''

  // Buscar paciente normalizando ambos os lados — sem exigir formato fixo no banco
  const { data: allPatients } = await supabase
    .from('patients')
    .select('*')
    .eq('active', true)

  const patient = allPatients?.find(p => normalizePhone(p.phone) === phoneNormalized) ?? null

  if (!patient) {
    return NextResponse.json({ status: 'patient_not_found' })
  }

  // Buscar agendamento pendente mais proximo
  const today = new Date().toISOString().split('T')[0]
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patient.id)
    .eq('status', 'pending')
    .gte('date', today)
    .order('date')
    .order('time')
    .limit(1)
    .single()

  // Registrar mensagem recebida
  await supabase.from('messages').insert({
    user_id: patient.user_id,
    patient_id: patient.id,
    appointment_id: appointment?.id ?? null,
    direction: 'inbound',
    type: 'reply',
    content: isText ? text : `[${message.type}]`,
    wapi_status: 'delivered',
    wapi_message_id: message.id,
  })

  if (!appointment) {
    return NextResponse.json({ status: 'no_pending_appointment' })
  }

  // Buscar settings do profissional para white-label
  const { data: settings } = await supabase
    .from('settings')
    .select('brand_emoji, appointment_label')
    .eq('id', patient.user_id)
    .single()

  const brandEmoji = settings?.brand_emoji ?? ''
  const appointmentLabel = settings?.appointment_label ?? 'sessao'

  const firstName = patient.name.split(' ')[0]
  const vars = {
    nome: firstName,
    hora: formatTime(appointment.time),
    dia_semana: weekdayName(appointment.date),
    brand_emoji: brandEmoji,
    appointment_label: appointmentLabel,
  }

  // Classificar resposta (nao-texto = unknown automatico)
  const classification = isText ? classifyResponse(text) : 'unknown'

  if (classification === 'confirmed') {
    await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', appointment.id)

    const confirmText = `Perfeito, ${vars.nome}! ${vars.appointment_label.charAt(0).toUpperCase() + vars.appointment_label.slice(1)} confirmada para ${vars.dia_semana} as ${vars.hora}. Te espero! ${brandEmoji}`
    await sendWhatsAppMessage(phone, confirmText)

  } else if (classification === 'cancelled') {
    await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointment.id)

    // Buscar template de cancelamento do banco (respeita personalizacao do profissional)
    const { data: cancelTemplate } = await supabase
      .from('message_templates')
      .select('content')
      .eq('user_id', patient.user_id)
      .eq('type', 'cancellation')
      .eq('active', true)
      .single()

    const cancelText = cancelTemplate
      ? renderTemplate(cancelTemplate.content, vars)
      : `Oi, ${vars.nome}! Sua ${appointmentLabel} foi cancelada. Quando quiser reagendar, e so me chamar! ${brandEmoji}`
    await sendWhatsAppMessage(phone, cancelText)

  } else if (classification === 'rescheduling') {
    await supabase
      .from('appointments')
      .update({ status: 'rescheduling', alert: true })
      .eq('id', appointment.id)

  } else {
    // unknown ou nao-texto — alertar profissional para intervencao manual
    await supabase
      .from('appointments')
      .update({ alert: true })
      .eq('id', appointment.id)
  }

  return NextResponse.json({ status: 'processed', classification })
}
