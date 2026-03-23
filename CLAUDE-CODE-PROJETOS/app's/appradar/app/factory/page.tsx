'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { formatMRR } from '@/lib/utils'
import {
  Factory, Rocket, Target, Wrench, Megaphone, ShoppingBag,
  ChevronDown, ChevronUp, ArrowRight, CheckCircle, Circle,
  Clock, Loader2, X, Copy, ExternalLink, Mail, Smartphone,
  TrendingUp, Zap, Globe, AlertTriangle
} from 'lucide-react'

interface PipelineApp {
  id: string
  app_name: string
  app_icon: string | null
  category: string | null
  radar_score: number
  combined_mrr: number | null
  mrr_estimated: number | null
  clone_difficulty: string | null
  status: string
  current_phase: number
  estimated_days: number
  target_markets: string[]
  selected_at: string
  started_at: string | null
  launched_at: string | null
}

interface Teardown {
  app_name: string
  category: string
  value_proposition: string
  core_features: string[]
  loved_features: string[]
  pain_points: string[]
  improvements: string[]
  stack_recommendation: { frontend: string; backend: string; database: string; deploy: string; extras: string[] }
  monetization_model: { type: string; original_pricing: any[]; clone_pricing: { name: string; price: string; price_value: number; features: string[] }[]; trial_days: number }
  estimated_days: number
  target_markets: string[]
  competitive_edge: string
  icp: { age_range: string; gender_skew: string; income_level: string; primary_pain: string; secondary_pains: string[]; use_context: string; device_preference: string; language_gap: string[] }
  competitors_local: { name: string; country: string; rating: number; installs: string; weaknesses: string[] }[]
  market_sizing: { tam: number; sam: number; som: number; confidence: string }
  positioning: string[]
  gap_analysis: { language_gap: boolean; pricing_gap: boolean; feature_gaps: string[]; ux_gaps: string[] }
  languages_supported: string[]
  screenshots_count: number
  content_rating: string
  tech_stack_original: string[]
}

interface BuildChecklist {
  phases: { name: string; items: { id: string; label: string; done: boolean }[] }[]
  total_items: number
  completed_items: number
}

interface FunnelPack {
  landing_page: { headline: string; subheadline: string; cta: string; hero_bullets: string[]; social_proof: string; urgency: string }
  quiz_flow: { title: string; questions: { question: string; options: string[] }[]; result_cta: string }
  email_sequence: { subject: string; preview: string; purpose: string; send_day: number }[]
}

interface GTMPack {
  ad_creatives: { platform: string; format: string; headline: string; primary_text: string; cta: string }[]
  social_accounts: { platform: string; handle_suggestion: string; bio: string; setup_done: boolean }[]
  launch_checklist: { id: string; label: string; done: boolean }[]
}

interface AppDetail {
  selection: any
  teardown: Teardown
  build_checklist: BuildChecklist
  funnel_pack: FunnelPack
  gtm_pack: GTMPack
}

const PHASES = [
  { num: 1, name: 'Análise', icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  { num: 2, name: 'Build', icon: Wrench, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  { num: 3, name: 'Funis', icon: Megaphone, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { num: 4, name: 'Go-to-Market', icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  selected: { label: 'Selecionado', color: 'text-indigo-400' },
  analyzing: { label: 'Analisando', color: 'text-amber-400' },
  building: { label: 'Construindo', color: 'text-cyan-400' },
  launched: { label: 'Lançado', color: 'text-emerald-400' },
}

export default function FactoryPage() {
  const [pipeline, setPipeline] = useState<PipelineApp[]>([])
  const [kpis, setKpis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [detail, setDetail] = useState<AppDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [activePhase, setActivePhase] = useState(1)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generatedProject, setGeneratedProject] = useState<any>(null)
  const [generating, setGenerating] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const fetchPipeline = useCallback(async () => {
    try {
      const res = await fetch('/api/factory')
      if (res.ok) {
        const data = await res.json()
        setPipeline(data.pipeline || [])
        setKpis(data.kpis || null)
      }
    } catch { /* silencioso */ }
    setLoading(false)
  }, [])

  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/factory?id=${id}`)
      if (res.ok) {
        const data = await res.json()
        setDetail(data)
      }
    } catch { /* silencioso */ }
    setDetailLoading(false)
  }, [])

  const advancePhase = useCallback(async (id: string, action: string) => {
    const res = await fetch('/api/factory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    if (res.ok) {
      await fetchPipeline()
      if (selectedApp === id) fetchDetail(id)
    }
  }, [fetchPipeline, fetchDetail, selectedApp])

  useEffect(() => { fetchPipeline() }, [fetchPipeline])

  useEffect(() => {
    if (selectedApp) fetchDetail(selectedApp)
  }, [selectedApp, fetchDetail])

  const generateApp = useCallback(async (selId: string) => {
    setGenerating(true)
    try {
      const res = await fetch(`/api/factory/generate?id=${selId}`)
      if (res.ok) {
        const data = await res.json()
        setGeneratedProject(data)
        const firstFile = Object.keys(data.files)[0]
        if (firstFile) setSelectedFile(firstFile)
      }
    } catch { /* silencioso */ }
    setGenerating(false)
  }, [])

  const downloadSetupScript = useCallback(() => {
    if (!generatedProject) return
    const { slug, files, setup_commands } = generatedProject
    let script = `#!/bin/bash\n# Setup script para ${slug}\n# Gerado pelo AppRadar MVP Factory\n\nmkdir -p ${slug}\ncd ${slug}\n\n`
    for (const [path, content] of Object.entries(files)) {
      const dir = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : ''
      if (dir) script += `mkdir -p "${dir}"\n`
      const escaped = (content as string).replace(/'/g, "'\\''")
      script += `cat > '${path}' << 'ENDOFFILE'\n${escaped}\nENDOFFILE\n\n`
    }
    script += `\necho "Projeto ${slug} criado!"\necho "Próximos passos:"\n${setup_commands.map((c: string) => `echo "  ${c}"`).join('\n')}\n`
    const blob = new Blob([script], { type: 'text/x-shellscript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `setup-${slug}.sh`; a.click()
    URL.revokeObjectURL(url)
  }, [generatedProject])

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            Agente 2 — Produção Automática
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-2 leading-tight">
          Fábrica <span className="text-gradient">MVP</span>
        </h1>
        <p className="text-slate-400 text-base">
          4 fases: Análise → Build → Funis → Go-to-Market. Selecione um app para ver o plano completo.
        </p>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Factory size={14} className="text-indigo-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">No Pipeline</span>
            </div>
            <p className="text-2xl font-bold">{kpis.total}</p>
          </div>
          {Object.entries(kpis.by_status).map(([status, count]) => {
            const cfg = STATUS_LABELS[status]
            if (!cfg) return null
            return (
              <div key={status} className="card p-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{cfg.label}</span>
                <p className={`text-2xl font-bold ${cfg.color}`}>{count as number}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Pipeline list + Detail */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Pipeline */}
        <div className="col-span-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Pipeline</h2>

          {loading && (
            <div className="card p-8 text-center">
              <Loader2 size={20} className="animate-spin text-indigo-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Carregando pipeline...</p>
            </div>
          )}

          {!loading && pipeline.length === 0 && (
            <div className="card p-8 text-center">
              <Factory size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-slate-300 font-semibold mb-1">Pipeline vazio</p>
              <p className="text-sm text-slate-500">Selecione apps no Radar para começar a produzir.</p>
            </div>
          )}

          {pipeline.map(app => (
            <button
              key={app.id}
              onClick={() => { setSelectedApp(app.id); setActivePhase(app.current_phase || 1) }}
              className={`w-full text-left card card-hover p-4 transition-all ${selectedApp === app.id ? 'border-indigo-500' : ''}`}
            >
              <div className="flex items-center gap-3">
                {app.app_icon ? (
                  <Image src={app.app_icon} alt={app.app_name} width={40} height={40} className="rounded-xl object-cover" unoptimized />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-sm font-bold text-indigo-300">
                    {app.app_name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{app.app_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500">{app.category}</span>
                    <span className="text-[10px] text-slate-600">·</span>
                    <span className={`text-[10px] font-semibold ${STATUS_LABELS[app.status]?.color || 'text-slate-400'}`}>
                      {STATUS_LABELS[app.status]?.label || app.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400">{formatMRR(app.combined_mrr || app.mrr_estimated || 0)}</p>
                  <p className="text-[10px] text-slate-600">~{app.estimated_days}d</p>
                </div>
              </div>

              {/* Phase progress bar */}
              <div className="flex items-center gap-1 mt-3">
                {PHASES.map(ph => (
                  <div
                    key={ph.num}
                    className={`flex-1 h-1.5 rounded-full ${
                      app.current_phase >= ph.num ? 'bg-indigo-500' : 'bg-[#2a2a3e]'
                    }`}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Right: Detail */}
        <div className="col-span-8">
          {!selectedApp && !detailLoading && (
            <div className="card p-16 text-center">
              <Target size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-slate-400 font-semibold">Selecione um app no pipeline</p>
              <p className="text-sm text-slate-600 mt-1">para ver o plano completo das 4 fases</p>
            </div>
          )}

          {detailLoading && (
            <div className="card p-16 text-center">
              <Loader2 size={24} className="animate-spin text-indigo-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Gerando plano...</p>
            </div>
          )}

          {detail && !detailLoading && (
            <div>
              {/* Phase tabs */}
              <div className="flex gap-2 mb-4">
                {PHASES.map(ph => (
                  <button
                    key={ph.num}
                    onClick={() => setActivePhase(ph.num)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      activePhase === ph.num
                        ? `${ph.bg} ${ph.color}`
                        : 'border-transparent text-slate-500 hover:text-white hover:bg-[#1e1e2e]'
                    }`}
                  >
                    <ph.icon size={14} />
                    {ph.name}
                  </button>
                ))}
              </div>

              {/* Phase 1: Análise */}
              {activePhase === 1 && (
                <div className="space-y-4">
                  {/* Teardown */}
                  <div className="card p-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Target size={14} className="text-indigo-400" /> Teardown — {detail.teardown.app_name}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Features Core para Clonar</p>
                        <ul className="space-y-1.5">
                          {detail.teardown.core_features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                              <Circle size={8} className="text-indigo-400 flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Melhorias para LatAm</p>
                        <ul className="space-y-1.5">
                          {detail.teardown.improvements.map((imp, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-emerald-400">
                              <Zap size={8} className="flex-shrink-0" />
                              {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 p-3 bg-white/[0.02] rounded-lg border border-white/5">
                      <span className="text-white font-semibold">Edge competitivo:</span> {detail.teardown.competitive_edge}
                    </p>
                  </div>

                  {/* Stack */}
                  <div className="card p-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Wrench size={14} className="text-cyan-400" /> Stack Recomendada
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                      {Object.entries(detail.teardown.stack_recommendation).filter(([k]) => k !== 'extras').map(([key, val]) => (
                        <div key={key} className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                          <p className="text-[10px] text-slate-500 uppercase">{key}</p>
                          <p className="text-xs font-semibold text-white mt-1">{val as string}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {detail.teardown.stack_recommendation.extras.map((e, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Monetização */}
                  <div className="card p-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <TrendingUp size={14} className="text-emerald-400" /> Modelo de Monetização
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {detail.teardown.monetization_model.clone_pricing.map((tier: any, i: number) => (
                        <div key={i} className={`rounded-lg p-4 border ${i === 1 ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-white/[0.02] border-white/5'}`}>
                          <p className="text-xs font-bold text-white">{tier.name}</p>
                          <p className={`text-lg font-bold mt-1 ${i === 1 ? 'text-indigo-400' : 'text-slate-300'}`}>{tier.price}</p>
                          <ul className="mt-2 space-y-1">
                            {tier.features.map((f: string, j: number) => (
                              <li key={j} className="text-[10px] text-slate-500 flex items-center gap-1">
                                <CheckCircle size={8} className={i === 1 ? 'text-indigo-400' : 'text-slate-600'} />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                      Trial: <span className="text-white font-semibold">{detail.teardown.monetization_model.trial_days} dias grátis</span> · Tipo: {detail.teardown.monetization_model.type}
                    </p>
                  </div>

                  {/* Action */}
                  {detail.selection.status === 'selected' && (
                    <button
                      onClick={() => advancePhase(detail.selection.id, 'start_analysis')}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
                    >
                      <ArrowRight size={14} /> Iniciar Análise
                    </button>
                  )}
                </div>
              )}

              {/* Phase 2: Build */}
              {activePhase === 2 && (
                <div className="space-y-4">
                  {/* Generate App Button */}
                  <div className="card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Zap size={14} className="text-amber-400" /> Gerar Projeto Completo
                      </h3>
                      <span className="text-xs text-slate-500">~{detail.teardown.estimated_days} dias estimados</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      Gera um projeto Next.js completo com auth, paywall, páginas por categoria, schema Supabase e deploy config.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => generateApp(detail.selection.id)}
                        disabled={generating}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
                      >
                        {generating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                        {generating ? 'Gerando...' : 'Gerar App Agora'}
                      </button>
                      {generatedProject && (
                        <button
                          onClick={downloadSetupScript}
                          className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20"
                        >
                          <ArrowRight size={14} /> Download .sh
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Generated Project Viewer */}
                  {generatedProject && (
                    <div className="card overflow-hidden">
                      <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white">{generatedProject.app_name}</h3>
                          <p className="text-[10px] text-slate-500">{Object.keys(generatedProject.files).length} arquivos · {generatedProject.category}</p>
                        </div>
                        <div className="flex gap-2">
                          {generatedProject.setup_commands.slice(0, 3).map((cmd: string, i: number) => (
                            <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono">
                              {cmd}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-12" style={{ height: 420 }}>
                        {/* File tree */}
                        <div className="col-span-4 border-r border-white/5 overflow-y-auto p-2">
                          {Object.keys(generatedProject.files).map((path: string) => (
                            <button
                              key={path}
                              onClick={() => setSelectedFile(path)}
                              className={`w-full text-left px-2 py-1 rounded text-[11px] font-mono truncate transition-colors ${
                                selectedFile === path ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-500 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {path}
                            </button>
                          ))}
                        </div>
                        {/* Code viewer */}
                        <div className="col-span-8 overflow-auto p-4">
                          {selectedFile && (
                            <div className="relative">
                              <button
                                onClick={() => copyText(generatedProject.files[selectedFile], `file-${selectedFile}`)}
                                className="absolute top-0 right-0 text-slate-600 hover:text-indigo-400 transition-colors"
                              >
                                {copiedId === `file-${selectedFile}` ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
                              </button>
                              <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                                {generatedProject.files[selectedFile]}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Build Checklist */}
                  <div className="card p-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Wrench size={14} className="text-cyan-400" /> Checklist de Build
                    </h3>
                    {detail.build_checklist.phases.map((phase, pi) => (
                      <div key={pi} className="mb-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{phase.name}</p>
                        <div className="space-y-1.5">
                          {phase.items.map(item => (
                            <div key={item.id} className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg hover:bg-white/[0.02]">
                              <Circle size={12} className="text-slate-600 flex-shrink-0" />
                              <span className="text-xs text-slate-300">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {detail.selection.status === 'analyzing' && (
                    <button
                      onClick={() => advancePhase(detail.selection.id, 'start_build')}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-cyan-500/20"
                    >
                      <Wrench size={14} /> Iniciar Build
                    </button>
                  )}
                </div>
              )}

              {/* Phase 3: Funis & Copy */}
              {activePhase === 3 && (
                <div className="space-y-4">
                  {/* Landing Page */}
                  <div className="card p-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Globe size={14} className="text-amber-400" /> Landing Page Copy
                    </h3>
                    <div className="space-y-3">
                      <CopyableField label="Headline" value={detail.funnel_pack.landing_page.headline} onCopy={copyText} copiedId={copiedId} />
                      <CopyableField label="Subheadline" value={detail.funnel_pack.landing_page.subheadline} onCopy={copyText} copiedId={copiedId} />
                      <CopyableField label="CTA" value={detail.funnel_pack.landing_page.cta} onCopy={copyText} copiedId={copiedId} />
                      <CopyableField label="Social Proof" value={detail.funnel_pack.landing_page.social_proof} onCopy={copyText} copiedId={copiedId} />
                      <CopyableField label="Urgência" value={detail.funnel_pack.landing_page.urgency} onCopy={copyText} copiedId={copiedId} />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Bullets do Hero</p>
                        <ul className="space-y-1">
                          {detail.funnel_pack.landing_page.hero_bullets.map((b, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                              <CheckCircle size={10} className="text-amber-400" /> {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Quiz */}
                  <div className="card p-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Smartphone size={14} className="text-purple-400" /> Quiz Flow
                    </h3>
                    <CopyableField label="Título do Quiz" value={detail.funnel_pack.quiz_flow.title} onCopy={copyText} copiedId={copiedId} />
                    <div className="mt-3 space-y-3">
                      {detail.funnel_pack.quiz_flow.questions.map((q, i) => (
                        <div key={i} className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                          <p className="text-xs font-semibold text-white mb-2">Q{i + 1}: {q.question}</p>
                          <div className="flex flex-wrap gap-2">
                            {q.options.map((o, j) => (
                              <span key={j} className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                {o}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <CopyableField label="CTA do Resultado" value={detail.funnel_pack.quiz_flow.result_cta} onCopy={copyText} copiedId={copiedId} />
                  </div>

                  {/* Email Sequence */}
                  <div className="card p-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Mail size={14} className="text-indigo-400" /> Email Sequence ({detail.funnel_pack.email_sequence.length} emails)
                    </h3>
                    <div className="space-y-2">
                      {detail.funnel_pack.email_sequence.map((email, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-xs font-bold text-indigo-300 flex-shrink-0">
                            D{email.send_day}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{email.subject}</p>
                            <p className="text-[10px] text-slate-500">{email.preview}</p>
                          </div>
                          <span className="text-[10px] text-slate-600 flex-shrink-0">{email.purpose}</span>
                          <button
                            onClick={() => copyText(email.subject, `email-${i}`)}
                            className="text-slate-600 hover:text-indigo-400 transition-colors flex-shrink-0"
                          >
                            {copiedId === `email-${i}` ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Phase 4: Go-to-Market */}
              {activePhase === 4 && (
                <div className="space-y-4">
                  {/* Ad Creatives */}
                  <div className="card p-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Megaphone size={14} className="text-emerald-400" /> Criativos de Ads
                    </h3>
                    <div className="space-y-3">
                      {detail.gtm_pack.ad_creatives.map((ad, i) => (
                        <div key={i} className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-white">{ad.platform}</span>
                            <span className="text-[10px] text-slate-500">{ad.format}</span>
                          </div>
                          <CopyableField label="Headline" value={ad.headline} onCopy={copyText} copiedId={copiedId} />
                          <CopyableField label="Texto" value={ad.primary_text} onCopy={copyText} copiedId={copiedId} />
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              CTA: {ad.cta}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Social Accounts */}
                  <div className="card p-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Globe size={14} className="text-purple-400" /> Contas Sociais
                    </h3>
                    <div className="space-y-2">
                      {detail.gtm_pack.social_accounts.map((acc, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/5">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white">{acc.platform}</span>
                              <span className="text-xs text-indigo-400 font-mono">{acc.handle_suggestion}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">{acc.bio}</p>
                          </div>
                          <button
                            onClick={() => copyText(acc.bio, `bio-${i}`)}
                            className="text-slate-600 hover:text-indigo-400 transition-colors"
                          >
                            {copiedId === `bio-${i}` ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Launch Checklist */}
                  <div className="card p-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Rocket size={14} className="text-amber-400" /> Launch Checklist
                    </h3>
                    <div className="space-y-1.5">
                      {detail.gtm_pack.launch_checklist.map(item => (
                        <div key={item.id} className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg hover:bg-white/[0.02]">
                          <Circle size={12} className="text-slate-600 flex-shrink-0" />
                          <span className="text-xs text-slate-300">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {detail.selection.status === 'building' && (
                    <button
                      onClick={() => advancePhase(detail.selection.id, 'launch')}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <Rocket size={14} /> Marcar como Lançado
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CopyableField({ label, value, onCopy, copiedId }: {
  label: string; value: string; onCopy: (text: string, id: string) => void; copiedId: string | null
}) {
  const id = `${label}-${value.slice(0, 10)}`
  return (
    <div className="flex items-start gap-2 mb-2">
      <div className="flex-1">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-xs text-slate-300 mt-0.5">{value}</p>
      </div>
      <button
        onClick={() => onCopy(value, id)}
        className="text-slate-600 hover:text-indigo-400 transition-colors mt-3 flex-shrink-0"
      >
        {copiedId === id ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
      </button>
    </div>
  )
}
