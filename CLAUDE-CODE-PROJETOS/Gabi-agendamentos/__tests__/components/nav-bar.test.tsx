import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NavBar } from '@/components/ui/nav-bar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/painel',
}))

describe('NavBar', () => {
  it('renderiza 5 itens de navegacao', () => {
    render(<NavBar />)
    expect(screen.getByText('Painel')).toBeDefined()
    expect(screen.getByText('Agenda')).toBeDefined()
    expect(screen.getByText('Pacientes')).toBeDefined()
    expect(screen.getByText('Mensagens')).toBeDefined()
    expect(screen.getByText('Ajustes')).toBeDefined()
  })
})
