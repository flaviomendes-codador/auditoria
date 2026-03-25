export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'rescheduling' | 'no_show'
export type MessageDirection = 'outbound' | 'inbound'
export type MessageType = 'confirmation' | 'followup' | 'reminder' | 'reply' | 'cancellation' | 'manual'
export type WapiStatus = 'sent' | 'delivered' | 'read' | 'failed'
export type TemplateType = 'confirmation' | 'followup' | 'reminder' | 'cancellation'

export interface Patient {
  id: string
  user_id: string
  name: string
  phone: string
  default_weekday: number | null
  default_time: string | null
  notes: string | null
  active: boolean
  created_at: string
}

export interface Appointment {
  id: string
  user_id: string
  patient_id: string
  date: string
  time: string
  duration_min: number
  status: AppointmentStatus
  confirmation_sent: boolean
  confirmation_sent_at: string | null
  followup_sent: boolean
  followup_sent_at: string | null
  alert: boolean
  created_at: string
  patient?: Patient
}

export interface Message {
  id: string
  user_id: string
  appointment_id: string | null
  patient_id: string
  direction: MessageDirection
  type: MessageType
  content: string
  wapi_status: WapiStatus
  wapi_message_id: string | null
  sent_at: string
}

export interface MessageTemplate {
  id: string
  user_id: string
  type: TemplateType
  content: string
  active: boolean
  updated_at: string
}

// White-label: todos os campos de branding vem daqui — nunca hardcodar no codigo
export interface Settings {
  id: string
  // Automacao
  confirmation_time: string
  followup_delay_hours: number
  reminder_time: string
  default_duration_min: number
  break_between_min: number
  working_hours: Record<string, { start: string; end: string } | null>
  // WhatsApp
  whatsapp_phone_id: string | null
  whatsapp_token: string | null
  // Branding (white-label)
  owner_name: string
  business_name: string
  brand_emoji: string
  appointment_label: string
}
