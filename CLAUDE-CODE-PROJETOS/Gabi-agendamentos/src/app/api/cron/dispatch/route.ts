import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'
import { renderTemplate } from '@/lib/whatsapp/templates'
import { formatTime, weekdayName } from '@/lib/utils'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function isoDate(d: Date) { return d.toISOString().split('T')[0] }

// Hora atual em BRT (UTC-3)
function brtNow(): Date {
  return new Date(Date.now() - 3 * 60 * 60 * 1000)
}

export async function GET(_request: NextRequest) {
  const supabase = getAdminClient()
  const brt = brtNow()
  const currentHour = brt.getHours()
  const today = isoDate(brt)
  const tomorrow = isoDate(new Date(brt.getTime() + 24 * 60 * 60 * 1000))

  const { data: allSettings } = await supabase.from('settings').select('*')
  if (!allSettings?.length) return NextResponse.json({ status: 'no_settings' })

  const log: string[] = []

  for (const s of allSettings) {
    const userId = s.id
    if (!s.whatsapp_phone_id || !s.whatsapp_token) continue

    const confirmHour = parseInt((s.confirmation_time ?? '18:00').split(':')[0])
    const reminderHour = parseInt((s.reminder_time ?? '07:00').split(':')[0])
    const followupDelay = s.followup_delay_hours ?? 3
    const label = s.appointment_label ?? 'sessão'
    const emoji = s.brand_emoji ?? ''

    // Buscar templates do profissional
    const { data: tpls } = await supabase
      .from('message_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)

    const tplMap = Object.fromEntries((tpls ?? []).map(t => [t.type, t.content]))

    // ── Confirmação (dia anterior) ──────────────────────────────────────────
    if (currentHour === confirmHour) {
      const { data: appts } = await supabase
        .from('appointments')
        .select('*, patient:patients(*)')
        .eq('user_id', userId)
        .eq('date', tomorrow)
        .eq('confirmation_sent', false)
        .neq('status', 'cancelled')

      for (const a of appts ?? []) {
        const p = a.patient
        if (!p?.phone) continue
        const vars = { nome: p.name.split(' ')[0], hora: formatTime(a.time), dia_semana: weekdayName(a.date), brand_emoji: emoji, appointment_label: label }
        const text = tplMap['confirmation']
          ? renderTemplate(tplMap['confirmation'], vars)
          : `Olá, ${vars.nome}! Confirmando sua ${label} amanhã (${vars.dia_semana}) às ${vars.hora}. Confirma? ${emoji}`
        const result = await sendWhatsAppMessage(p.phone, text)
        if (result.success) {
          await supabase.from('appointments').update({ confirmation_sent: true, confirmation_sent_at: new Date().toISOString() }).eq('id', a.id)
          await supabase.from('messages').insert({ user_id: userId, patient_id: p.id, appointment_id: a.id, direction: 'outbound', type: 'confirmation', content: text, wapi_status: 'sent', wapi_message_id: result.messageId ?? null })
          log.push(`confirmation:${a.id}`)
        }
      }
    }

    // ── Lembrete do dia ────────────────────────────────────────────────────
    if (currentHour === reminderHour) {
      const { data: appts } = await supabase
        .from('appointments')
        .select('*, patient:patients(*)')
        .eq('user_id', userId)
        .eq('date', today)
        .neq('status', 'cancelled')

      for (const a of appts ?? []) {
        // Evitar reenvio: checar se já enviamos lembrete hoje
        const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true })
          .eq('appointment_id', a.id).eq('type', 'reminder')
        if ((count ?? 0) > 0) continue

        const p = a.patient
        if (!p?.phone) continue
        const vars = { nome: p.name.split(' ')[0], hora: formatTime(a.time), dia_semana: weekdayName(a.date), brand_emoji: emoji, appointment_label: label }
        const text = tplMap['reminder']
          ? renderTemplate(tplMap['reminder'], vars)
          : `Bom dia, ${vars.nome}! Só lembrando da sua ${label} hoje às ${vars.hora}. Te espero! ${emoji}`
        const result = await sendWhatsAppMessage(p.phone, text)
        if (result.success) {
          await supabase.from('messages').insert({ user_id: userId, patient_id: p.id, appointment_id: a.id, direction: 'outbound', type: 'reminder', content: text, wapi_status: 'sent', wapi_message_id: result.messageId ?? null })
          log.push(`reminder:${a.id}`)
        }
      }
    }

    // ── Follow-up ──────────────────────────────────────────────────────────
    const cutoff = new Date(brt.getTime() - followupDelay * 60 * 60 * 1000)
    const cutoffDate = isoDate(cutoff)
    const cutoffTime = cutoff.toTimeString().slice(0, 5)

    const { data: doneAppts } = await supabase
      .from('appointments')
      .select('*, patient:patients(*)')
      .eq('user_id', userId)
      .eq('followup_sent', false)
      .eq('status', 'confirmed')
      .lte('date', cutoffDate)

    for (const a of doneAppts ?? []) {
      // Se a data for anterior a hoje, sempre qualifica; se for hoje, checar hora
      if (a.date === cutoffDate && a.time >= cutoffTime) continue
      const p = a.patient
      if (!p?.phone) continue
      const vars = { nome: p.name.split(' ')[0], hora: formatTime(a.time), dia_semana: weekdayName(a.date), brand_emoji: emoji, appointment_label: label }
      const text = tplMap['followup']
        ? renderTemplate(tplMap['followup'], vars)
        : `Oi, ${vars.nome}! Tudo bem após a ${label} de hoje? Qualquer coisa, estou aqui. ${emoji}`
      const result = await sendWhatsAppMessage(p.phone, text)
      if (result.success) {
        await supabase.from('appointments').update({ followup_sent: true, followup_sent_at: new Date().toISOString() }).eq('id', a.id)
        await supabase.from('messages').insert({ user_id: userId, patient_id: p.id, appointment_id: a.id, direction: 'outbound', type: 'followup', content: text, wapi_status: 'sent', wapi_message_id: result.messageId ?? null })
        log.push(`followup:${a.id}`)
      }
    }
  }

  return NextResponse.json({ status: 'ok', sent: log })
}
