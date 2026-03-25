import { describe, it, expect } from 'vitest'
import { classifyResponse } from '@/lib/whatsapp/classifier'

describe('classifyResponse', () => {
  it('classifica confirmacoes', () => {
    expect(classifyResponse('Confirmo')).toBe('confirmed')
    expect(classifyResponse('sim')).toBe('confirmed')
    expect(classifyResponse('Pode confirmar')).toBe('confirmed')
    expect(classifyResponse('ok!')).toBe('confirmed')
    expect(classifyResponse('Sim, confirmado!')).toBe('confirmed')
    expect(classifyResponse('pode sim')).toBe('confirmed')
  })

  it('classifica cancelamentos', () => {
    expect(classifyResponse('Nao vou poder ir')).toBe('cancelled')
    expect(classifyResponse('Cancela por favor')).toBe('cancelled')
    expect(classifyResponse('nao posso amanha')).toBe('cancelled')
    expect(classifyResponse('Preciso cancelar')).toBe('cancelled')
  })

  it('classifica pedidos de remarcacao', () => {
    expect(classifyResponse('Posso trocar pra quinta?')).toBe('rescheduling')
    expect(classifyResponse('Quero remarcar')).toBe('rescheduling')
    expect(classifyResponse('Tem outro horario?')).toBe('rescheduling')
    expect(classifyResponse('Posso mudar o dia?')).toBe('rescheduling')
  })

  it('retorna unknown para mensagens ambiguas', () => {
    expect(classifyResponse('Oi, tudo bem?')).toBe('unknown')
    expect(classifyResponse('Obrigada!')).toBe('unknown')
    expect(classifyResponse('')).toBe('unknown')
  })

  it('e case-insensitive e ignora acentos', () => {
    expect(classifyResponse('CONFIRMO')).toBe('confirmed')
    expect(classifyResponse('NÃO VOU')).toBe('cancelled')
    expect(classifyResponse('remarcar')).toBe('rescheduling')
  })
})
