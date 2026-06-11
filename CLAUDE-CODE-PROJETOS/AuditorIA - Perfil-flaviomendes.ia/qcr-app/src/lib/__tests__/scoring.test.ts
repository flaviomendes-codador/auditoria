import { describe, it, expect } from 'vitest'
import { calcBlockScore, calcTotalScore, getLevel, getGargalo, getDiagnosticText, getPotencial } from '../scoring'

describe('calcBlockScore', () => {
  it('returns rounded average', () => { expect(calcBlockScore([0,33,67,100])).toBe(50) })
  it('handles all-zero', () => { expect(calcBlockScore([0,0,0,0])).toBe(0) })
  it('handles all-max', () => { expect(calcBlockScore([100,100,100,100])).toBe(100) })
  it('returns 0 for empty', () => { expect(calcBlockScore([])).toBe(0) })
})
describe('calcTotalScore', () => {
  it('averages three blocks', () => { expect(calcTotalScore(60,60,60)).toBe(60) })
  it('rounds correctly', () => { expect(calcTotalScore(75,45,20)).toBe(47) })
})
describe('getLevel', () => {
  it('critico 0-39', () => { expect(getLevel(0)).toBe('critico'); expect(getLevel(39)).toBe('critico') })
  it('atencao 40-69', () => { expect(getLevel(40)).toBe('atencao'); expect(getLevel(69)).toBe('atencao') })
  it('bom 70-89', () => { expect(getLevel(70)).toBe('bom'); expect(getLevel(89)).toBe('bom') })
  it('excelente 90-100', () => { expect(getLevel(90)).toBe('excelente'); expect(getLevel(100)).toBe('excelente') })
})
describe('getGargalo', () => {
  it('returns lowest bloco', () => { expect(getGargalo(75,45,20)).toBe('R'); expect(getGargalo(20,75,45)).toBe('Q'); expect(getGargalo(45,20,75)).toBe('C') })
  it('Q wins tie', () => { expect(getGargalo(20,20,80)).toBe('Q') })
})
describe('getDiagnosticText', () => {
  it('returns string for all combos', () => {
    const bs=['Q','C','R'] as const; const ns=['critico','atencao','bom','excelente'] as const
    for(const b of bs) for(const n of ns) { const t=getDiagnosticText(b,n); expect(typeof t).toBe('string'); expect(t.length).toBeGreaterThan(10) }
  })
})
describe('getPotencial', () => {
  it('returns 3 bullets per bloco', () => { expect(getPotencial('Q')).toHaveLength(3); expect(getPotencial('R')).toHaveLength(3) })
})
