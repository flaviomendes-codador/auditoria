'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Perfil } from './nav-items'

const PERFIL_LABEL: Record<Perfil, string> = {
  rh_operacional: 'RH Operacional',
  gestor: 'Gestor',
  responsavel_tecnico: 'Resp. Técnico',
  admin: 'Administrador',
}

interface TopbarProps {
  nomeUsuario: string
  emailUsuario: string
  perfil: Perfil
  onMenuClick: () => void
}

export function Topbar({ nomeUsuario, emailUsuario, perfil, onMenuClick }: TopbarProps) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4">
      {/* Botão hamburger (mobile + toggle desktop) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        aria-label="Alternar menu"
        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
      >
        <Menu size={18} />
      </Button>

      {/* Busca global */}
      <div className="flex flex-1 items-center">
        <button
          className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 w-full max-w-xs"
          onClick={() => {/* TODO: abrir command palette */}}
          aria-label="Busca global"
        >
          <Search size={14} />
          <span>Buscar...</span>
          <kbd className="ml-auto hidden rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 sm:inline">
            Ctrl K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1">
        {/* Notificações */}
        <Button
          variant="ghost"
          size="sm"
          aria-label="Notificações"
          className="relative h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
        >
          <Bell size={18} />
          {/* Badge de contador — renderizar quando houver notificações */}
          {/* <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" /> */}
        </Button>

        {/* Menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 h-8 px-2 text-sm text-slate-700 hover:text-slate-900"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold">
                {nomeUsuario.charAt(0).toUpperCase()}
              </div>
              <span className="hidden max-w-[120px] truncate sm:block">
                {nomeUsuario}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-slate-900">{nomeUsuario}</p>
                <p className="text-xs text-slate-500 truncate">{emailUsuario}</p>
                <p className="text-xs text-slate-400">{PERFIL_LABEL[perfil]}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <User size={14} />
              Meu perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Settings size={14} />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-red-600 focus:text-red-600 cursor-pointer"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              <LogOut size={14} />
              {signingOut ? 'Saindo...' : 'Sair'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
