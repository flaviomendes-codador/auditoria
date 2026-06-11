interface Props { texto:string; valor:number; selected:boolean; onClick:()=>void }
export function AnswerCard({ texto, selected, onClick }: Props) {
  return (
    <button onClick={onClick} className={`w-full text-left px-5 py-4 rounded-xl border text-[14px] leading-[1.6] transition-all duration-150 cursor-pointer ${selected?'border-[var(--accent)] bg-[oklch(73%_.10_65/.1)] text-[var(--text)]':'border-[var(--border)] bg-[var(--bg-mid)] text-[var(--text-sec)] hover:border-[var(--text-dim)] hover:text-[var(--text)]'}`}>
      {texto}
    </button>
  )
}
