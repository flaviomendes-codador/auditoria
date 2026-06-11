'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { QUESTIONS } from '@/lib/questions'
import { getAnswers, isComplete, saveResult, getUtmSource } from '@/lib/quiz-storage'
import { calcBlockScore, calcTotalScore, getLevel, getGargalo } from '@/lib/scoring'

export default function CapturaPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => { if(!isComplete()) router.replace('/quiz') }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if(!nome.trim()||!empresa.trim()||!whatsapp.trim()) return
    setLoading(true); setError(null)
    const answers = getAnswers()
    const qA = QUESTIONS.filter(q=>q.bloco==='Q').map(q=>answers[q.id]??0)
    const cA = QUESTIONS.filter(q=>q.bloco==='C').map(q=>answers[q.id]??0)
    const rA = QUESTIONS.filter(q=>q.bloco==='R').map(q=>answers[q.id]??0)
    const scoreQ=calcBlockScore(qA), scoreC=calcBlockScore(cA), scoreR=calcBlockScore(rA)
    const scoreTotal=calcTotalScore(scoreQ,scoreC,scoreR)
    const nivel=getLevel(scoreTotal), gargalo=getGargalo(scoreQ,scoreC,scoreR)
    try {
      const { data, error: e1 } = await supabase.from('leads').insert({ nome:nome.trim(), empresa:empresa.trim(), whatsapp:whatsapp.trim(), score_total:scoreTotal, score_q:scoreQ, score_c:scoreC, score_r:scoreR, nivel, gargalo, utm_source:getUtmSource() }).select('id').single()
      if(e1) throw e1
      const { error: e2 } = await supabase.from('respostas').insert(QUESTIONS.map(q=>({ lead_id:data.id, pergunta:q.id, bloco:q.bloco, valor:answers[q.id]??0 })))
      if(e2) throw e2
      saveResult({ nome:nome.trim(), empresa:empresa.trim(), scoreTotal, scoreQ, scoreC, scoreR, nivel, gargalo })
      router.push('/quiz/resultado')
    } catch(err) {
      console.error(err); setError('Erro ao salvar. Tente novamente.'); setLoading(false)
    }
  }

  const inp = "bg-[var(--bg-mid)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text)] text-[14px] placeholder:text-[var(--text-dim)] outline-none focus:border-[var(--text-dim)] transition-colors w-full"

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--text-dim)]">Auditoria QCR™</p>
          <h1 className="text-[28px] sm:text-[34px] font-extrabold tracking-[-0.03em] leading-[1.1] text-[var(--text)]">Seu diagnóstico está pronto.</h1>
          <p className="text-[var(--text-sec)] text-[15px] leading-[1.75]">Para revelar, precisamos de:</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[['Nome','text','Seu nome',nome,setNome],['Empresa','text','Nome da empresa',empresa,setEmpresa],['WhatsApp','tel','(11) 99999-9999',whatsapp,setWhatsapp]].map(([label,type,ph,val,fn])=>(
            <div key={label as string} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--text-dim)]">{label as string}</label>
              <input type={type as string} value={val as string} onChange={e=>(fn as (v:string)=>void)(e.target.value)} placeholder={ph as string} required className={inp}/>
            </div>
          ))}
          {error && <p className="text-[13px] text-red-400">{error}</p>}
          <div className="flex flex-col gap-3 mt-2">
            <Button type="submit" fullWidth disabled={loading}>{loading?'Calculando...':'Ver meu Score QCR™ →'}</Button>
            <p className="text-center text-[11px] text-[var(--text-dim)] leading-[1.6]">Seus dados não serão compartilhados. Usados apenas para contato com Flávio.</p>
          </div>
        </form>
      </div>
    </main>
  )
}
