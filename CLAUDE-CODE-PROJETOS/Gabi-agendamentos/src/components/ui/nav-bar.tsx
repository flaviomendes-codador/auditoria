'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/painel', icon: '📊', label: 'Painel' },
  { href: '/agenda', icon: '📅', label: 'Agenda' },
  { href: '/pacientes', icon: '👤', label: 'Pacientes' },
  { href: '/mensagens', icon: '💬', label: 'Mensagens' },
  { href: '/ajustes', icon: '⚙️', label: 'Ajustes' },
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-surface-border bg-white pb-[env(safe-area-inset-bottom)] pt-2.5">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 text-[0.62rem] font-medium transition-colors ${
              isActive ? 'text-brand-500' : 'text-gray-300'
            }`}
          >
            <span className="font-emoji text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
