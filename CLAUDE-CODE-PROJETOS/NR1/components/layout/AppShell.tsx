'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import type { Perfil } from './nav-items'

interface AppShellProps {
  children: React.ReactNode
  nomeUsuario: string
  emailUsuario: string
  perfil: Perfil
  nomeOrganizacao: string
}

export function AppShell({
  children,
  nomeUsuario,
  emailUsuario,
  perfil,
  nomeOrganizacao,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function checkMobile() {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setCollapsed(false)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  function handleMenuClick() {
    if (isMobile) {
      setMobileOpen((prev) => !prev)
    } else {
      setCollapsed((prev) => !prev)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar desktop */}
      <div className="hidden md:flex md:flex-col md:shrink-0">
        <Sidebar
          perfil={perfil}
          collapsed={collapsed}
          nomeOrganizacao={nomeOrganizacao}
        />
      </div>

      {/* Sidebar mobile — Sheet overlay */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0 border-0">
          <Sidebar
            perfil={perfil}
            collapsed={false}
            nomeOrganizacao={nomeOrganizacao}
          />
        </SheetContent>
      </Sheet>

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar
          nomeUsuario={nomeUsuario}
          emailUsuario={emailUsuario}
          perfil={perfil}
          onMenuClick={handleMenuClick}
        />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  )
}
