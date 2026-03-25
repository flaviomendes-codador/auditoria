import { describe, it, expect } from 'vitest'
import { formatTime, formatDate, weekdayName, greetingByTime } from '@/lib/utils'

describe('formatTime', () => {
  it('formata hora HH:MM:SS para HH:MM', () => {
    expect(formatTime('08:00:00')).toBe('08:00')
    expect(formatTime('14:30:00')).toBe('14:30')
    expect(formatTime('08:00')).toBe('08:00')
  })
})

describe('formatDate', () => {
  it('formata data ISO para dd/mm/aaaa', () => {
    expect(formatDate('2026-03-25')).toBe('25/03/2026')
  })
})

describe('weekdayName', () => {
  it('retorna nome do dia da semana em portugues', () => {
    expect(weekdayName('2026-03-25')).toBe('quarta-feira')
    expect(weekdayName('2026-03-24')).toBe('terça-feira')
  })
})

describe('greetingByTime', () => {
  it('retorna saudacao baseada na hora', () => {
    expect(greetingByTime(8)).toBe('Bom dia')
    expect(greetingByTime(13)).toBe('Boa tarde')
    expect(greetingByTime(19)).toBe('Boa noite')
  })
})
