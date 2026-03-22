'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Radar, Search, ChevronDown, ChevronUp, Target, TrendingUp, Zap, Globe, Star, Clock, AlertTriangle, CheckCircle, Filter, Loader2, Rocket, X, ArrowRight, Activity, Bell, History } from 'lucide-react'
import { formatMRR } from '@/lib/utils'

interface RadarApp {
  appId: string
  bundleId: string
  name: string
  icon: string
  category: string
  storeUrl: string
  price: number
  rankUS: number
  rankBR: number | null
  rankMX: number | null
  rankIN: number | null
  rankGB: number | null
  mrr_estimated: number
  mrr_range: { low: number; mid: number; high: number }
  opportunity_score: number
  clone_difficulty: 'Easy' | 'Medium' | 'Hard'
  radar_score: number
  latam_penetration: number
  india_penetration: number
  latam_absent: boolean
  india_absent: boolean
  reviewCount: number
  rating: number
  monetization: string
  androidMatch: boolean
  androidRankUS: number | null
  androidRankBR: number | null
  androidRankIN: number | null
  androidInstalls: string
  androidMRR: number
  combinedMRR: number
  platform: 'iOS' | 'Android' | 'Both'
  trendScore: number
  trendDirection: 'rising' | 'stable' | 'declining' | 'unknown'
  why_opportunity: string[]
  suggested_improvements: string[]
  target_markets: string[]
  data_sources: string[]
  last_scanned: string
}

interface RadarReport {
  scanned_at: string
  total_scanned: number
  total_qualified: number
  categories_scanned: string[]
  top_apps: RadarApp[]
  scan_duration_ms: number
  data_sources: string[]
  android_coverage: number
  trending_categories: string[]
  elapsed_ms: number
  report_id?: string
}

interface Selection {
  id: string
  app_name: string
  app_icon: string | null
  category: string | null
  radar_score: number
  combined_mrr: number | null
  mrr_estimated: number | null
  clone_difficulty: string | null
  status: string
  selected_at: string
  bundle_id: string
}

const DIFFICULTY_CONFIG = {
  Easy:   { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Facil' },
  Medium: { color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   label: 'Medio' },
  Hard:   { color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',       label: 'Dificil' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  selected:  { label: 'Selecionado', color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20' },
  analyzing: { label: 'Analisando',  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  building:  { label: 'Construindo', color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20' },
  launched:  { label: 'Lancado',     color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  discarded: { label: 'Descartado',  color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
}

function RadarScoreCircle({ score }: { score: number }) {
  const color = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'
  const bgRing = score >= 75 ? 'border-emerald-500/30' : score >= 50 ? 'border-amber-500/30' : 'border-red-500/30'
  return (
    <div className={`w-14 h-14 rounded-full border-2 ${bgRing} flex items-center justify-center`}>
      <span className={`text-lg font-bold ${color}`}>{score}</span>
    </div>
  )
}

function AppCard({ app, rank, reportId, onSelect, selectedBundles }: {
  app: RadarApp
  rank: number
  reportId?: string
  onSelect: (app: RadarApp) => void
  selectedBundles: Set<string>
}) {
  const [expanded, setExpanded] = useState(false)
  const diff = DIFFICULTY_CONFIG[app.clone_difficulty]
  const isSelected = selectedBundles.has(app.bundleId)

  return (
    <div className="glass card-hover rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Rank badge */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-300">#{rank}</span>
          </div>

          {/* App icon */}
          <div className="flex-shrink-0">
            {app.icon ? (
              <Image src={app.icon} alt={app.name} width={48} height={48} className="rounded-xl object-cover" unoptimized />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                {app.name[0]}
              </div>
            )}
          </div>

          {/* App info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <a href={app.storeUrl} target="_blank" rel="noopener noreferrer"
                className="text-white font-semibold text-sm hover:text-indigo-400 transition-colors truncate">
                {app.name}
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{app.category}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${diff.bg} ${diff.color}`}>
                Clone: {diff.label}
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                {app.monetization}
              </span>
              {app.latam_absent && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  Ausente LatAm
                </span>
              )}
              {app.india_absent && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  Ausente India
                </span>
              )}
              {app.platform === 'Both' && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  iOS + Android
                </span>
              )}
              {app.trendDirection === 'rising' && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  Trending
                </span>
              )}
            </div>
          </div>

          {/* Radar Score */}
          <div className="flex-shrink-0">
            <RadarScoreCircle score={app.radar_score} />
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">MRR Combinado</p>
            <p className="text-sm font-bold text-emerald-400">{formatMRR(app.combinedMRR || app.mrr_estimated)}</p>
            <p className="text-[9px] text-slate-600">
              iOS {formatMRR(app.mrr_estimated)}{app.androidMRR > 0 ? ` + Android ${formatMRR(app.androidMRR)}` : ''}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Rank US</p>
            <p className="text-sm font-bold text-white">#{app.rankUS}</p>
            <p className="text-[9px] text-slate-600">{app.category}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">LatAm Gap</p>
            <p className="text-sm font-bold text-amber-400">{app.latam_absent ? 'N/A' : `${app.latam_penetration}%`}</p>
            <p className="text-[9px] text-slate-600">
              {app.rankBR ? `BR #${app.rankBR}` : 'S/ rank BR'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">India Gap</p>
            <p className="text-sm font-bold text-cyan-400">{app.india_absent ? 'N/A' : `${app.india_penetration}%`}</p>
            <p className="text-[9px] text-slate-600">
              {app.rankIN ? `IN #${app.rankIN}` : 'S/ rank IN'}
            </p>
          </div>
        </div>

        {/* Rating & Reviews */}
        {app.rating > 0 && (
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Star size={11} className="text-amber-400" />
              <span>{app.rating.toFixed(1)}</span>
            </div>
            <span>{app.reviewCount.toLocaleString()} reviews</span>
            {app.target_markets.length > 0 && (
              <>
                <span className="text-slate-700">|</span>
                <span className="text-indigo-400">Target: {app.target_markets.join(', ')}</span>
              </>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Menos detalhes' : 'Por que clonar? + Melhorias'}
          </button>
          <button
            onClick={() => onSelect(app)}
            disabled={isSelected}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isSelected
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                : 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30'
            }`}
          >
            {isSelected ? <CheckCircle size={12} /> : <Rocket size={12} />}
            {isSelected ? 'Selecionado' : 'Produzir'}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-white/5 p-5 space-y-4 bg-white/[0.01]">
          {/* Why opportunity */}
          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Target size={12} /> Por que é oportunidade
            </h4>
            <ul className="space-y-1.5">
              {app.why_opportunity.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <CheckCircle size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div>
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap size={12} /> Melhorias sugeridas
            </h4>
            <ul className="space-y-1.5">
              {app.suggested_improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-indigo-500 mt-0.5 flex-shrink-0">&rarr;</span>
                  {imp}
                </li>
              ))}
            </ul>
          </div>

          {/* Rankings detail */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe size={12} /> Rankings por pais
            </h4>
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { flag: '🇺🇸', rank: app.rankUS, label: 'US' },
                { flag: '🇧🇷', rank: app.rankBR, label: 'BR' },
                { flag: '🇲🇽', rank: app.rankMX, label: 'MX' },
                { flag: '🇮🇳', rank: app.rankIN, label: 'IN' },
                { flag: '🇬🇧', rank: app.rankGB, label: 'GB' },
              ].map(c => (
                <div key={c.label} className="bg-white/[0.02] rounded-lg p-2">
                  <p className="text-sm">{c.flag}</p>
                  <p className={`text-xs font-bold ${c.rank ? 'text-white' : 'text-emerald-400'}`}>
                    {c.rank ? `#${c.rank}` : 'N/A'}
                  </p>
                  <p className="text-[9px] text-slate-600">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface AgentStatus {
  active: boolean
  last_scan: string | null
  hours_since_last_scan: number | null
  next_scan: string
  total_scans: number
  active_selections: number
  alerts: { name: string; score: number; category: string }[]
  alerts_count: number
  history: { id: string; scanned_at: string; total_scanned: number; total_qualified: number; scan_duration_ms: number }[]
}

function AgentStatusPanel({ status, showHistory, onToggleHistory }: {
  status: AgentStatus | null
  showHistory: boolean
  onToggleHistory: () => void
}) {
  if (!status) return null

  const isHealthy = status.active && status.hours_since_last_scan !== null && status.hours_since_last_scan < 48

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Agente 1: Radar
          </h2>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${isHealthy ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {isHealthy ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <button
          onClick={onToggleHistory}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors"
        >
          <History size={13} />
          {showHistory ? 'Ocultar' : 'Historico'}
        </button>
      </div>

      {/* Status metrics */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-indigo-400" />
          <div>
            <p className="text-[10px] text-slate-500">Ultimo scan</p>
            <p className="text-xs font-semibold text-white">
              {status.last_scan ? `${status.hours_since_last_scan}h atras` : 'Nunca'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-amber-400" />
          <div>
            <p className="text-[10px] text-slate-500">Proximo scan</p>
            <p className="text-xs font-semibold text-white">06:00 UTC</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Radar size={13} className="text-cyan-400" />
          <div>
            <p className="text-[10px] text-slate-500">Total scans</p>
            <p className="text-xs font-semibold text-white">{status.total_scans}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Rocket size={13} className="text-purple-400" />
          <div>
            <p className="text-[10px] text-slate-500">Em producao</p>
            <p className="text-xs font-semibold text-white">{status.active_selections}</p>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {status.alerts_count > 0 && (
        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Bell size={12} className="text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">{status.alerts_count} apps com score 90+</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {status.alerts.map(a => (
              <span key={a.name} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                {a.name} ({a.score})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Historico */}
      {showHistory && status.history.length > 0 && (
        <div className="border-t border-white/5 pt-3 mt-3">
          <div className="space-y-1.5">
            {status.history.map(h => (
              <div key={h.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-white/[0.02]">
                <span className="text-slate-400">
                  {new Date(h.scanned_at).toLocaleString('pt-BR')}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500">{h.total_scanned} apps</span>
                  <span className="text-emerald-400 font-semibold">{h.total_qualified} qualificados</span>
                  <span className="text-slate-600">{(h.scan_duration_ms / 1000).toFixed(1)}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SelectionPanel({ selections, onUpdateStatus }: {
  selections: Selection[]
  onUpdateStatus: (id: string, status: string) => void
}) {
  if (selections.length === 0) return null

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Rocket size={16} className="text-indigo-400" />
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Pipeline de Producao
        </h2>
        <span className="text-xs text-slate-500">({selections.length} apps)</span>
      </div>

      <div className="space-y-2">
        {selections.map(sel => {
          const st = STATUS_CONFIG[sel.status] || STATUS_CONFIG.selected
          return (
            <div key={sel.id} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
              {sel.app_icon ? (
                <Image src={sel.app_icon} alt={sel.app_name} width={36} height={36} className="rounded-lg object-cover" unoptimized />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-indigo-600/20 flex items-center justify-center text-sm font-bold text-indigo-300">
                  {sel.app_name[0]}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{sel.app_name}</p>
                <p className="text-[10px] text-slate-500">{sel.category} · Score {sel.radar_score} · {formatMRR(sel.combined_mrr || sel.mrr_estimated || 0)}</p>
              </div>

              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${st.bg} ${st.color}`}>
                {st.label}
              </span>

              {sel.status === 'selected' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateStatus(sel.id, 'analyzing')}
                    className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-amber-400 transition-colors"
                    title="Iniciar analise"
                  >
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => onUpdateStatus(sel.id, 'discarded')}
                    className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-red-400 transition-colors"
                    title="Descartar"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {sel.status === 'analyzing' && (
                <button
                  onClick={() => onUpdateStatus(sel.id, 'building')}
                  className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-cyan-400 transition-colors"
                  title="Iniciar build"
                >
                  <ArrowRight size={14} />
                </button>
              )}
              {sel.status === 'building' && (
                <button
                  onClick={() => onUpdateStatus(sel.id, 'launched')}
                  className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-emerald-400 transition-colors"
                  title="Marcar como lancado"
                >
                  <CheckCircle size={14} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function RadarPage() {
  const [report, setReport] = useState<RadarReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [maxMrr, setMaxMrr] = useState<string>('')
  const [minRadar, setMinRadar] = useState<number>(0)
  const [selections, setSelections] = useState<Selection[]>([])
  const [selectingId, setSelectingId] = useState<string | null>(null)
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const selectedBundles = new Set(selections.map(s => s.bundle_id))

  const fetchSelections = useCallback(async () => {
    try {
      const res = await fetch('/api/radar/select')
      if (res.ok) {
        const data = await res.json()
        setSelections(data.selections || [])
      }
    } catch { /* silencioso */ }
  }, [])

  const fetchAgentStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/radar/status')
      if (res.ok) {
        const data = await res.json()
        setAgentStatus(data)
      }
    } catch { /* silencioso */ }
  }, [])

  const runScan = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (difficulty) params.set('difficulty', difficulty)
      if (maxMrr) params.set('maxMrr', maxMrr)
      if (minRadar > 0) params.set('minRadar', String(minRadar))
      params.set('limit', '30')

      const res = await fetch(`/api/radar?${params}`)
      if (!res.ok) throw new Error('Falha no scan')
      const data = await res.json()
      setReport(data)
      fetchAgentStatus()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [difficulty, maxMrr, minRadar, fetchAgentStatus])

  const handleSelect = useCallback(async (app: RadarApp) => {
    setSelectingId(app.bundleId)
    try {
      const res = await fetch('/api/radar/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app, report_id: report?.report_id }),
      })
      if (res.ok) {
        await fetchSelections()
      }
    } catch { /* silencioso */ }
    setSelectingId(null)
  }, [report?.report_id, fetchSelections])

  const handleUpdateStatus = useCallback(async (id: string, status: string) => {
    try {
      const res = await fetch('/api/radar/select', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        await fetchSelections()
      }
    } catch { /* silencioso */ }
  }, [fetchSelections])

  useEffect(() => {
    runScan()
    fetchSelections()
    fetchAgentStatus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
                3 Fontes de Dados Reais
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-2 leading-tight">
              Radar <span className="text-gradient">MVP Factory</span>
            </h1>
            <p className="text-slate-400 text-base">
              Apps para clonar com melhorias para LatAm e India. iTunes + Google Play + Google Trends.
            </p>
          </div>
          <button
            onClick={runScan}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Radar size={15} />}
            {loading ? 'Escaneando...' : 'Rodar Scan'}
          </button>
        </div>
      </div>

      {/* Agent Status */}
      <AgentStatusPanel status={agentStatus} showHistory={showHistory} onToggleHistory={() => setShowHistory(!showHistory)} />

      {/* Pipeline de Producao */}
      <SelectionPanel selections={selections} onUpdateStatus={handleUpdateStatus} />

      {/* KPIs */}
      {report && !loading && (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Search size={14} className="text-indigo-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Apps Escaneados</span>
              </div>
              <p className="text-2xl font-bold">{report.total_scanned}</p>
              <p className="text-[10px] text-slate-600">{report.categories_scanned?.length || 0} categorias</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} className="text-emerald-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Qualificados</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{report.total_qualified}</p>
              <p className="text-[10px] text-slate-600">MRR &gt;= $30K + IAP</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-amber-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Tempo de Scan</span>
              </div>
              <p className="text-2xl font-bold">{((report.elapsed_ms || report.scan_duration_ms) / 1000).toFixed(1)}s</p>
              <p className="text-[10px] text-slate-600">{report.data_sources?.[0]?.split('(')[0] || 'Multi-source'}</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-cyan-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Top Radar Score</span>
              </div>
              <p className="text-2xl font-bold text-cyan-400">
                {report.top_apps?.[0]?.radar_score || 0}
              </p>
              <p className="text-[10px] text-slate-600 truncate">{report.top_apps?.[0]?.name || '—'}</p>
            </div>
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Globe size={14} className="text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Android Match</p>
                <p className="text-sm font-bold text-purple-400">{report.android_coverage || 0}%</p>
              </div>
            </div>
            <div className="card p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <TrendingUp size={14} className="text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Categorias Trending</p>
                <p className="text-sm font-bold text-orange-400">{report.trending_categories?.length || 0}</p>
              </div>
            </div>
            <div className="card p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Zap size={14} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Fontes de Dados</p>
                <p className="text-sm font-bold text-blue-400">{report.data_sources?.length || 1}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Filters */}
      <div className="card p-5 mb-6">
        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="col-span-3">
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Dificuldade Clone
            </label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 bg-[#0f0f17] border border-[#2a2a3e] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="" className="bg-[#1a1a2a]">Todos</option>
              <option value="Easy" className="bg-[#1a1a2a]">Facil</option>
              <option value="Medium" className="bg-[#1a1a2a]">Medio</option>
              <option value="Hard" className="bg-[#1a1a2a]">Dificil</option>
            </select>
          </div>

          <div className="col-span-3">
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              MRR maximo
            </label>
            <select
              value={maxMrr}
              onChange={e => setMaxMrr(e.target.value)}
              className="w-full px-4 py-3 bg-[#0f0f17] border border-[#2a2a3e] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="" className="bg-[#1a1a2a]">Todos</option>
              <option value="100000" className="bg-[#1a1a2a]">Ate $100K</option>
              <option value="250000" className="bg-[#1a1a2a]">Ate $250K</option>
              <option value="500000" className="bg-[#1a1a2a]">Ate $500K</option>
              <option value="1000000" className="bg-[#1a1a2a]">Ate $1M</option>
            </select>
          </div>

          <div className="col-span-4">
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Radar Score minimo: <span className="text-indigo-400">{minRadar}</span>
            </label>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={minRadar}
              onChange={e => setMinRadar(Number(e.target.value))}
              className="w-full h-2 accent-indigo-500 cursor-pointer mt-2.5"
            />
          </div>

          <div className="col-span-2">
            <button
              onClick={runScan}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
            >
              <Filter size={14} />
              Aplicar
            </button>
          </div>
        </div>
      </div>

      {/* Data source disclaimer */}
      <div className="card border-amber-500/20 p-4 mb-6 flex items-start gap-3">
        <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="text-slate-300 font-semibold">3 fontes de dados reais:</span> Rankings do iTunes App Store RSS (iOS) + Google Play Store (Android) + Google Trends (demanda).
          MRR usa modelo power-law calibrado (margem +-45-65%). MRR Combinado = iOS + Android estimados. Trends validam se a categoria esta crescendo.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          <div className="card border-indigo-500/20 p-3 mb-2 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse flex-shrink-0" />
            <p className="text-xs text-slate-400">
              Escaneando 10 categorias em 5 mercados...
              <span className="text-slate-600 ml-1">Isso pode levar 15-30 segundos na primeira vez</span>
            </p>
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#2a2a3e]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#2a2a3e] rounded w-48" />
                <div className="h-3 bg-[#2a2a3e] rounded w-32" />
              </div>
              <div className="w-24 h-8 bg-[#2a2a3e] rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card border-red-500/30 p-4 mb-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-400">Erro ao rodar scan</p>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {report && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Top {report.top_apps.length} Oportunidades para MVP
            </h2>
            <p className="text-[10px] text-slate-600">
              Escaneado em {new Date(report.scanned_at).toLocaleString('pt-BR')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {report.top_apps.map((app, i) => (
              <AppCard
                key={app.bundleId}
                app={app}
                rank={i + 1}
                reportId={report.report_id}
                onSelect={handleSelect}
                selectedBundles={selectedBundles}
              />
            ))}
          </div>

          {report.top_apps.length === 0 && (
            <div className="card p-16 text-center">
              <Radar size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-slate-300 font-semibold mb-1">Nenhum app encontrado</p>
              <p className="text-sm text-slate-500">Tente ajustar os filtros acima.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
