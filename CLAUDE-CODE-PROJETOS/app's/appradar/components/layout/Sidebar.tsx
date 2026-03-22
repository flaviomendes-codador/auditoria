'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Search, TrendingUp, Wifi, RefreshCw, Check, LogOut, User, Radar, Factory } from 'lucide-react'

const NAV = [
  { href: '/',        icon: LayoutDashboard, label: 'Dashboard'     },
  { href: '/radar',   icon: Radar,           label: 'Radar MVP'     },
  { href: '/factory', icon: Factory,         label: 'Fábrica MVP', badge: 'NEW' },
  { href: '/apps',    icon: Search,          label: 'App Explorer'  },
  { href: '/niches',  icon: TrendingUp,      label: 'Nichos'        },
  { href: '/live',    icon: Wifi,            label: 'Live Data', badge: 'LIVE' },
]

export default function Sidebar() {
  const path = usePathname()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [refreshed, setRefreshed] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.name) setUserName(d.name)
    }).catch(() => {})
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    setRefreshed(false)
    try {
      await fetch('/api/refresh')
      setRefreshed(true)
      setTimeout(() => setRefreshed(false), 3000)
    } finally {
      setRefreshing(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  if (path === '/login') return null

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#0c0c14] border-r border-[#1e1e2e] flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-[#1e1e2e]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-lg shadow-lg shadow-indigo-500/20">
            📡
          </div>
          <div>
            <p className="font-bold text-white text-sm">AppRadar</p>
            <p className="text-[11px] text-slate-500">Market Intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 pt-3 pb-2">
          Análise
        </p>
        {NAV.map(({ href, icon: Icon, label, badge }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#1e1e2e]'
              }`}
            >
              <Icon size={15} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </Link>
          )
        })}

        <div className="pt-4">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 pb-2">
            Dados
          </p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-white hover:bg-[#1e1e2e] transition-all disabled:opacity-50"
          >
            {refreshed
              ? <Check size={15} className="text-emerald-400" />
              : <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            }
            {refreshed ? 'Cache atualizado!' : refreshing ? 'Atualizando...' : 'Atualizar Cache'}
          </button>
        </div>
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-[#1e1e2e] space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          <span className="text-xs text-slate-500">iTunes API ativa</span>
        </div>

        {userName && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={13} className="text-slate-500" />
              <span className="text-xs text-slate-400 font-medium">{userName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-600 hover:text-red-400 transition-colors"
              title="Sair"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
