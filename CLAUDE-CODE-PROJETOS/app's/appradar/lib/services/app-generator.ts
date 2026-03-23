import type { AppTeardown } from './factory-engine'

// ============================================================
// APP GENERATOR — Gera projeto Next.js completo por categoria
// Output: Record<filepath, content> com todos os arquivos
// ============================================================

export interface GeneratedProject {
  app_name: string
  slug: string
  category: string
  files: Record<string, string>
  setup_commands: string[]
  estimated_minutes: number
}

export function generateAppProject(teardown: AppTeardown): GeneratedProject {
  const slug = teardown.app_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30)
  const appName = teardown.app_name
  const cat = teardown.category
  const price = teardown.monetization_model.clone_pricing[1]?.price || '$4.99/mês'
  const trialDays = teardown.monetization_model.trial_days

  const files: Record<string, string> = {}

  // === package.json ===
  files['package.json'] = JSON.stringify({
    name: slug,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev -p 3000',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
    },
    dependencies: {
      next: '14.2.5',
      react: '^18',
      'react-dom': '^18',
      '@supabase/supabase-js': '^2.39.0',
      '@supabase/ssr': '^0.1.0',
      tailwindcss: '^3.4',
      autoprefixer: '^10',
      postcss: '^8',
      'lucide-react': '^0.344.0',
      'date-fns': '^3.3.0',
      recharts: '^2.12.0',
    },
    devDependencies: {
      typescript: '^5',
      '@types/node': '^20',
      '@types/react': '^18',
      '@types/react-dom': '^18',
    },
  }, null, 2)

  // === next.config.js ===
  files['next.config.js'] = `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
}
module.exports = nextConfig
`

  // === tsconfig.json ===
  files['tsconfig.json'] = JSON.stringify({
    compilerOptions: {
      target: 'es5', lib: ['dom', 'dom.iterable', 'esnext'], allowJs: true, skipLibCheck: true,
      strict: true, noEmit: true, esModuleInterop: true, module: 'esnext', moduleResolution: 'bundler',
      resolveJsonModule: true, isolatedModules: true, jsx: 'preserve', incremental: true,
      plugins: [{ name: 'next' }], paths: { '@/*': ['./*'] },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  }, null, 2)

  // === tailwind.config.ts ===
  files['tailwind.config.ts'] = `import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
      },
    },
  },
  plugins: [],
}
export default config
`

  // === postcss.config.js ===
  files['postcss.config.js'] = `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
`

  // === .env.example ===
  files['.env.example'] = `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
`

  // === .gitignore ===
  files['.gitignore'] = `node_modules/
.next/
.env
.env.local
`

  // === app/globals.css ===
  files['app/globals.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #0f0f17;
  color: #e8eaf0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.card {
  background: #16161f;
  border: 1px solid #2a2a3e;
  border-radius: 16px;
}

.glass {
  background: #16161f;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
}

.btn-primary {
  @apply px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20;
}

.btn-secondary {
  @apply px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-all border border-white/10;
}
`

  // === lib/supabase.ts ===
  files['lib/supabase.ts'] = `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export function isConfigured() {
  return supabaseUrl.length > 0 && supabaseKey.length > 0
}
`

  // === lib/auth.ts ===
  files['lib/auth.ts'] = `import { supabase } from './supabase'

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
`

  // === app/layout.tsx ===
  files['app/layout.tsx'] = `import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${appName}',
  description: '${teardown.competitive_edge.slice(0, 100)}',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
`

  // === components/Navbar.tsx ===
  const navLinks = getCategoryNavLinks(cat)
  files['components/Navbar.tsx'] = `'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ${navLinks.map(n => n.icon).join(', ')}, LogOut, User } from 'lucide-react'

const NAV = [
${navLinks.map(n => `  { href: '${n.href}', icon: ${n.icon}, label: '${n.label}' },`).join('\n')}
]

export default function Navbar() {
  const path = usePathname()

  if (path === '/login' || path === '/register') return null

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0c0c14] border-b border-[#1e1e2e] flex items-center px-6 z-50">
      <Link href="/" className="text-lg font-bold text-white mr-8">${appName}</Link>
      <div className="flex items-center gap-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={\`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all \${
                active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }\`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </div>
      <div className="ml-auto">
        <Link href="/login" className="text-sm text-slate-500 hover:text-white transition-colors">
          <User size={16} />
        </Link>
      </div>
    </nav>
  )
}
`

  // === components/Paywall.tsx ===
  files['components/Paywall.tsx'] = `'use client'

import { useState } from 'react'
import { Check, Zap, Crown } from 'lucide-react'

const TIERS = [
${teardown.monetization_model.clone_pricing.map((t, i) => `  {
    name: '${t.name}',
    price: '${t.price}',
    features: [${t.features.map(f => `'${f}'`).join(', ')}],
    highlighted: ${i === 1},
  },`).join('\n')}
]

export default function Paywall({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (tier: string) => {
    setLoading(true)
    // TODO: integrar com Stripe/RevenueCat
    alert('Integrar com Stripe: ' + tier)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card p-8 max-w-3xl w-full">
        <div className="text-center mb-8">
          <Crown size={32} className="mx-auto mb-3 text-amber-400" />
          <h2 className="text-2xl font-bold text-white">Escolha seu plano</h2>
          <p className="text-slate-400 mt-2">Teste grátis por ${trialDays} dias. Cancele quando quiser.</p>
        </div>

        <div className="grid grid-cols-${teardown.monetization_model.clone_pricing.length} gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={\`rounded-2xl p-6 border \${
                tier.highlighted
                  ? 'bg-indigo-600/10 border-indigo-500/30'
                  : 'bg-white/[0.02] border-white/5'
              }\`}
            >
              <h3 className="text-lg font-bold text-white">{tier.name}</h3>
              <p className={\`text-3xl font-bold mt-2 \${tier.highlighted ? 'text-indigo-400' : 'text-slate-300'}\`}>
                {tier.price}
              </p>
              {tier.price !== '$0' && <p className="text-xs text-slate-500 mt-1">por mês</p>}
              <ul className="mt-4 space-y-2">
                {tier.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check size={14} className={tier.highlighted ? 'text-indigo-400' : 'text-slate-600'} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(tier.name)}
                disabled={loading}
                className={\`w-full mt-6 py-3 rounded-xl text-sm font-semibold transition-all \${
                  tier.highlighted
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }\`}
              >
                {tier.price === '$0' ? 'Começar grátis' : 'Assinar'}
              </button>
            </div>
          ))}
        </div>

        {onClose && (
          <button onClick={onClose} className="w-full mt-4 text-sm text-slate-500 hover:text-white transition-colors">
            Talvez depois
          </button>
        )}
      </div>
    </div>
  )
}
`

  // === components/OnboardingQuiz.tsx ===
  files['components/OnboardingQuiz.tsx'] = `'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle } from 'lucide-react'

const QUESTIONS = [
  {
    question: 'Qual seu maior desafio?',
    options: ['Não sei por onde começar', 'Já tentei outros apps', 'Preciso de algo em português', 'Quero algo mais barato'],
  },
  {
    question: 'Com que frequência você usaria?',
    options: ['Todo dia', 'Algumas vezes por semana', 'Quando precisar'],
  },
  {
    question: 'O que mais importa pra você?',
    options: ['Facilidade de uso', 'Preço acessível', 'Funcionalidades completas', 'Suporte em português'],
  },
]

export default function OnboardingQuiz({ onComplete }: { onComplete: (answers: string[]) => void }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      onComplete(newAnswers)
    }
  }

  if (step >= QUESTIONS.length) {
    return (
      <div className="card p-8 text-center max-w-md mx-auto">
        <CheckCircle size={48} className="mx-auto mb-4 text-emerald-400" />
        <h2 className="text-xl font-bold text-white mb-2">Tudo pronto!</h2>
        <p className="text-slate-400">Seu plano personalizado está sendo preparado...</p>
      </div>
    )
  }

  const q = QUESTIONS[step]
  return (
    <div className="card p-8 max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-6">
        {QUESTIONS.map((_, i) => (
          <div key={i} className={\`flex-1 h-1.5 rounded-full \${i <= step ? 'bg-indigo-500' : 'bg-[#2a2a3e]'}\`} />
        ))}
      </div>
      <h2 className="text-lg font-bold text-white mb-4">{q.question}</h2>
      <div className="space-y-2">
        {q.options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleAnswer(opt)}
            className="w-full text-left px-4 py-3 rounded-xl text-sm text-slate-300 bg-white/[0.03] border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-600/10 transition-all flex items-center justify-between"
          >
            {opt}
            <ArrowRight size={14} className="text-slate-600" />
          </button>
        ))}
      </div>
    </div>
  )
}
`

  // === app/login/page.tsx ===
  files['app/login/page.tsx'] = `'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth'
import { LogIn, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-1">${appName}</h1>
        <p className="text-sm text-slate-500 mb-6">Entre na sua conta</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#0f0f17] border border-[#2a2a3e] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
            required
          />
          <input
            type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#0f0f17] border border-[#2a2a3e] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
            required
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Não tem conta? <Link href="/register" className="text-indigo-400 hover:underline">Criar conta</Link>
        </p>
      </div>
    </div>
  )
}
`

  // === app/register/page.tsx ===
  files['app/register/page.tsx'] = `'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth'
import { UserPlus, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signUp(email, password)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-1">${appName}</h1>
        <p className="text-sm text-slate-500 mb-6">Crie sua conta grátis</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#0f0f17] border border-[#2a2a3e] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
            required
          />
          <input
            type="password" placeholder="Senha (min 6 caracteres)" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#0f0f17] border border-[#2a2a3e] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
            required minLength={6}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {loading ? 'Criando...' : 'Criar conta grátis'}
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Já tem conta? <Link href="/login" className="text-indigo-400 hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
`

  // === Category-specific main page ===
  files['app/page.tsx'] = generateMainPage(cat, appName, teardown)

  // === Category-specific feature pages ===
  const featurePages = generateFeaturePages(cat, teardown)
  for (const [path, content] of Object.entries(featurePages)) {
    files[path] = content
  }

  // === Supabase schema ===
  files['supabase/schema.sql'] = generateSupabaseSchema(cat, slug)

  // === vercel.json ===
  files['vercel.json'] = JSON.stringify({ framework: 'nextjs' }, null, 2)

  // === README.md ===
  files['README.md'] = `# ${appName}

Clone localizado para ${teardown.target_markets.join(', ')}.
Categoria: ${cat} | Estimativa: ${teardown.estimated_days} dias

## Setup rápido

\`\`\`bash
npm install
cp .env.example .env.local
# Preencher SUPABASE_URL e SUPABASE_ANON_KEY
npm run dev
\`\`\`

## Deploy

\`\`\`bash
npx vercel
\`\`\`

## Stack
- ${teardown.stack_recommendation.frontend}
- ${teardown.stack_recommendation.backend}
- ${teardown.stack_recommendation.database}
- Deploy: ${teardown.stack_recommendation.deploy}

Gerado automaticamente pelo AppRadar MVP Factory.
`

  return {
    app_name: appName,
    slug,
    category: cat,
    files,
    setup_commands: [
      `mkdir ${slug} && cd ${slug}`,
      'npm install',
      'cp .env.example .env.local',
      '# Editar .env.local com credenciais Supabase',
      '# Rodar schema.sql no Supabase SQL Editor',
      'npm run dev',
    ],
    estimated_minutes: teardown.estimated_days * 8 * 60, // dias úteis em minutos
  }
}

// === Helpers por categoria ===

function getCategoryNavLinks(cat: string): { href: string; icon: string; label: string }[] {
  switch (cat) {
    case 'Finance':
      return [
        { href: '/', icon: 'LayoutDashboard', label: 'Dashboard' },
        { href: '/expenses', icon: 'Receipt', label: 'Gastos' },
        { href: '/reports', icon: 'BarChart3', label: 'Relatórios' },
        { href: '/settings', icon: 'Settings', label: 'Config' },
      ]
    case 'Health & Fitness':
      return [
        { href: '/', icon: 'LayoutDashboard', label: 'Dashboard' },
        { href: '/workouts', icon: 'Dumbbell', label: 'Treinos' },
        { href: '/progress', icon: 'TrendingUp', label: 'Progresso' },
        { href: '/settings', icon: 'Settings', label: 'Config' },
      ]
    case 'Education':
      return [
        { href: '/', icon: 'LayoutDashboard', label: 'Dashboard' },
        { href: '/lessons', icon: 'BookOpen', label: 'Aulas' },
        { href: '/quizzes', icon: 'Brain', label: 'Quizzes' },
        { href: '/settings', icon: 'Settings', label: 'Config' },
      ]
    case 'Productivity':
      return [
        { href: '/', icon: 'LayoutDashboard', label: 'Dashboard' },
        { href: '/tasks', icon: 'CheckSquare', label: 'Tarefas' },
        { href: '/notes', icon: 'FileText', label: 'Notas' },
        { href: '/settings', icon: 'Settings', label: 'Config' },
      ]
    default:
      return [
        { href: '/', icon: 'LayoutDashboard', label: 'Dashboard' },
        { href: '/features', icon: 'Zap', label: 'Features' },
        { href: '/settings', icon: 'Settings', label: 'Config' },
      ]
  }
}

function generateMainPage(cat: string, appName: string, teardown: AppTeardown): string {
  const features = teardown.core_features.slice(0, 4)

  return `'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { ${getCategoryMainIcons(cat)} } from 'lucide-react'

export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem('onboarding-done')
    if (!done) setShowOnboarding(true)
  }, [])

  return (
    <>
      <Navbar />
      <main className="pt-20 px-6 pb-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">${appName}</h1>
          <p className="text-slate-400">${teardown.competitive_edge.slice(0, 80)}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
${features.map((f, i) => `          <div className="card p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">${f}</p>
            <p className="text-2xl font-bold text-white">--</p>
            <p className="text-xs text-emerald-400 mt-1">Configurar</p>
          </div>`).join('\n')}
        </div>

        {/* Main content area */}
        <div className="card p-8 text-center">
          <Zap size={40} className="mx-auto mb-4 text-indigo-400 opacity-50" />
          <h2 className="text-lg font-semibold text-white mb-2">Pronto para começar</h2>
          <p className="text-sm text-slate-500 mb-4">
            Configure o Supabase e comece a construir as features.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/login" className="btn-primary text-sm">Criar conta</a>
            <a href="/settings" className="btn-secondary text-sm">Configurar</a>
          </div>
        </div>
      </main>
    </>
  )
}
`
}

function getCategoryMainIcons(cat: string): string {
  switch (cat) {
    case 'Finance': return 'DollarSign, TrendingUp, PieChart, Zap'
    case 'Health & Fitness': return 'Heart, Activity, Target, Zap'
    case 'Education': return 'BookOpen, Brain, Award, Zap'
    case 'Productivity': return 'CheckSquare, Clock, Calendar, Zap'
    default: return 'LayoutDashboard, Star, Settings, Zap'
  }
}

function generateFeaturePages(cat: string, teardown: AppTeardown): Record<string, string> {
  const pages: Record<string, string> = {}

  // Settings page (all categories)
  pages['app/settings/page.tsx'] = `'use client'

import Navbar from '@/components/Navbar'
import { Settings, Bell, Globe, CreditCard } from 'lucide-react'

export default function SettingsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 px-6 pb-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Configurações</h1>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <Globe size={16} className="text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Idioma</h2>
            </div>
            <select className="w-full px-4 py-3 bg-[#0f0f17] border border-[#2a2a3e] rounded-xl text-white text-sm">
              <option>Português (BR)</option>
              <option>Español</option>
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <Bell size={16} className="text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Notificações</h2>
            </div>
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Lembretes diários</span>
              <input type="checkbox" defaultChecked className="accent-indigo-500" />
            </label>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard size={16} className="text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Assinatura</h2>
            </div>
            <p className="text-sm text-slate-400 mb-3">Plano atual: <span className="text-white font-semibold">Free</span></p>
            <button className="btn-primary text-sm">Fazer upgrade</button>
          </div>
        </div>
      </main>
    </>
  )
}
`

  // Category-specific pages
  switch (cat) {
    case 'Finance':
      pages['app/expenses/page.tsx'] = generateCrudPage('Gastos', 'expenses', [
        { name: 'description', label: 'Descrição', type: 'text' },
        { name: 'amount', label: 'Valor (R$)', type: 'number' },
        { name: 'category', label: 'Categoria', type: 'select', options: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Outros'] },
      ], 'Receipt')
      pages['app/reports/page.tsx'] = generateChartPage('Relatórios', 'BarChart3')
      break
    case 'Health & Fitness':
      pages['app/workouts/page.tsx'] = generateCrudPage('Treinos', 'workouts', [
        { name: 'name', label: 'Exercício', type: 'text' },
        { name: 'sets', label: 'Séries', type: 'number' },
        { name: 'reps', label: 'Repetições', type: 'number' },
        { name: 'weight', label: 'Peso (kg)', type: 'number' },
      ], 'Dumbbell')
      pages['app/progress/page.tsx'] = generateChartPage('Progresso', 'TrendingUp')
      break
    case 'Education':
      pages['app/lessons/page.tsx'] = generateCrudPage('Aulas', 'lessons', [
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'content', label: 'Conteúdo', type: 'text' },
        { name: 'duration', label: 'Duração (min)', type: 'number' },
      ], 'BookOpen')
      pages['app/quizzes/page.tsx'] = generateChartPage('Quizzes', 'Brain')
      break
    case 'Productivity':
      pages['app/tasks/page.tsx'] = generateCrudPage('Tarefas', 'tasks', [
        { name: 'title', label: 'Tarefa', type: 'text' },
        { name: 'priority', label: 'Prioridade', type: 'select', options: ['Alta', 'Média', 'Baixa'] },
        { name: 'due_date', label: 'Prazo', type: 'text' },
      ], 'CheckSquare')
      pages['app/notes/page.tsx'] = generateCrudPage('Notas', 'notes', [
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'content', label: 'Conteúdo', type: 'text' },
      ], 'FileText')
      break
    default:
      pages['app/features/page.tsx'] = generateChartPage('Features', 'Zap')
  }

  return pages
}

function generateCrudPage(
  title: string,
  table: string,
  fields: { name: string; label: string; type: string; options?: string[] }[],
  icon: string
): string {
  return `'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { ${icon}, Plus, Trash2 } from 'lucide-react'

interface Item {
  id: string
${fields.map(f => `  ${f.name}: ${f.type === 'number' ? 'number' : 'string'}`).join('\n')}
}

export default function ${title}Page() {
  const [items, setItems] = useState<Item[]>([])
  const [showForm, setShowForm] = useState(false)
${fields.map(f => `  const [${f.name}, set${f.name.charAt(0).toUpperCase() + f.name.slice(1)}] = useState${f.type === 'number' ? '<number>(0)' : "('')"}`).join('\n')}

  const handleAdd = () => {
    const newItem: Item = {
      id: Date.now().toString(),
${fields.map(f => `      ${f.name},`).join('\n')}
    }
    setItems([newItem, ...items])
    setShowForm(false)
${fields.map(f => `    set${f.name.charAt(0).toUpperCase() + f.name.slice(1)}(${f.type === 'number' ? '0' : "''"});`).join('\n')}
  }

  const handleDelete = (id: string) => {
    setItems(items.filter(i => i.id !== id))
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 px-6 pb-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">${title}</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={14} /> Novo
          </button>
        </div>

        {showForm && (
          <div className="card p-5 mb-4 space-y-3">
${fields.map(f => {
  if (f.type === 'select' && f.options) {
    return `            <div>
              <label className="block text-xs text-slate-500 mb-1">${f.label}</label>
              <select value={${f.name}} onChange={e => set${f.name.charAt(0).toUpperCase() + f.name.slice(1)}(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f0f17] border border-[#2a2a3e] rounded-xl text-white text-sm">
${f.options.map(o => `                <option value="${o}">${o}</option>`).join('\n')}
              </select>
            </div>`
  }
  return `            <div>
              <label className="block text-xs text-slate-500 mb-1">${f.label}</label>
              <input type="${f.type === 'number' ? 'number' : 'text'}" value={${f.name}}
                onChange={e => set${f.name.charAt(0).toUpperCase() + f.name.slice(1)}(${f.type === 'number' ? 'Number(e.target.value)' : 'e.target.value'})}
                className="w-full px-4 py-3 bg-[#0f0f17] border border-[#2a2a3e] rounded-xl text-white text-sm"
                placeholder="${f.label}" />
            </div>`
}).join('\n')}
            <button onClick={handleAdd} className="btn-primary text-sm w-full">Salvar</button>
          </div>
        )}

        {items.length === 0 && !showForm && (
          <div className="card p-12 text-center">
            <${icon} size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-slate-400">Nenhum item ainda</p>
            <p className="text-xs text-slate-600 mt-1">Clique em "Novo" para começar</p>
          </div>
        )}

        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="card card-hover p-4 flex items-center justify-between">
              <div>
${fields.map((f, i) => i === 0
  ? `                <p className="text-sm font-semibold text-white">{item.${f.name}}</p>`
  : `                <span className="text-xs text-slate-500 mr-3">${f.label}: {item.${f.name}}</span>`
).join('\n')}
              </div>
              <button onClick={() => handleDelete(item.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
`
}

function generateChartPage(title: string, icon: string): string {
  return `'use client'

import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import { ${icon} } from 'lucide-react'

const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false })
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

const SAMPLE_DATA = [
  { name: 'Seg', value: 12 },
  { name: 'Ter', value: 19 },
  { name: 'Qua', value: 15 },
  { name: 'Qui', value: 25 },
  { name: 'Sex', value: 22 },
  { name: 'Sáb', value: 30 },
  { name: 'Dom', value: 18 },
]

export default function ${title}Page() {
  return (
    <>
      <Navbar />
      <main className="pt-20 px-6 pb-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">${title}</h1>

        <div className="card p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Últimos 7 dias</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SAMPLE_DATA}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#16161f', border: '1px solid #2a2a3e', borderRadius: 12 }}
                  labelStyle={{ color: '#e8eaf0' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#grad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-8 text-center">
          <${icon} size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-slate-400">Conecte o Supabase para ver dados reais</p>
        </div>
      </main>
    </>
  )
}
`
}

function generateSupabaseSchema(cat: string, slug: string): string {
  let tables = ''

  switch (cat) {
    case 'Finance':
      tables = `
-- Gastos
create table expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  description text not null,
  amount numeric(10,2) not null,
  category text default 'Outros',
  date date default current_date,
  created_at timestamptz default now()
);

alter table expenses enable row level security;
create policy "Users see own expenses" on expenses for select using (auth.uid() = user_id);
create policy "Users insert own expenses" on expenses for insert with check (auth.uid() = user_id);
create policy "Users delete own expenses" on expenses for delete using (auth.uid() = user_id);
`
      break
    case 'Health & Fitness':
      tables = `
-- Treinos
create table workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  sets int default 3,
  reps int default 12,
  weight numeric(5,1) default 0,
  date date default current_date,
  created_at timestamptz default now()
);

alter table workouts enable row level security;
create policy "Users see own workouts" on workouts for select using (auth.uid() = user_id);
create policy "Users insert own workouts" on workouts for insert with check (auth.uid() = user_id);
create policy "Users delete own workouts" on workouts for delete using (auth.uid() = user_id);
`
      break
    case 'Education':
      tables = `
-- Aulas
create table lessons (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  content text,
  duration int default 10,
  completed boolean default false,
  created_at timestamptz default now()
);

alter table lessons enable row level security;
create policy "Users see own lessons" on lessons for select using (auth.uid() = user_id);
create policy "Users insert own lessons" on lessons for insert with check (auth.uid() = user_id);
`
      break
    case 'Productivity':
      tables = `
-- Tarefas
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  priority text default 'Média',
  due_date date,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Notas
create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tasks enable row level security;
alter table notes enable row level security;
create policy "Users see own tasks" on tasks for select using (auth.uid() = user_id);
create policy "Users manage own tasks" on tasks for all using (auth.uid() = user_id);
create policy "Users see own notes" on notes for select using (auth.uid() = user_id);
create policy "Users manage own notes" on notes for all using (auth.uid() = user_id);
`
      break
    default:
      tables = `
-- Items genéricos
create table items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);

alter table items enable row level security;
create policy "Users see own items" on items for select using (auth.uid() = user_id);
create policy "Users manage own items" on items for all using (auth.uid() = user_id);
`
  }

  return `-- Schema para: ${slug}
-- Categoria: ${cat}
-- Gerado pelo AppRadar MVP Factory

-- Profiles (extends Supabase Auth)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  name text,
  plan text default 'free',
  trial_ends_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users see own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
${tables}
`
}
