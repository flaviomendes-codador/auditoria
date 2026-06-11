interface Props { label:string; score:number; isGargalo:boolean }
export function ScoreBar({ label, score, isGargalo }: Props) {
  return (
    <div className="grid grid-cols-[24px_1fr_36px] items-center gap-3">
      <span className={`text-[11px] font-extrabold tracking-[0.12em] ${isGargalo?'text-[var(--text)]':'text-[var(--text-dim)]'}`}>{label}</span>
      <div className="h-[3px] bg-[var(--border)] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${isGargalo?'bg-[var(--red)]':'bg-[var(--text)]'}`} style={{width:`${score}%`}}/>
      </div>
      <span className="text-[11px] text-[var(--text-sec)] tabular-nums text-right">{score}</span>
    </div>
  )
}
