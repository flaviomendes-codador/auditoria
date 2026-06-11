import type { Bloco } from './questions'
import type { Nivel } from './scoring'

export interface QuizResultData { nome:string; empresa:string; scoreTotal:number; scoreQ:number; scoreC:number; scoreR:number; nivel:Nivel; gargalo:Bloco }

const K = { answers:'qcr_answers', result:'qcr_result', utm:'qcr_utm_source' }

export function saveAnswer(step:number, valor:number): void { const a=getAnswers(); a[step]=valor; sessionStorage.setItem(K.answers,JSON.stringify(a)) }
export function getAnswer(step:number): number|null { return getAnswers()[step]??null }
export function getAnswers(): Record<number,number> { if(typeof window==='undefined')return{}; const r=sessionStorage.getItem(K.answers); return r?JSON.parse(r):{} }
export function clearAnswers(): void { sessionStorage.removeItem(K.answers) }
export function isComplete(): boolean { return Object.keys(getAnswers()).length===12 }
export function saveResult(r:QuizResultData): void { sessionStorage.setItem(K.result,JSON.stringify(r)) }
export function getResult(): QuizResultData|null { if(typeof window==='undefined')return null; const r=sessionStorage.getItem(K.result); return r?JSON.parse(r):null }
export function saveUtmSource(utm:string): void { sessionStorage.setItem(K.utm,utm) }
export function getUtmSource(): string|null { if(typeof window==='undefined')return null; return sessionStorage.getItem(K.utm) }
