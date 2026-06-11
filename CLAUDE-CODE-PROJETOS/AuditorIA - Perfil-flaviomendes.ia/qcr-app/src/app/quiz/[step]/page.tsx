'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getQuestion } from '@/lib/questions'
import { saveAnswer, getAnswer } from '@/lib/quiz-storage'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { AnswerCard } from '@/components/quiz/AnswerCard'

export default function QuizStepPage() {
  const router = useRouter()
  const params = useParams()
  const step = parseInt(params.step as string, 10)
  const [selected, setSelected] = useState<number|null>(null)
  const [advancing, setAdvancing] = useState(false)

  useEffect(() => { if(isNaN(step)||step<1||step>12) router.replace('/quiz') }, [step,router])
  useEffect(() => { const e=getAnswer(step); if(e!==null) setSelected(e) }, [step])

  const question = getQuestion(step)
  if(!question) return null

  function handleSelect(valor: number) {
    if(advancing) return
    setSelected(valor); saveAnswer(step,valor); setAdvancing(true)
    setTimeout(()=>router.push(step<12?`/quiz/${step+1}`:'/quiz/captura'),350)
  }

  return (
    <main className="flex-1 flex flex-col max-w-lg mx-auto w-full">
      <QuizProgress step={step} blocoLabel={question.blocoLabel} onBack={()=>step>1?router.push(`/quiz/${step-1}`):router.push('/quiz')}/>
      <div className="flex-1 flex flex-col justify-center px-5 py-8 gap-6">
        <h2 className="text-[20px] sm:text-[24px] font-bold tracking-[-0.02em] leading-[1.3] text-[var(--text)]">{question.texto}</h2>
        <div className="flex flex-col gap-3">
          {question.opcoes.map(o=><AnswerCard key={o.valor} texto={o.texto} valor={o.valor} selected={selected===o.valor} onClick={()=>handleSelect(o.valor)}/>)}
        </div>
      </div>
    </main>
  )
}
