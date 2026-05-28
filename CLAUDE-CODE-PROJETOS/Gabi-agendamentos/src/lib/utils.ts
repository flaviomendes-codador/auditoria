export function formatTime(time: string): string {
  return time.slice(0, 5)
}

export function formatDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function weekdayName(date: string): string {
  const d = new Date(date + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'long' })
}

export function greetingByTime(hour: number): string {
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

// Normaliza telefone para apenas dígitos sem código de país (+55)
// Ex: "(11) 99999-9999" → "11999999999"
//     "5511999999999"  → "11999999999"
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 13 && digits.startsWith('55')) return digits.slice(2)
  if (digits.length === 12 && digits.startsWith('55')) return digits.slice(2)
  return digits
}
