import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const styles: Record<Variant, string> = {
  primary: 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-[0_2px_8px_rgba(124,58,237,0.25)] hover:from-brand-600 hover:to-brand-700 disabled:opacity-60',
  secondary: 'bg-white text-brand-500 border-[1.5px] border-brand-100 hover:bg-brand-50',
  ghost: 'text-text-secondary hover:text-text-primary',
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-[0.9rem] font-semibold transition-all ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
