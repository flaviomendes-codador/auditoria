type Classification = 'confirmed' | 'cancelled' | 'rescheduling' | 'unknown'

const CANCEL_PATTERNS = [
  /\bn[aã]o\s+(vou|posso|consigo|d[aá])\b/,
  /\bcancel[ao]r?\b/,
  /\bdesist[oi]\b/,
  /\bnao\s+(vou|posso|consigo|da)\b/,
]

const RESCHEDULE_PATTERNS = [
  /\btroc[ao]r?\b/,
  /\bremarca[ro]?\b/,
  /\bmud[ao]r?\b/,
  /\boutro\s+(hor[aá]rio|dia)\b/,
  /\balterar?\b/,
]

const CONFIRM_PATTERNS = [
  /\bconfirm[oa](do)?\b/,
  /\bsim\b/,
  /\bpode\b/,
  /\bok\b/,
  /\bvou\s+(sim|estar)\b/,
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function classifyResponse(text: string): Classification {
  if (!text.trim()) return 'unknown'

  const normalized = normalize(text)

  // Cancelamento tem prioridade sobre confirmacao
  // "nao vou poder" contem "vou" mas e cancelamento
  for (const pattern of CANCEL_PATTERNS) {
    if (pattern.test(normalized)) return 'cancelled'
  }

  for (const pattern of RESCHEDULE_PATTERNS) {
    if (pattern.test(normalized)) return 'rescheduling'
  }

  for (const pattern of CONFIRM_PATTERNS) {
    if (pattern.test(normalized)) return 'confirmed'
  }

  return 'unknown'
}
