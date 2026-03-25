import { HTMLAttributes } from 'react'

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-md border border-surface-border bg-surface-card shadow-subtle ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
