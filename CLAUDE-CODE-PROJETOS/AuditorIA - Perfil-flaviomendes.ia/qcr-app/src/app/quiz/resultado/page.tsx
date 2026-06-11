'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getResult, clearAnswers } from '@/lib/quiz-storage'
import { getDiagnosticText, getPotencial } from '@/lib/scoring'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { ScoreBar } from '@/components/quiz/ScoreBar'
import { Button } from '@/components/ui/Button'
import type { QuizResultData } from '@/lib/quiz-storage'

const NIVEL_LABELS = { critico:'Crítico', atencao:'Atenção', bom:'Bom', excelente:'Excelente' }
const NIVEL_COLORS = {
  critico:'text-[oklch(68%_.18_24)] border-[oklch(68%_.18_24/.3)] bg-[oklch(68%_.18_24/.1)]',
  atencao:'text-[oklch(75%_.14_70)] border-[oklch(75%_.14_70/.3)] bg-[oklch(75%_.14_70/.1)]',
  bom:'text-[oklch(75%_.15_145)] border-[oklch(75%_.15_145/.3)] bg-[oklch(75%_.15_145/.1)]',
  excelente:'text-[var(--accent)] border-[oklch(73%_.10_65/.3)] bg-[oklch(73%_.10_65/.1)]',
}
const BLOCO_LABELS = { Q:'Qualificação', C:'Conexão', R:'Recuperação' }

function CheckIcon() {
  return <svg viewBox="0 0 12 12" className="w-[10px] h-[10px]" stroke="oklch(70% .14 145)" strokeWidth="2.5" fill="none"><polyline points="2,6 5,9 10,3"/></svg>
}

export default function ResultadoPage() {
  const router = useRouter()
  const [result, setResult] = useState<QuizResultData|null>(null)

  useEffect(() => {
    const d = getResult()
    if(!d) { router.replace('/quiz'); return }
    setResult(d); clearAnswers()
  }, [router])

  if(!result) return null
  const { nome, empresa, scoreTotal, scoreQ, scoreC, scoreR, nivel, gargalo } = result
  const gargaloScore = { Q:scoreQ, C:scoreC, R:scoreR }[gargalo]
  const bullets = getPotencial(gargalo)
  const waUrl = buildWhatsAppUrl({ nome, empresa, scoreTotal, gargalo, whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER! })

  return (
    <main className="flex-1 flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-md flex flex-col gap-5">
        <div>
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--text-dim)]">Diagnóstico de {nome}</p>
          <p className="text-[18px] font-extrabold tracking-[-0.02em] text-[var(--text)]">Auditoria QCR™ · {empresa}</p>
        </div>

        {/* Score card */}
        <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--bg-mid)]">
          <div className="p-5 border-b border-[var(--border)] flex justify-between items-start gap-4">
            <div className="flex items-baseline gap-3">
              <span className="text-[62px] font-extrabold leading-none tracking-[-0.05em] text-[var(--text)]">{scoreTotal}</span>
              <div className="flex flex-col gap-0.5 pt-1">
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-[var(--text-dim)]">Score Geral QCR™</span>
                <span className="text-[11px] text-[var(--text-sec)]">Baseado em 12 respostas</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold tracking-[0.08em] uppercase px-3 py-1.5 rounded-full border flex-shrink-0 mt-1 ${NIVEL_COLORS[nivel]}`}>{NIVEL_LABELS[nivel]}</span>
          </div>
          <div className="p-5 flex flex-col gap-4 border-b border-[var(--border)]">
            <ScoreBar label="Q" score={scoreQ} isGargalo={gargalo==='Q'}/>
            <ScoreBar label="C" score={scoreC} isGargalo={gargalo==='C'}/>
            <ScoreBar label="R" score={scoreR} isGargalo={gargalo==='R'}/>
          </div>
          <div className="p-5 flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-[4px] bg-[oklch(38%_.12_30/.5)] flex items-center justify-center text-[11px] font-extrabold text-[oklch(70%_.14_30)] mt-0.5">!</div>
            <p className="text-[13px] text-[var(--text-sec)] leading-[1.7]">
              <strong className="text-[var(--text)] font-semibold">Gargalo em {BLOCO_LABELS[gargalo]} ({gargaloScore}).</strong>{' '}{getDiagnosticText(gargalo, nivel)}
            </p>
          </div>
        </div>

        {/* Potencial de recuperação */}
        <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--bg-mid)]">
          <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-3">
            <span className="text-[10px] font-extrabold tracking-[0.12em] uppercase text-[var(--text-dim)]">O que você pode recuperar</span>
            <span className="text-[10px] font-bold tracking-[0.07em] uppercase text-[oklch(70%_.14_145)] bg-[oklch(70%_.14_145/.1)] border border-[oklch(70%_.14_145/.25)] px-2 py-0.5 rounded-full">Estimativa</span>
          </div>
          <div className="p-5 flex flex-col gap-4">
            {bullets.map((b,i) => {
              const parts = b.split(/\*\*(.*?)\*\*/)
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-[18px] h-[18px] mt-0.5 rounded-full bg-[oklch(70%_.14_145/.15)] flex items-center justify-center"><CheckIcon/></div>
                  <p className="text-[13px] text-[var(--text-sec)] leading-[1.65]">
                    {parts.map((p,j) => j%2===1 ? <strong key={j} className="text-[var(--text)] font-semibold">{p}</strong> : p)}
                  </p>
                </div>
              )
            })}
          </div>
          <div className="px-5 py-4 border-t border-[var(--border)]">
            <p className="text-[12px] text-[var(--text-dim)] leading-[1.65]">Para transformar esse diagnóstico em um plano de ação para a sua operação, <strong className="text-[var(--text-sec)] font-medium">o próximo passo é uma conversa com Flávio</strong> — ele vai identificar qual melhoria tem maior impacto imediato no seu caso.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 pb-4">
          <a href={waUrl} target="_blank" rel="noopener noreferrer"><Button fullWidth>Agendar conversa com Flávio ↗</Button></a>
          <p className="text-center text-[12px] text-[var(--text-dim)]">Gratuito. Sem enrolação. 30 minutos.</p>
        </div>
      </div>
    </main>
  )
}
