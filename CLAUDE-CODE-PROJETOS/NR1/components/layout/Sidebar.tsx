'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { filterNavGroups, type Perfil } from './nav-items'

const PERFIL_LABEL: Record<Perfil, string> = {
  rh_operacional: 'RH Operacional',
  gestor: 'Gestor',
  responsavel_tecnico: 'Resp. Técnico',
  admin: 'Administrador',
}

interface SidebarProps {
  perfil: Perfil
  collapsed: boolean
  nomeOrganizacao: string
}

export function Sidebar({ perfil, collapsed, nomeOrganizacao }: SidebarProps) {
  const pathname = usePathname()
  const groups = filterNavGroups(perfil)

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-slate-50 border-r border-slate-200 transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo + nome da organização */}
      <div className={cn(
        'flex items-center border-b border-slate-200 shrink-0',
        collapsed ? 'h-14 justify-center px-0' : 'h-14 px-4 gap-3'
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-cyan-600 text-white font-bold text-sm">
          N1
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 leading-tight">
              {nomeOrganizacao}
            </p>
            <p className="text-xs text-slate-500">{PERFIL_LABEL[perfil]}</p>
          </div>
        )}
      </div>

      {/* Grupos de navegação */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5 px-2">
              {group.items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                const Icon = item.icon

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'group flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600',
                        isActive
                          ? 'border-l-2 border-cyan-600 bg-slate-100 text-slate-900 pl-[6px]'
                          : 'border-l-2 border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 pl-[6px]',
                        collapsed && 'justify-center px-0 pl-0 border-l-0'
                      )}
                    >
                      <Icon
                        size={18}
                        className={cn(
                          'shrink-0 transition-colors',
                          isActive ? 'text-cyan-600' : 'text-slate-400 group-hover:text-slate-600'
                        )}
                      />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
