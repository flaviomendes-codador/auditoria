import Link from 'next/link'
import { Button } from '@/components/ui/Button'
export default function QuizStartPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--text-dim)]">Diagnóstico gratuito</p>
          <h1 className="text-[38px] font-extrabold tracking-[-0.035em] leading-[1.06] text-[var(--text)]">Auditoria QCR™</h1>
          <p className="text-[var(--text-sec)] text-[16px] leading-[1.75] mt-1">12 perguntas. Menos de 3 minutos. Resultado imediato.</p>
        </div>
        <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg-mid)]">
          {[['Q — Qualificação','4 perguntas'],['C — Conexão','4 perguntas'],['R — Recuperação','4 perguntas']].map(([a,b],i,arr)=>(
            <div key={a} className={`flex justify-between items-center px-5 py-[14px] text-[11px] font-bold tracking-[0.08em] uppercase text-[var(--text-dim)] ${i<arr.length-1?'border-b border-[var(--border)]':''}`}>
              <span>{a}</span><span className="text-[var(--text-dim)] opacity-50">{b}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/quiz/1"><Button fullWidth>Começar Auditoria ↗</Button></Link>
          <p className="text-center text-[12px] text-[var(--text-dim)] tracking-[0.04em]">Gratuito · Sem cadastro até o resultado</p>
        </div>
      </div>
    </main>
  )
}
