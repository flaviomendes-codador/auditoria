import { type ButtonHTMLAttributes } from 'react'
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { fullWidth?: boolean }
export function Button({ fullWidth, className='', children, ...props }: Props) {
  return (
    <button className={`inline-flex items-center justify-center gap-1.5 font-bold text-[13px] tracking-[0.07em] uppercase bg-[var(--text)] text-[oklch(10%_.005_60)] rounded-[8px] px-8 py-4 hover:opacity-80 transition-opacity disabled:opacity-40 cursor-pointer ${fullWidth?'w-full':''} ${className}`} {...props}>
      {children}
    </button>
  )
}
