import { describe, it, expect, beforeEach } from 'vitest'
import { saveAnswer, getAnswer, getAnswers, clearAnswers, isComplete, saveResult, getResult, saveUtmSource, getUtmSource } from '../quiz-storage'
import type { QuizResultData } from '../quiz-storage'

beforeEach(() => { sessionStorage.clear() })

describe('saveAnswer/getAnswer', () => {
  it('saves and retrieves', () => { saveAnswer(1,67); expect(getAnswer(1)).toBe(67) })
  it('returns null for unanswered', () => { expect(getAnswer(5)).toBeNull() })
  it('overwrites', () => { saveAnswer(3,33); saveAnswer(3,100); expect(getAnswer(3)).toBe(100) })
})
describe('isComplete', () => {
  it('false when <12', () => { for(let i=1;i<=11;i++) saveAnswer(i,67); expect(isComplete()).toBe(false) })
  it('true when 12', () => { for(let i=1;i<=12;i++) saveAnswer(i,67); expect(isComplete()).toBe(true) })
})
describe('saveResult/getResult', () => {
  const r: QuizResultData = { nome:'J', empresa:'X', scoreTotal:47, scoreQ:75, scoreC:45, scoreR:20, nivel:'atencao', gargalo:'R' }
  it('saves and retrieves', () => { saveResult(r); expect(getResult()).toEqual(r) })
  it('returns null when empty', () => { expect(getResult()).toBeNull() })
})
describe('utm', () => {
  it('saves and retrieves', () => { saveUtmSource('ig'); expect(getUtmSource()).toBe('ig') })
})
