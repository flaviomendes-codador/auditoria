# Auditoria QCR™ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js quiz app where users answer 12 questions about their sales operation, submit a lead capture form, and receive a personalized QCR™ score with WhatsApp CTA.

**Architecture:** Next.js 15 App Router with route-per-question (`/quiz/[step]`). Answers accumulate in `sessionStorage` as user progresses. On form submit, scores are calculated client-side and a single Supabase insert captures lead + responses. Result page reads from `sessionStorage`.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Supabase JS client, Vitest (unit tests), Vercel (deploy).

---

## File Map

```
qcr-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 → Root layout: font, metadata, body bg
│   │   ├── globals.css                → CSS custom properties (design tokens)
│   │   ├── page.tsx                   → Landing page (converted from landing-v1.html)
│   │   └── quiz/
│   │       ├── layout.tsx             → Quiz layout: no nav, centered shell
│   │       ├── page.tsx               → /quiz start screen
│   │       ├── [step]/
│   │       │   └── page.tsx           → Question screen (client component)
│   │       ├── captura/
│   │       │   └── page.tsx           → Lead capture form (client component)
│   │       └── resultado/
│   │           └── page.tsx           → Result screen (client component)
│   ├── components/
│   │   ├── quiz/
│   │   │   ├── QuizProgress.tsx       → Progress bar + block label
│   │   │   └── AnswerCard.tsx         → Single answer option card
│   │   └── ui/
│   │       └── Button.tsx             → Primary button
│   └── lib/
│       ├── questions.ts               → 12 questions with options + types
│       ├── scoring.ts                 → Score calc, level, gargalo, diagnostic texts
│       ├── quiz-storage.ts            → sessionStorage helpers
│       ├── whatsapp.ts                → WhatsApp URL builder
│       └── supabase.ts                → Supabase client
├── src/lib/__tests__/
│   ├── scoring.test.ts
│   ├── quiz-storage.test.ts
│   └── whatsapp.test.ts
├── supabase/
│   └── migrations/
│       └── 001_initial.sql
├── .env.local.example
├── vitest.config.ts
├── tailwind.config.ts
└── next.config.ts
```

---

## Task 1: Project Setup

**Files:**
- Create: `qcr-app/` (Next.js project root)
- Create: `qcr-app/vitest.config.ts`
- Create: `qcr-app/.env.local.example`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd "C:/Users/DELL/CLAUDE-CODE-PROJETOS/AuditorIA - Perfil-flaviomendes.ia"
npx create-next-app@latest qcr-app --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*"
```

When prompted, accept all defaults. This creates the folder with Next.js 15 + Tailwind + App Router.

- [ ] **Step 2: Install dependencies**

```bash
cd qcr-app
npm install @supabase/supabase-js
npm install -D vitest jsdom @vitest/ui
```

- [ ] **Step 3: Create Vitest config**

Create `qcr-app/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 4: Add test script to package.json**

In `qcr-app/package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Create env example**

Create `qcr-app/.env.local.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999
```

- [ ] **Step 6: Create `.env.local` with real values**

Copy `.env.local.example` to `.env.local` and fill in the actual Supabase URL, anon key, and Flávio's WhatsApp number (format: `5511999999999` — country code + DDD + number, no `+` or hyphens).

- [ ] **Step 7: Commit**

```bash
git add qcr-app/
git commit -m "feat: scaffold Next.js 15 project for Auditoria QCR™"
```

---

## Task 2: Design System

**Files:**
- Modify: `qcr-app/src/app/globals.css`
- Modify: `qcr-app/tailwind.config.ts`
- Modify: `qcr-app/src/app/layout.tsx`
- Delete: `qcr-app/src/app/page.tsx` (placeholder — will be replaced in Task 12)

- [ ] **Step 1: Replace globals.css with design tokens**

Replace the contents of `qcr-app/src/app/globals.css`:

```css
@import "tailwindcss";

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg:          oklch(7.5% 0.006 60);
  --bg-mid:      oklch(11%  0.007 60);
  --bg-raised:   oklch(14%  0.007 60);
  --bg-light:    oklch(97.5% 0.004 62);
  --text:        oklch(95%  0.005 62);
  --text-sec:    oklch(52%  0.008 62);
  --text-dim:    oklch(32%  0.006 62);
  --accent:      oklch(73%  0.10  65);
  --border:      oklch(20%  0.007 62);
  --border-lt:   oklch(87%  0.005 62);
  --red:         oklch(46%  0.23  24);
}

html {
  font-family: var(--font-bricolage), -apple-system, system-ui, sans-serif;
  font-optical-sizing: auto;
  -webkit-font-smoothing: antialiased;
  background: var(--bg);
  color: var(--text);
  scroll-behavior: smooth;
}
```

- [ ] **Step 2: Update Tailwind config with design tokens**

Replace `qcr-app/tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:          'var(--bg)',
        'bg-mid':    'var(--bg-mid)',
        'bg-raised': 'var(--bg-raised)',
        'bg-light':  'var(--bg-light)',
        text:        'var(--text)',
        'text-sec':  'var(--text-sec)',
        'text-dim':  'var(--text-dim)',
        accent:      'var(--accent)',
        border:      'var(--border)',
        red:         'var(--red)',
      },
      fontFamily: {
        bricolage: ['var(--font-bricolage)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 3: Update root layout with font and metadata**

Replace `qcr-app/src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import './globals.css'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-bricolage',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Auditoria QCR™ — Flávio Mendes',
  description: 'Identifique em qual etapa do Sistema QCR™ sua empresa está perdendo vendas.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${bricolage.variable}`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Delete placeholder page**

Delete `qcr-app/src/app/page.tsx` — it will be replaced in Task 12.

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts at `http://localhost:3000` (may show 404 since page.tsx deleted — that's fine).

- [ ] **Step 6: Commit**

```bash
git add qcr-app/src/ qcr-app/tailwind.config.ts
git commit -m "feat: design system tokens and root layout with Bricolage Grotesque"
```

---

## Task 3: Supabase Setup

**Files:**
- Create: `qcr-app/supabase/migrations/001_initial.sql`
- Create: `qcr-app/src/lib/supabase.ts`

- [ ] **Step 1: Write SQL migration**

Create `qcr-app/supabase/migrations/001_initial.sql`:

```sql
-- Leads table: one row per audit completion
CREATE TABLE leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text NOT NULL,
  empresa     text NOT NULL,
  whatsapp    text NOT NULL,
  score_total integer,
  score_q     integer,
  score_c     integer,
  score_r     integer,
  nivel       text CHECK (nivel IN ('critico', 'atencao', 'bom', 'excelente')),
  gargalo     text CHECK (gargalo IN ('Q', 'C', 'R')),
  utm_source  text,
  created_at  timestamptz DEFAULT now()
);

-- Respostas table: one row per question answered
CREATE TABLE respostas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  pergunta    integer NOT NULL CHECK (pergunta BETWEEN 1 AND 12),
  bloco       text NOT NULL CHECK (bloco IN ('Q', 'C', 'R')),
  valor       integer NOT NULL CHECK (valor IN (0, 33, 67, 100)),
  created_at  timestamptz DEFAULT now()
);

-- Row Level Security: allow anon inserts (quiz submits from browser)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow anon insert leads"
  ON leads FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "allow anon insert respostas"
  ON respostas FOR INSERT TO anon WITH CHECK (true);
```

- [ ] **Step 2: Run migration in Supabase**

Go to Supabase dashboard → SQL Editor → paste and run the migration SQL above.

Verify: both tables `leads` and `respostas` appear in Table Editor.

- [ ] **Step 3: Create Supabase client**

Create `qcr-app/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, key)
```

- [ ] **Step 4: Commit**

```bash
git add qcr-app/supabase/ qcr-app/src/lib/supabase.ts
git commit -m "feat: Supabase migration and client setup"
```

---

## Task 4: Data Types + Questions

**Files:**
- Create: `qcr-app/src/lib/questions.ts`

- [ ] **Step 1: Write questions.ts with all 12 questions**

Create `qcr-app/src/lib/questions.ts`:

```typescript
export type Bloco = 'Q' | 'C' | 'R'

export interface QuizOption {
  texto: string
  valor: 0 | 33 | 67 | 100
}

export interface QuizQuestion {
  id: number
  bloco: Bloco
  blocoLabel: string
  texto: string
  opcoes: [QuizOption, QuizOption, QuizOption, QuizOption]
}

export const QUESTIONS: QuizQuestion[] = [
  // ── BLOCO Q — Qualificar ──
  {
    id: 1,
    bloco: 'Q',
    blocoLabel: 'Q — Qualificação',
    texto: 'Como sua equipe identifica quais leads têm maior potencial de compra?',
    opcoes: [
      { texto: 'Não temos critério definido — todos recebem a mesma atenção', valor: 0 },
      { texto: 'Informalmente, por feeling da equipe', valor: 33 },
      { texto: 'Temos alguns critérios, mas não são seguidos de forma consistente', valor: 67 },
      { texto: 'Processo estruturado com critérios claros aplicados em todos os leads', valor: 100 },
    ],
  },
  {
    id: 2,
    bloco: 'Q',
    blocoLabel: 'Q — Qualificação',
    texto: 'Com que frequência leads sem perfil consomem tempo da equipe de vendas?',
    opcoes: [
      { texto: 'Frequentemente — não conseguimos filtrar antes do atendimento', valor: 0 },
      { texto: 'Às vezes — depende do vendedor', valor: 33 },
      { texto: 'Raramente — temos um filtro, mas não é perfeito', valor: 67 },
      { texto: 'Quase nunca — nosso processo de qualificação é eficiente', valor: 100 },
    ],
  },
  {
    id: 3,
    bloco: 'Q',
    blocoLabel: 'Q — Qualificação',
    texto: 'Sua equipe registra informações de qualificação dos leads em algum sistema?',
    opcoes: [
      { texto: 'Não registramos nada', valor: 0 },
      { texto: 'Registramos de forma irregular, depende do vendedor', valor: 33 },
      { texto: 'Registramos na maioria dos casos', valor: 67 },
      { texto: 'Sempre registramos com campos padronizados', valor: 100 },
    ],
  },
  {
    id: 4,
    bloco: 'Q',
    blocoLabel: 'Q — Qualificação',
    texto: 'Você consegue priorizar quais leads abordar primeiro com base em dados objetivos?',
    opcoes: [
      { texto: 'Não — a ordem é por chegada ou preferência do vendedor', valor: 0 },
      { texto: 'Às vezes — depende da percepção do vendedor', valor: 33 },
      { texto: 'Na maioria das vezes, com base em informações básicas', valor: 67 },
      { texto: 'Sempre — temos score ou critério objetivo de priorização', valor: 100 },
    ],
  },
  // ── BLOCO C — Conectar ──
  {
    id: 5,
    bloco: 'C',
    blocoLabel: 'C — Conexão',
    texto: 'Em quanto tempo sua empresa responde a um novo lead?',
    opcoes: [
      { texto: 'Mais de 24 horas', valor: 0 },
      { texto: 'Entre 1 e 24 horas', valor: 33 },
      { texto: 'Entre 15 minutos e 1 hora', valor: 67 },
      { texto: 'Em menos de 15 minutos', valor: 100 },
    ],
  },
  {
    id: 6,
    bloco: 'C',
    blocoLabel: 'C — Conexão',
    texto: 'Como sua equipe conduz a primeira conversa com um lead?',
    opcoes: [
      { texto: 'Sem roteiro — cada vendedor age como preferir', valor: 0 },
      { texto: 'Existe um roteiro básico, mas raramente seguido', valor: 33 },
      { texto: 'A maioria segue um roteiro, com variações', valor: 67 },
      { texto: 'Roteiro estruturado, seguido de forma consistente por todos', valor: 100 },
    ],
  },
  {
    id: 7,
    bloco: 'C',
    blocoLabel: 'C — Conexão',
    texto: 'O lead sabe exatamente qual é o próximo passo após o primeiro contato?',
    opcoes: [
      { texto: 'Raramente — a conversa termina sem definir próximos passos', valor: 0 },
      { texto: 'Às vezes — depende do vendedor', valor: 33 },
      { texto: 'Na maioria das vezes definimos próximos passos', valor: 67 },
      { texto: 'Sempre — o próximo passo é acordado e registrado em todo contato', valor: 100 },
    ],
  },
  {
    id: 8,
    bloco: 'C',
    blocoLabel: 'C — Conexão',
    texto: 'Com que clareza sua empresa comunica o valor do produto/serviço no primeiro contato?',
    opcoes: [
      { texto: 'A comunicação é genérica e pouco diferenciada', valor: 0 },
      { texto: 'Razoável, mas não adaptada ao perfil do lead', valor: 33 },
      { texto: 'Boa — adaptamos a comunicação na maioria dos casos', valor: 67 },
      { texto: 'Excelente — comunicação personalizada e focada no problema do lead', valor: 100 },
    ],
  },
  // ── BLOCO R — Recuperar ──
  {
    id: 9,
    bloco: 'R',
    blocoLabel: 'R — Recuperação',
    texto: 'O que acontece com leads que não responderam após o primeiro contato?',
    opcoes: [
      { texto: 'Nada — ficam parados até alguém lembrar', valor: 0 },
      { texto: 'Fazemos uma tentativa manual esporádica', valor: 33 },
      { texto: 'Temos uma sequência de follow-up, mas não é consistente', valor: 67 },
      { texto: 'Processo automatizado e estruturado de reativação', valor: 100 },
    ],
  },
  {
    id: 10,
    bloco: 'R',
    blocoLabel: 'R — Recuperação',
    texto: 'Com quantas tentativas sua equipe insiste em um lead antes de desistir?',
    opcoes: [
      { texto: 'Uma ou duas tentativas no máximo', valor: 0 },
      { texto: 'Três a quatro tentativas sem critério definido', valor: 33 },
      { texto: 'Seguimos um número definido de tentativas com intervalo padronizado', valor: 67 },
      { texto: 'Processo multi-canal com tentativas e intervalos estratégicos definidos', valor: 100 },
    ],
  },
  {
    id: 11,
    bloco: 'R',
    blocoLabel: 'R — Recuperação',
    texto: 'Sua empresa possui um processo para reativar leads antigos (mais de 30 dias sem contato)?',
    opcoes: [
      { texto: 'Não — leads antigos são considerados perdidos', valor: 0 },
      { texto: 'Às vezes fazemos contato manual, sem processo definido', valor: 33 },
      { texto: 'Temos uma prática de reativação, mas não é sistemática', valor: 67 },
      { texto: 'Processo estruturado de reativação com critérios e cadência definidos', valor: 100 },
    ],
  },
  {
    id: 12,
    bloco: 'R',
    blocoLabel: 'R — Recuperação',
    texto: 'Você consegue identificar qual etapa do processo comercial tem maior taxa de abandono?',
    opcoes: [
      { texto: 'Não temos visibilidade sobre isso', valor: 0 },
      { texto: 'Temos uma percepção, mas sem dados concretos', valor: 33 },
      { texto: 'Sabemos onde perdemos mais, com dados parciais', valor: 67 },
      { texto: 'Monitoramos cada etapa com dados claros e tomamos ações corretivas', valor: 100 },
    ],
  },
]

export function getQuestion(step: number): QuizQuestion | undefined {
  return QUESTIONS[step - 1]
}
```

- [ ] **Step 2: Commit**

```bash
git add qcr-app/src/lib/questions.ts
git commit -m "feat: 12 QCR quiz questions with typed structure"
```

---

## Task 5: Scoring Logic + Tests

**Files:**
- Create: `qcr-app/src/lib/scoring.ts`
- Create: `qcr-app/src/lib/__tests__/scoring.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `qcr-app/src/lib/__tests__/scoring.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  calcBlockScore,
  calcTotalScore,
  getLevel,
  getGargalo,
  getDiagnosticText,
} from '../scoring'

describe('calcBlockScore', () => {
  it('returns rounded average of four values', () => {
    expect(calcBlockScore([0, 33, 67, 100])).toBe(50)
  })
  it('handles all-zero answers', () => {
    expect(calcBlockScore([0, 0, 0, 0])).toBe(0)
  })
  it('handles all-max answers', () => {
    expect(calcBlockScore([100, 100, 100, 100])).toBe(100)
  })
  it('rounds to nearest integer', () => {
    // (33+33+33+0)/4 = 24.75 → 25
    expect(calcBlockScore([33, 33, 33, 0])).toBe(25)
  })
})

describe('calcTotalScore', () => {
  it('returns average of three block scores', () => {
    expect(calcTotalScore(60, 60, 60)).toBe(60)
  })
  it('rounds correctly with uneven scores', () => {
    // (75 + 45 + 20) / 3 = 46.67 → 47
    expect(calcTotalScore(75, 45, 20)).toBe(47)
  })
})

describe('getLevel', () => {
  it('returns critico for 0', () => expect(getLevel(0)).toBe('critico'))
  it('returns critico for 39', () => expect(getLevel(39)).toBe('critico'))
  it('returns atencao for 40', () => expect(getLevel(40)).toBe('atencao'))
  it('returns atencao for 69', () => expect(getLevel(69)).toBe('atencao'))
  it('returns bom for 70', () => expect(getLevel(70)).toBe('bom'))
  it('returns bom for 89', () => expect(getLevel(89)).toBe('bom'))
  it('returns excelente for 90', () => expect(getLevel(90)).toBe('excelente'))
  it('returns excelente for 100', () => expect(getLevel(100)).toBe('excelente'))
})

describe('getGargalo', () => {
  it('returns bloco with lowest score', () => {
    expect(getGargalo(75, 45, 20)).toBe('R')
    expect(getGargalo(20, 75, 45)).toBe('Q')
    expect(getGargalo(45, 20, 75)).toBe('C')
  })
  it('returns Q when Q and C are tied for lowest', () => {
    expect(getGargalo(20, 20, 80)).toBe('Q')
  })
  it('returns Q when all scores are equal', () => {
    expect(getGargalo(50, 50, 50)).toBe('Q')
  })
})

describe('getDiagnosticText', () => {
  it('returns a non-empty string for every bloco/nivel combination', () => {
    const blocos = ['Q', 'C', 'R'] as const
    const niveis = ['critico', 'atencao', 'bom', 'excelente'] as const
    for (const bloco of blocos) {
      for (const nivel of niveis) {
        const text = getDiagnosticText(bloco, nivel)
        expect(typeof text).toBe('string')
        expect(text.length).toBeGreaterThan(10)
      }
    }
  })
})
```

- [ ] **Step 2: Run tests — verify they FAIL**

```bash
cd qcr-app && npm test
```

Expected: FAIL — `Cannot find module '../scoring'`

- [ ] **Step 3: Implement scoring.ts**

Create `qcr-app/src/lib/scoring.ts`:

```typescript
import type { Bloco } from './questions'

export type Nivel = 'critico' | 'atencao' | 'bom' | 'excelente'

export function calcBlockScore(valores: number[]): number {
  if (valores.length === 0) return 0
  return Math.round(valores.reduce((sum, v) => sum + v, 0) / valores.length)
}

export function calcTotalScore(scoreQ: number, scoreC: number, scoreR: number): number {
  return Math.round((scoreQ + scoreC + scoreR) / 3)
}

export function getLevel(score: number): Nivel {
  if (score <= 39) return 'critico'
  if (score <= 69) return 'atencao'
  if (score <= 89) return 'bom'
  return 'excelente'
}

export function getGargalo(scoreQ: number, scoreC: number, scoreR: number): Bloco {
  const min = Math.min(scoreQ, scoreC, scoreR)
  if (scoreQ === min) return 'Q'
  if (scoreC === min) return 'C'
  return 'R'
}

const DIAGNOSTIC_TEXTS: Record<Bloco, Record<Nivel, string>> = {
  Q: {
    critico:
      'Sua equipe trata todos os leads da mesma forma. Isso significa que oportunidades de alto valor estão competindo por atenção com contatos sem potencial — e ambos perdem.',
    atencao:
      'Sua qualificação é inconsistente. Alguns vendedores identificam boas oportunidades, outros não. O resultado é imprevisível e difícil de escalar.',
    bom:
      'Sua qualificação está no caminho certo. O próximo passo é tornar o processo sistemático para que todos os vendedores obtenham resultados similares.',
    excelente:
      'Qualificação sólida. Você sabe exatamente onde investir o tempo da equipe comercial.',
  },
  C: {
    critico:
      'Sua empresa está perdendo leads no momento mais crítico: o primeiro contato. Velocidade e condução insuficientes fazem o lead perder interesse antes mesmo de receber uma proposta.',
    atencao:
      'Sua capacidade de conexão varia conforme o vendedor. Leads que chegam a um profissional melhor convertem. Os demais, não. Isso é um risco operacional.',
    bom:
      'Sua equipe conecta bem na maioria dos casos. Padronizar os critérios de próximo passo elevará sua conversão de forma consistente.',
    excelente:
      'Conexão eficiente. Você responde rápido, comunica valor e define próximos passos com clareza.',
  },
  R: {
    critico:
      'Existe receita parada na sua operação neste momento. Leads que demonstraram interesse e foram esquecidos. Sem processo de recuperação, você está descartando oportunidades que já custaram dinheiro para atrair.',
    atencao:
      'Sua recuperação é parcial e dependente de iniciativa individual. Quando alguém lembra, o follow-up acontece. Quando não lembra, o lead some. Isso é receita que escapa pelo descuido operacional.',
    bom:
      'Você tem processo de recuperação, mas ele não é sistemático o suficiente. Automatizar a cadência multiplicará os resultados sem exigir mais esforço da equipe.',
    excelente:
      'Recuperação bem estruturada. Você não deixa oportunidades morrerem por falta de acompanhamento.',
  },
}

export function getDiagnosticText(gargalo: Bloco, nivel: Nivel): string {
  return DIAGNOSTIC_TEXTS[gargalo][nivel]
}
```

- [ ] **Step 4: Run tests — verify they PASS**

```bash
npm test
```

Expected: all 15 tests pass.

- [ ] **Step 5: Commit**

```bash
git add qcr-app/src/lib/scoring.ts qcr-app/src/lib/__tests__/scoring.test.ts
git commit -m "feat: scoring logic with full test coverage"
```

---

## Task 6: Quiz Storage + Tests

**Files:**
- Create: `qcr-app/src/lib/quiz-storage.ts`
- Create: `qcr-app/src/lib/__tests__/quiz-storage.test.ts`

- [ ] **Step 1: Write failing tests**

Create `qcr-app/src/lib/__tests__/quiz-storage.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveAnswer,
  getAnswer,
  getAnswers,
  clearAnswers,
  isComplete,
  saveResult,
  getResult,
  saveUtmSource,
  getUtmSource,
} from '../quiz-storage'
import type { QuizResultData } from '../quiz-storage'

beforeEach(() => {
  sessionStorage.clear()
})

describe('saveAnswer / getAnswer', () => {
  it('saves and retrieves an answer by step', () => {
    saveAnswer(1, 67)
    expect(getAnswer(1)).toBe(67)
  })
  it('returns null for unanswered step', () => {
    expect(getAnswer(5)).toBeNull()
  })
  it('overwrites existing answer', () => {
    saveAnswer(3, 33)
    saveAnswer(3, 100)
    expect(getAnswer(3)).toBe(100)
  })
})

describe('getAnswers', () => {
  it('returns empty object when nothing saved', () => {
    expect(getAnswers()).toEqual({})
  })
  it('returns all saved answers', () => {
    saveAnswer(1, 0)
    saveAnswer(2, 100)
    expect(getAnswers()).toEqual({ 1: 0, 2: 100 })
  })
})

describe('clearAnswers', () => {
  it('removes all answers', () => {
    saveAnswer(1, 33)
    clearAnswers()
    expect(getAnswers()).toEqual({})
  })
})

describe('isComplete', () => {
  it('returns false when fewer than 12 answers', () => {
    for (let i = 1; i <= 11; i++) saveAnswer(i, 67)
    expect(isComplete()).toBe(false)
  })
  it('returns true when all 12 answers present', () => {
    for (let i = 1; i <= 12; i++) saveAnswer(i, 67)
    expect(isComplete()).toBe(true)
  })
})

describe('saveResult / getResult', () => {
  const mockResult: QuizResultData = {
    nome: 'João',
    empresa: 'Empresa X',
    scoreTotal: 47,
    scoreQ: 75,
    scoreC: 45,
    scoreR: 20,
    nivel: 'atencao',
    gargalo: 'R',
  }
  it('saves and retrieves result', () => {
    saveResult(mockResult)
    expect(getResult()).toEqual(mockResult)
  })
  it('returns null when no result saved', () => {
    expect(getResult()).toBeNull()
  })
})

describe('saveUtmSource / getUtmSource', () => {
  it('saves and retrieves utm source', () => {
    saveUtmSource('instagram')
    expect(getUtmSource()).toBe('instagram')
  })
  it('returns null when no utm saved', () => {
    expect(getUtmSource()).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests — verify FAIL**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../quiz-storage'`

- [ ] **Step 3: Implement quiz-storage.ts**

Create `qcr-app/src/lib/quiz-storage.ts`:

```typescript
import type { Bloco } from './questions'
import type { Nivel } from './scoring'

export interface QuizResultData {
  nome: string
  empresa: string
  scoreTotal: number
  scoreQ: number
  scoreC: number
  scoreR: number
  nivel: Nivel
  gargalo: Bloco
}

const ANSWERS_KEY = 'qcr_answers'
const RESULT_KEY  = 'qcr_result'
const UTM_KEY     = 'qcr_utm_source'

export function saveAnswer(step: number, valor: number): void {
  const answers = getAnswers()
  answers[step] = valor
  sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))
}

export function getAnswer(step: number): number | null {
  const answers = getAnswers()
  return answers[step] ?? null
}

export function getAnswers(): Record<number, number> {
  if (typeof window === 'undefined') return {}
  const raw = sessionStorage.getItem(ANSWERS_KEY)
  return raw ? JSON.parse(raw) : {}
}

export function clearAnswers(): void {
  sessionStorage.removeItem(ANSWERS_KEY)
}

export function isComplete(): boolean {
  return Object.keys(getAnswers()).length === 12
}

export function saveResult(result: QuizResultData): void {
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result))
}

export function getResult(): QuizResultData | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(RESULT_KEY)
  return raw ? JSON.parse(raw) : null
}

export function saveUtmSource(utm: string): void {
  sessionStorage.setItem(UTM_KEY, utm)
}

export function getUtmSource(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(UTM_KEY)
}
```

- [ ] **Step 4: Run tests — verify PASS**

```bash
npm test
```

Expected: all tests pass (scoring + storage).

- [ ] **Step 5: Commit**

```bash
git add qcr-app/src/lib/quiz-storage.ts qcr-app/src/lib/__tests__/quiz-storage.test.ts
git commit -m "feat: quiz sessionStorage helpers with tests"
```

---

## Task 7: WhatsApp URL Builder + Test

**Files:**
- Create: `qcr-app/src/lib/whatsapp.ts`
- Create: `qcr-app/src/lib/__tests__/whatsapp.test.ts`

- [ ] **Step 1: Write failing test**

Create `qcr-app/src/lib/__tests__/whatsapp.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildWhatsAppUrl } from '../whatsapp'

describe('buildWhatsAppUrl', () => {
  it('builds correct wa.me URL with encoded message', () => {
    const url = buildWhatsAppUrl({
      nome: 'João',
      empresa: 'Empresa X',
      scoreTotal: 47,
      gargalo: 'R',
      whatsappNumber: '5511999999999',
    })
    expect(url).toMatch(/^https:\/\/wa\.me\/5511999999999\?text=/)
    expect(url).toContain('Score%3A%2047')
    expect(url).toContain('Empresa%20X')
  })

  it('maps gargalo R to Recuperação in message', () => {
    const url = buildWhatsAppUrl({
      nome: 'Maria',
      empresa: 'Acme',
      scoreTotal: 30,
      gargalo: 'R',
      whatsappNumber: '5511999999999',
    })
    expect(url).toContain('Recupera%C3%A7%C3%A3o')
  })

  it('maps gargalo Q to Qualificação in message', () => {
    const url = buildWhatsAppUrl({
      nome: 'Maria',
      empresa: 'Acme',
      scoreTotal: 30,
      gargalo: 'Q',
      whatsappNumber: '5511999999999',
    })
    expect(url).toContain('Qualifica%C3%A7%C3%A3o')
  })

  it('maps gargalo C to Conexão in message', () => {
    const url = buildWhatsAppUrl({
      nome: 'Maria',
      empresa: 'Acme',
      scoreTotal: 30,
      gargalo: 'C',
      whatsappNumber: '5511999999999',
    })
    expect(url).toContain('Conex%C3%A3o')
  })
})
```

- [ ] **Step 2: Run tests — verify FAIL**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../whatsapp'`

- [ ] **Step 3: Implement whatsapp.ts**

Create `qcr-app/src/lib/whatsapp.ts`:

```typescript
import type { Bloco } from './questions'

const GARGALO_LABELS: Record<Bloco, string> = {
  Q: 'Qualificação',
  C: 'Conexão',
  R: 'Recuperação',
}

export function buildWhatsAppUrl(params: {
  nome: string
  empresa: string
  scoreTotal: number
  gargalo: Bloco
  whatsappNumber: string
}): string {
  const { nome, empresa, scoreTotal, gargalo, whatsappNumber } = params
  const gargaloLabel = GARGALO_LABELS[gargalo]
  const msg = `Olá Flávio, fiz a Auditoria QCR™. Score: ${scoreTotal}. Gargalo principal: ${gargaloLabel}. Empresa: ${empresa}. Quero entender como melhorar.`
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`
}
```

- [ ] **Step 4: Run all tests — verify PASS**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add qcr-app/src/lib/whatsapp.ts qcr-app/src/lib/__tests__/whatsapp.test.ts
git commit -m "feat: WhatsApp URL builder with tests"
```

---

## Task 8: Quiz Start Screen + Layout

**Files:**
- Create: `qcr-app/src/app/quiz/layout.tsx`
- Create: `qcr-app/src/app/quiz/page.tsx`
- Create: `qcr-app/src/components/ui/Button.tsx`

- [ ] **Step 1: Create Button component**

Create `qcr-app/src/components/ui/Button.tsx`:

```typescript
import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  fullWidth?: boolean
}

export function Button({ variant = 'primary', fullWidth, className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-bold text-[13px] tracking-[0.07em] uppercase transition-opacity duration-200 disabled:opacity-40 cursor-pointer'
  const variants = {
    primary: 'bg-text text-bg rounded-[8px] px-8 py-4 hover:opacity-87',
    ghost: 'text-text-sec hover:text-text',
  }
  const width = fullWidth ? 'w-full' : ''
  return (
    <button className={`${base} ${variants[variant]} ${width} ${className}`} {...props}>
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Create quiz layout**

Create `qcr-app/src/app/quiz/layout.tsx`:

```typescript
export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Create quiz start screen**

Create `qcr-app/src/app/quiz/page.tsx`:

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function QuizStartPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-text-dim">
            Diagnóstico gratuito
          </p>
          <h1 className="text-[32px] sm:text-[40px] font-extrabold tracking-[-0.035em] leading-[1.06] text-text">
            Auditoria QCR™
          </h1>
          <p className="text-text-sec text-[16px] leading-[1.75] mt-1">
            12 perguntas. Menos de 3 minutos. Resultado imediato.
          </p>
        </div>

        {/* Progress preview */}
        <div className="flex flex-col gap-3 border border-border rounded-xl p-5 bg-bg-mid">
          <div className="flex justify-between text-[11px] text-text-dim uppercase tracking-[0.1em] font-bold">
            <span>Q — Qualificação</span>
            <span>4 perguntas</span>
          </div>
          <div className="flex justify-between text-[11px] text-text-dim uppercase tracking-[0.1em] font-bold">
            <span>C — Conexão</span>
            <span>4 perguntas</span>
          </div>
          <div className="flex justify-between text-[11px] text-text-dim uppercase tracking-[0.1em] font-bold">
            <span>R — Recuperação</span>
            <span>4 perguntas</span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link href="/quiz/1">
            <Button fullWidth>Começar Auditoria ↗</Button>
          </Link>
          <p className="text-center text-[12px] text-text-dim tracking-[0.04em]">
            Gratuito · Sem cadastro até o resultado
          </p>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Navigate to `http://localhost:3000/quiz`. Expected: start screen renders with dark background, title "Auditoria QCR™", three blocks listed, "Começar Auditoria" button.

- [ ] **Step 5: Commit**

```bash
git add qcr-app/src/app/quiz/ qcr-app/src/components/ui/Button.tsx
git commit -m "feat: quiz start screen and layout"
```

---

## Task 9: Question Screen

**Files:**
- Create: `qcr-app/src/components/quiz/QuizProgress.tsx`
- Create: `qcr-app/src/components/quiz/AnswerCard.tsx`
- Create: `qcr-app/src/app/quiz/[step]/page.tsx`

- [ ] **Step 1: Create QuizProgress component**

Create `qcr-app/src/components/quiz/QuizProgress.tsx`:

```typescript
interface QuizProgressProps {
  step: number       // 1–12
  blocoLabel: string // e.g. "Q — Qualificação"
  onBack?: () => void
}

export function QuizProgress({ step, blocoLabel, onBack }: QuizProgressProps) {
  const pct = ((step - 1) / 12) * 100

  return (
    <div className="w-full flex flex-col gap-3 pt-5 pb-2 px-5">
      {/* Top row */}
      <div className="flex items-center justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            className="text-[12px] text-text-sec hover:text-text transition-colors"
          >
            ← Voltar
          </button>
        ) : (
          <span />
        )}
        <span className="text-[11px] text-text-dim tracking-[0.08em] uppercase font-bold">
          {blocoLabel}
        </span>
        <span className="text-[11px] text-text-dim tabular-nums">
          {step}/12
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-text rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create AnswerCard component**

Create `qcr-app/src/components/quiz/AnswerCard.tsx`:

```typescript
interface AnswerCardProps {
  texto: string
  valor: number
  selected: boolean
  onClick: () => void
}

export function AnswerCard({ texto, selected, onClick }: AnswerCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-5 py-4 rounded-xl border text-[14px] leading-[1.6] transition-all duration-150
        ${selected
          ? 'border-accent bg-accent/10 text-text'
          : 'border-border bg-bg-mid text-text-sec hover:border-text-dim hover:text-text'
        }
      `}
    >
      {texto}
    </button>
  )
}
```

- [ ] **Step 3: Create question page**

Create `qcr-app/src/app/quiz/[step]/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getQuestion } from '@/lib/questions'
import { saveAnswer, getAnswer } from '@/lib/quiz-storage'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { AnswerCard } from '@/components/quiz/AnswerCard'

export default function QuizStepPage() {
  const router = useRouter()
  const params = useParams()
  const step = parseInt(params.step as string, 10)

  const [selected, setSelected] = useState<number | null>(null)
  const [advancing, setAdvancing] = useState(false)

  // Guard: invalid step
  useEffect(() => {
    if (isNaN(step) || step < 1 || step > 12) {
      router.replace('/quiz')
    }
  }, [step, router])

  // Pre-populate if user navigated back
  useEffect(() => {
    const existing = getAnswer(step)
    if (existing !== null) setSelected(existing)
  }, [step])

  const question = getQuestion(step)
  if (!question) return null

  function handleSelect(valor: number) {
    if (advancing) return
    setSelected(valor)
    saveAnswer(step, valor)
    setAdvancing(true)
    const next = step < 12 ? `/quiz/${step + 1}` : '/quiz/captura'
    setTimeout(() => router.push(next), 350)
  }

  function handleBack() {
    if (step > 1) {
      router.push(`/quiz/${step - 1}`)
    } else {
      router.push('/quiz')
    }
  }

  return (
    <main className="flex-1 flex flex-col max-w-lg mx-auto w-full">
      <QuizProgress
        step={step}
        blocoLabel={question.blocoLabel}
        onBack={handleBack}
      />

      <div className="flex-1 flex flex-col justify-center px-5 py-8 gap-6">
        <h2 className="text-[20px] sm:text-[24px] font-bold tracking-[-0.02em] leading-[1.3] text-text">
          {question.texto}
        </h2>

        <div className="flex flex-col gap-3">
          {question.opcoes.map((opcao) => (
            <AnswerCard
              key={opcao.valor}
              texto={opcao.texto}
              valor={opcao.valor}
              selected={selected === opcao.valor}
              onClick={() => handleSelect(opcao.valor)}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Test the quiz flow in browser**

Navigate to `http://localhost:3000/quiz/1`.

Check:
- Question text renders
- 4 answer cards visible
- Clicking an answer highlights it briefly then navigates to /quiz/2
- Back button works
- Progress bar advances each step
- Step 12 navigates to /quiz/captura

- [ ] **Step 5: Commit**

```bash
git add qcr-app/src/components/quiz/ qcr-app/src/app/quiz/[step]/
git commit -m "feat: question screen with auto-advance on click"
```

---

## Task 10: Lead Capture Screen

**Files:**
- Create: `qcr-app/src/app/quiz/captura/page.tsx`

- [ ] **Step 1: Create capture page**

Create `qcr-app/src/app/quiz/captura/page.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { QUESTIONS } from '@/lib/questions'
import { getAnswers, isComplete, saveResult, getUtmSource } from '@/lib/quiz-storage'
import { calcBlockScore, calcTotalScore, getLevel, getGargalo } from '@/lib/scoring'

export default function CapturaPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Guard: must have all 12 answers
  useEffect(() => {
    if (!isComplete()) router.replace('/quiz')
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !empresa.trim() || !whatsapp.trim()) return
    setLoading(true)
    setError(null)

    // Calculate scores
    const answers = getAnswers()
    const qAnswers = QUESTIONS.filter(q => q.bloco === 'Q').map(q => answers[q.id] ?? 0)
    const cAnswers = QUESTIONS.filter(q => q.bloco === 'C').map(q => answers[q.id] ?? 0)
    const rAnswers = QUESTIONS.filter(q => q.bloco === 'R').map(q => answers[q.id] ?? 0)

    const scoreQ = calcBlockScore(qAnswers)
    const scoreC = calcBlockScore(cAnswers)
    const scoreR = calcBlockScore(rAnswers)
    const scoreTotal = calcTotalScore(scoreQ, scoreC, scoreR)
    const nivel = getLevel(scoreTotal)
    const gargalo = getGargalo(scoreQ, scoreC, scoreR)

    try {
      // Insert lead
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert({
          nome: nome.trim(),
          empresa: empresa.trim(),
          whatsapp: whatsapp.trim(),
          score_total: scoreTotal,
          score_q: scoreQ,
          score_c: scoreC,
          score_r: scoreR,
          nivel,
          gargalo,
          utm_source: getUtmSource(),
        })
        .select('id')
        .single()

      if (leadError) throw leadError

      // Insert individual responses
      const respostas = QUESTIONS.map(q => ({
        lead_id: leadData.id,
        pergunta: q.id,
        bloco: q.bloco,
        valor: answers[q.id] ?? 0,
      }))

      const { error: respError } = await supabase.from('respostas').insert(respostas)
      if (respError) throw respError

      // Save result to sessionStorage for result page
      saveResult({ nome: nome.trim(), empresa: empresa.trim(), scoreTotal, scoreQ, scoreC, scoreR, nivel, gargalo })

      router.push('/quiz/resultado')
    } catch (err) {
      console.error('Supabase insert error:', err)
      setError('Ocorreu um erro ao salvar. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-text-dim">
            Auditoria QCR™
          </p>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold tracking-[-0.03em] leading-[1.1] text-text">
            Seu diagnóstico está pronto.
          </h1>
          <p className="text-text-sec text-[15px] leading-[1.75] mt-1">
            Para revelar, precisamos de:
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-text-dim uppercase tracking-[0.08em] font-bold">
              Nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Seu nome"
              required
              className="bg-bg-mid border border-border rounded-xl px-4 py-3.5 text-text text-[14px] placeholder:text-text-dim outline-none focus:border-text-dim transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-text-dim uppercase tracking-[0.08em] font-bold">
              Empresa
            </label>
            <input
              type="text"
              value={empresa}
              onChange={e => setEmpresa(e.target.value)}
              placeholder="Nome da empresa"
              required
              className="bg-bg-mid border border-border rounded-xl px-4 py-3.5 text-text text-[14px] placeholder:text-text-dim outline-none focus:border-text-dim transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-text-dim uppercase tracking-[0.08em] font-bold">
              WhatsApp
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="(11) 99999-9999"
              required
              className="bg-bg-mid border border-border rounded-xl px-4 py-3.5 text-text text-[14px] placeholder:text-text-dim outline-none focus:border-text-dim transition-colors"
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-500">{error}</p>
          )}

          <div className="flex flex-col gap-3 mt-2">
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Calculando...' : 'Ver meu Score QCR™ →'}
            </Button>
            <p className="text-center text-[11px] text-text-dim leading-[1.6]">
              Seus dados não serão compartilhados. Usados apenas para contato com Flávio.
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Test the capture form in browser**

Complete the full quiz (answer all 12 questions), arrive at `/quiz/captura`.

Check:
- Form fields render correctly
- Empty submit does not proceed (HTML5 required validation)
- Submitting with valid data inserts to Supabase and redirects to `/quiz/resultado`
- Check Supabase dashboard: verify `leads` row and 12 `respostas` rows created

- [ ] **Step 3: Commit**

```bash
git add qcr-app/src/app/quiz/captura/
git commit -m "feat: lead capture form with Supabase insert and score calculation"
```

---

## Task 11: Result Screen

**Files:**
- Create: `qcr-app/src/components/quiz/ScoreBar.tsx`
- Create: `qcr-app/src/app/quiz/resultado/page.tsx`

- [ ] **Step 1: Create ScoreBar component**

Create `qcr-app/src/components/quiz/ScoreBar.tsx`:

```typescript
interface ScoreBarProps {
  label: string   // 'Q', 'C', or 'R'
  score: number   // 0–100
  isGargalo: boolean
}

export function ScoreBar({ label, score, isGargalo }: ScoreBarProps) {
  return (
    <div className="grid grid-cols-[24px_1fr_36px] items-center gap-3">
      <span className={`text-[11px] font-extrabold tracking-[0.12em] ${isGargalo ? 'text-text' : 'text-text-dim'}`}>
        {label}
      </span>
      <div className="h-[3px] bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isGargalo ? 'bg-red' : 'bg-text'}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[11px] text-text-sec tabular-nums text-right">
        {score}
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Create result page**

Create `qcr-app/src/app/quiz/resultado/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getResult, clearAnswers } from '@/lib/quiz-storage'
import { getDiagnosticText } from '@/lib/scoring'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { ScoreBar } from '@/components/quiz/ScoreBar'
import { Button } from '@/components/ui/Button'
import type { QuizResultData } from '@/lib/quiz-storage'

const NIVEL_LABELS = {
  critico:   'Crítico',
  atencao:   'Atenção',
  bom:       'Bom',
  excelente: 'Excelente',
}

const NIVEL_COLORS = {
  critico:   'text-red border-red/30 bg-red/10',
  atencao:   'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  bom:       'text-green-400 border-green-400/30 bg-green-400/10',
  excelente: 'text-accent border-accent/30 bg-accent/10',
}

export default function ResultadoPage() {
  const router = useRouter()
  const [result, setResult] = useState<QuizResultData | null>(null)

  useEffect(() => {
    const data = getResult()
    if (!data) {
      router.replace('/quiz')
      return
    }
    setResult(data)
    clearAnswers()
  }, [router])

  if (!result) return null

  const { nome, empresa, scoreTotal, scoreQ, scoreC, scoreR, nivel, gargalo } = result
  const diagnosticText = getDiagnosticText(gargalo, nivel)
  const gargaloNivel = { Q: scoreQ, C: scoreC, R: scoreR }[gargalo]
  const waUrl = buildWhatsAppUrl({
    nome,
    empresa,
    scoreTotal,
    gargalo,
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER!,
  })

  return (
    <main className="flex-1 flex flex-col items-center px-5 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-text-dim">
            Diagnóstico de {nome}
          </p>
          <h1 className="text-[22px] font-extrabold tracking-[-0.025em] text-text">
            Auditoria QCR™ · {empresa}
          </h1>
        </div>

        {/* Score card */}
        <div className="border border-border rounded-2xl overflow-hidden bg-bg-mid">
          {/* Score header */}
          <div className="p-5 border-b border-border flex items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span className="text-[64px] font-extrabold leading-none tracking-[-0.05em] text-text">
                {scoreTotal}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-dim">
                  Score Geral QCR™
                </span>
                <span className="text-[11px] text-text-sec">Baseado em 12 respostas</span>
              </div>
            </div>
            <span className={`text-[11px] font-bold tracking-[0.08em] uppercase px-3 py-1.5 rounded-full border ${NIVEL_COLORS[nivel]}`}>
              {NIVEL_LABELS[nivel]}
            </span>
          </div>

          {/* Score bars */}
          <div className="p-5 flex flex-col gap-4 border-b border-border">
            <ScoreBar label="Q" score={scoreQ} isGargalo={gargalo === 'Q'} />
            <ScoreBar label="C" score={scoreC} isGargalo={gargalo === 'C'} />
            <ScoreBar label="R" score={scoreR} isGargalo={gargalo === 'R'} />
          </div>

          {/* Diagnostic insight */}
          <div className="p-5 flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-[4px] bg-red/20 flex items-center justify-center text-[11px] font-extrabold text-red mt-0.5">
              !
            </div>
            <p className="text-[13px] text-text-sec leading-[1.7]">
              <strong className="text-text font-semibold">
                Gargalo identificado em {gargalo === 'Q' ? 'Qualificação' : gargalo === 'C' ? 'Conexão' : 'Recuperação'} ({gargaloNivel}).
              </strong>{' '}
              {diagnosticText}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-4 pt-2">
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <Button fullWidth>
              Agendar conversa com Flávio ↗
            </Button>
          </a>
          <p className="text-center text-[12px] text-text-dim leading-[1.6] px-4">
            O próximo passo é uma conversa estratégica para identificar como resolver o gargalo em{' '}
            {gargalo === 'Q' ? 'Qualificação' : gargalo === 'C' ? 'Conexão' : 'Recuperação'}.
          </p>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Test the full flow end-to-end in browser**

Start at `http://localhost:3000/quiz`, answer all 12 questions, fill the form, verify:
- Result page shows the correct score and level badge
- Three score bars visible, gargalo bar is red
- Diagnostic text matches the gargalo/nivel combination
- "Agendar conversa" button opens WhatsApp with pre-filled message
- Check the WhatsApp message contains correct score, gargalo and empresa

- [ ] **Step 4: Commit**

```bash
git add qcr-app/src/components/quiz/ScoreBar.tsx qcr-app/src/app/quiz/resultado/
git commit -m "feat: result screen with score, bars, diagnostic text and WhatsApp CTA"
```

---

## Task 12: Landing Page

**Files:**
- Create: `qcr-app/src/app/page.tsx`
- Create: `qcr-app/src/app/landing.css`

- [ ] **Step 1: Copy landing CSS**

Create `qcr-app/src/app/landing.css` with all the CSS from the original `landing-v1.html` file (copy the entire `<style>` block content, lines 10–614). This file already contains all the design system classes for the landing page.

Import it in `layout.tsx` by adding at the top of the file:
```typescript
import './landing.css'
```

- [ ] **Step 2: Create landing page component**

Create `qcr-app/src/app/page.tsx`:

Copy the full `<body>` content from `landing-v1.html` (lines 616–856) into a React component, making these conversions:
- `class=` → `className=`
- `<a href="#">` buttons that start the quiz → `<Link href="/quiz">` (for the "Fazer Auditoria QCR™" CTA buttons)
- `<a href="#">` in footer links → keep as `href="#"` for now
- All other HTML converts directly to JSX

```typescript
import Link from 'next/link'

export default function LandingPage() {
  return (
    <>
      {/* TARJA VERMELHA */}
      <div className="tarja">
        Exclusivo para empresários que investem em anúncios
      </div>

      {/* HERO */}
      {/* ... paste converted HTML from landing-v1.html ... */}
      {/* Replace all CTA <a href="#"> with <Link href="/quiz"> */}

      {/* ... rest of landing sections ... */}
    </>
  )
}
```

- [ ] **Step 3: Verify landing page renders**

Navigate to `http://localhost:3000`. Verify it matches the approved `landing-v1.html` design exactly. Both mobile (390px) and desktop (1440px) viewports.

- [ ] **Step 4: Commit**

```bash
git add qcr-app/src/app/page.tsx qcr-app/src/app/landing.css
git commit -m "feat: landing page converted from approved HTML design"
```

---

## Task 13: UTM Capture + Route Protection

**Files:**
- Modify: `qcr-app/src/app/page.tsx`
- Modify: `qcr-app/src/app/quiz/captura/page.tsx` (already includes getUtmSource — verify)

- [ ] **Step 1: Add UTM capture to landing page**

The landing page needs to be a client component to access `window.location.search`. Convert `src/app/page.tsx` to a client component and add UTM capture:

Add `'use client'` at the top of `page.tsx`.

Add this effect at the top of the `LandingPage` component:

```typescript
'use client'

import { useEffect } from 'react'
import { saveUtmSource } from '@/lib/quiz-storage'

export default function LandingPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const utm = params.get('utm_source')
    if (utm) saveUtmSource(utm)
  }, [])

  // ... rest of component
}
```

- [ ] **Step 2: Verify UTM capture works**

Navigate to `http://localhost:3000/?utm_source=instagram`. Complete the quiz and submit. Check Supabase `leads` table: `utm_source` column should show `instagram`.

- [ ] **Step 3: Verify route protection works**

Try navigating directly to `http://localhost:3000/quiz/resultado`. Expected: redirects to `/quiz`.

Try navigating directly to `http://localhost:3000/quiz/captura` without answering questions. Expected: redirects to `/quiz`.

Try navigating to `http://localhost:3000/quiz/15` (invalid step). Expected: redirects to `/quiz`.

- [ ] **Step 4: Run all tests to confirm nothing broken**

```bash
cd qcr-app && npm test
```

Expected: all tests pass.

- [ ] **Step 5: Final end-to-end test**

Complete a full flow:
1. `/?utm_source=teste` → landing page
2. Click CTA → `/quiz`
3. Answer all 12 questions (mix of choices)
4. Fill form → submit
5. See result page with correct score + WhatsApp link
6. Click WhatsApp link → correct pre-filled message opens

- [ ] **Step 6: Commit**

```bash
git add qcr-app/src/app/page.tsx
git commit -m "feat: UTM source capture on landing and route protection verified"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Next.js 15 App Router — Task 1
- ✅ Route per question (`/quiz/[step]`) — Task 9
- ✅ Auto-advance on click (350ms) — Task 9
- ✅ sessionStorage state — Tasks 6, 9
- ✅ Lead capture after quiz — Task 10
- ✅ Supabase insert (leads + respostas) — Task 10
- ✅ UTM source capture — Task 13
- ✅ Score calculation (block + total) — Task 5
- ✅ Level assignment (4 tiers) — Task 5
- ✅ Gargalo detection — Task 5
- ✅ 12 questions with Q/C/R blocks — Task 4
- ✅ Diagnostic texts per bloco/nivel — Task 5
- ✅ Result screen with score bars — Task 11
- ✅ WhatsApp CTA with pre-filled message — Tasks 7, 11
- ✅ Dark mode design system — Task 2
- ✅ Landing page conversion — Task 12
- ✅ Route protection (resultado, captura, invalid step) — Tasks 9, 10, 13
- ✅ Back button works between questions — Task 9
