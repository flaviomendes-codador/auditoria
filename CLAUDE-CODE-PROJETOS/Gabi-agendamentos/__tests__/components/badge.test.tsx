import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renderiza label correto para cada status', () => {
    const { rerender } = render(<Badge status="confirmed" />)
    expect(screen.getByText('Confirmado')).toBeDefined()

    rerender(<Badge status="pending" />)
    expect(screen.getByText('Pendente')).toBeDefined()

    rerender(<Badge status="cancelled" />)
    expect(screen.getByText('Cancelado')).toBeDefined()

    rerender(<Badge status="rescheduling" />)
    expect(screen.getByText('Remarcacao')).toBeDefined()
  })
})
