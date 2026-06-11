import { describe, it, expect } from 'vitest'
import { buildWhatsAppUrl } from '../whatsapp'

describe('buildWhatsAppUrl', () => {
  it('builds wa.me url', () => {
    const url = buildWhatsAppUrl({ nome:'J', empresa:'X', scoreTotal:47, gargalo:'R', whatsappNumber:'5511999999999' })
    expect(url).toMatch(/^https:\/\/wa\.me\/5511999999999\?text=/)
    expect(url).toContain('47')
  })
  it('maps gargalos correctly', () => {
    expect(buildWhatsAppUrl({nome:'a',empresa:'b',scoreTotal:10,gargalo:'Q',whatsappNumber:'1'})).toContain('Qualifica')
    expect(buildWhatsAppUrl({nome:'a',empresa:'b',scoreTotal:10,gargalo:'C',whatsappNumber:'1'})).toContain('Conex')
    expect(buildWhatsAppUrl({nome:'a',empresa:'b',scoreTotal:10,gargalo:'R',whatsappNumber:'1'})).toContain('Recupera')
  })
})
