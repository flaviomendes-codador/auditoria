interface Props { step:number; blocoLabel:string; onBack?:()=>void }
export function QuizProgress({ step, blocoLabel, onBack }: Props) {
  return (
    <div className="w-full flex flex-col gap-3 pt-5 pb-2 px-5">
      <div className="flex items-center justify-between">
        {onBack ? <button onClick={onBack} className="text-[12px] text-[var(--text-sec)] hover:text-[var(--text)] transition-colors">← Voltar</button> : <span/>}
        <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--text-dim)]">{blocoLabel}</span>
        <span className="text-[11px] text-[var(--text-dim)] tabular-nums">{step}/12</span>
      </div>
      <div className="h-[2px] bg-[var(--border)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--text)] rounded-full transition-all duration-300" style={{width:`${((step-1)/12)*100}%`}}/>
      </div>
    </div>
  )
}
