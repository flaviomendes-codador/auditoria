import { describe, it, expect } from 'vitest'
import { renderTemplate } from '@/lib/whatsapp/templates'

describe('renderTemplate', () => {
  it('substitui variaveis no template', () => {
    const template = 'Ola, {nome}! Sua sessao e as {hora} na {dia_semana}.'
    const result = renderTemplate(template, {
      nome: 'Maria',
      hora: '08:00',
      dia_semana: 'terca-feira',
    })
    expect(result).toBe('Ola, Maria! Sua sessao e as 08:00 na terca-feira.')
  })

  it('mantem variaveis nao fornecidas intactas', () => {
    const template = 'Oi, {nome}! Data: {data}'
    const result = renderTemplate(template, { nome: 'Ana' })
    expect(result).toBe('Oi, Ana! Data: {data}')
  })

  it('lida com template sem variaveis', () => {
    const template = 'Mensagem simples sem variaveis'
    const result = renderTemplate(template, { nome: 'Maria' })
    expect(result).toBe('Mensagem simples sem variaveis')
  })

  it('substitui brand_emoji no template', () => {
    const template = 'Confirmado! {brand_emoji}'
    expect(renderTemplate(template, { brand_emoji: '🍃 ✨' })).toBe('Confirmado! 🍃 ✨')
    expect(renderTemplate(template, { brand_emoji: '💆 ✨' })).toBe('Confirmado! 💆 ✨')
  })
})
