import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-md border-[1.5px] border-surface-border bg-white px-4 py-3.5 text-[0.9rem] text-text-primary placeholder:text-text-tertiary outline-none transition-all focus:border-brand-300 focus:ring-[3px] focus:ring-brand-50 ${className}`}
        {...props}
      />
    </div>
  )
}
