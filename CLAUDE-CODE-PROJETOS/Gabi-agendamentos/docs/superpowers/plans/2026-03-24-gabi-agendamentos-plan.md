# Gabi Agendamentos — Plano de Implementacao

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Webapp mobile-first que automatiza confirmacao de sessoes via WhatsApp para terapeuta radiestesista solo.

**Architecture:** Next.js App Router (frontend + API routes) conectado ao Supabase (DB, auth, realtime). N8N orquestra fluxos automaticos (cron de confirmacao, follow-up, lembrete). WhatsApp Cloud API da Meta para envio/recebimento de mensagens. Design Apple-style, light mode, violeta primario.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth + Realtime), N8N, WhatsApp Cloud API, Vercel

**Spec:** `docs/superpowers/specs/2026-03-24-gabi-agendamentos-design.md`

---

## Estrutura de Arquivos

```
gabi-agendamentos/
├── .env.local                         # Variaveis de ambiente (Supabase, WhatsApp)
├── .gitignore
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── middleware.ts                       # Protecao de rotas (auth)
│
├── supabase/
│   └── migrations/
│       ├── 001_create_patients.sql
│       ├── 002_create_appointments.sql
│       ├── 003_create_messages.sql
│       ├── 004_create_message_templates.sql
│       ├── 005_create_settings.sql
│       └── 006_seed_templates_and_settings.sql
│
├── src/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Supabase browser client
│   │   │   ├── server.ts              # Supabase server client
│   │   │   └── types.ts               # Database types (gerado)
│   │   ├── whatsapp/
│   │   │   ├── client.ts              # WhatsApp Cloud API client
│   │   │   ├── templates.ts           # Montar mensagens a partir de templates
│   │   │   └── classifier.ts          # Classificar respostas por palavras-chave
│   │   └── utils.ts                   # Helpers gerais (formatDate, formatTime, etc.)
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── nav-bar.tsx
│   │   ├── appointments/
│   │   │   ├── appointment-card.tsx
│   │   │   ├── appointment-list.tsx
│   │   │   └── appointment-form.tsx
│   │   ├── patients/
│   │   │   ├── patient-card.tsx
│   │   │   ├── patient-list.tsx
│   │   │   └── patient-form.tsx
│   │   ├── messages/
│   │   │   ├── message-bubble.tsx
│   │   │   ├── message-list.tsx
│   │   │   └── template-editor.tsx
│   │   └── dashboard/
│   │       ├── stats-row.tsx
│   │       └── day-overview.tsx
│   │
│   └── app/
│       ├── layout.tsx                 # Layout raiz (fonte Inter, metadata)
│       ├── page.tsx                   # Redirect para /painel
│       ├── globals.css                # Tailwind + tokens customizados
│       ├── login/
│       │   └── page.tsx               # Tela de login (Magic Link)
│       ├── (app)/
│       │   ├── layout.tsx             # Layout autenticado (nav-bar)
│       │   ├── painel/
│       │   │   └── page.tsx           # Dashboard — visao do dia
│       │   ├── agenda/
│       │   │   └── page.tsx           # Agenda semanal/mensal
│       │   ├── pacientes/
│       │   │   ├── page.tsx           # Lista de pacientes
│       │   │   └── [id]/
│       │   │       └── page.tsx       # Ficha do paciente
│       │   ├── mensagens/
│       │   │   └── page.tsx           # Historico + templates
│       │   └── ajustes/
│       │       └── page.tsx           # Configuracoes
│       └── api/
│           ├── patients/
│           │   ├── route.ts           # GET (listar), POST (criar)
│           │   └── [id]/
│           │       └── route.ts       # PATCH (atualizar), DELETE (desativar)
│           ├── appointments/
│           │   ├── route.ts           # GET (listar), POST (criar)
│           │   └── [id]/
│           │       └── route.ts       # PATCH (atualizar), DELETE (cancelar)
│           ├── messages/
│           │   ├── route.ts           # GET (listar)
│           │   └── send/
│           │       └── route.ts       # POST (enviar manual)
│           ├── templates/
│           │   ├── route.ts           # GET (listar)
│           │   └── [id]/
│           │       └── route.ts       # PATCH (atualizar)
│           ├── settings/
│           │   └── route.ts           # GET, PATCH
│           └── webhooks/
│               └── whatsapp/
│                   └── route.ts       # GET (verificacao), POST (inbound)
│
├── __tests__/
│   ├── lib/
│   │   ├── whatsapp/
│   │   │   ├── classifier.test.ts
│   │   │   └── templates.test.ts
│   │   └── utils.test.ts
│   ├── api/
│   │   ├── patients.test.ts
│   │   ├── appointments.test.ts
│   │   ├── messages.test.ts
│   │   └── webhooks.test.ts
│   └── components/
│       ├── appointment-card.test.tsx
│       ├── badge.test.tsx
│       └── nav-bar.test.tsx
│
└── docs/
    └── superpowers/
        ├── specs/
        │   └── 2026-03-24-gabi-agendamentos-design.md
        └── plans/
            └── 2026-03-24-gabi-agendamentos-plan.md (este arquivo)
```

---

## Task 1: Setup do Projeto

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.js`, `.env.local`, `.gitignore`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`

- [ ] **Step 1: Inicializar projeto Next.js com TypeScript e Tailwind**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Quando perguntar, aceitar os defaults. O `--app` cria o App Router.

- [ ] **Step 2: Instalar dependencias**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

- [ ] **Step 3: Criar `.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
WHATSAPP_PHONE_ID=seu_phone_id
WHATSAPP_TOKEN=seu_token
WHATSAPP_VERIFY_TOKEN=um_token_secreto_qualquer
```

- [ ] **Step 4: Configurar Vitest**

Criar `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Criar `__tests__/setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest'
```

Adicionar ao `package.json` na secao `scripts`:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 5: Configurar Tailwind com tokens do design system**

Editar `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F3E8FF',
          100: '#E9D5FF',
          200: '#C4B5FD',
          300: '#A78BFA',
          400: '#8B5CF6',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
        },
        nature: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        surface: {
          page: '#F9FAFB',
          card: '#FFFFFF',
          border: '#F3F4F6',
        },
        text: {
          primary: '#1D1D1F',
          secondary: '#6B7280',
          tertiary: '#86868B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        emoji: ['Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'sans-serif'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '14px',
        'lg': '20px',
        'pill': '100px',
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0,0,0,0.03)',
        'light': '0 2px 8px rgba(0,0,0,0.04)',
        'medium': '0 4px 24px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 6: Configurar `globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-surface-page text-text-primary font-sans antialiased;
  }

  h1, h2 {
    letter-spacing: -0.03em;
  }

  h3, h4 {
    letter-spacing: -0.02em;
  }
}
```

- [ ] **Step 7: Configurar `layout.tsx` raiz**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gabi Agendamentos',
  description: 'Gestao de agenda e confirmacao automatica de sessoes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 8: Configurar `page.tsx` raiz (redirect)**

```typescript
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/painel')
}
```

- [ ] **Step 9: Atualizar `.gitignore`**

Adicionar ao `.gitignore` gerado:

```
.env.local
.env*.local
.superpowers/
```

- [ ] **Step 10: Verificar que o projeto roda**

```bash
npm run dev
```

Esperado: App rodando em localhost:3000, redirect para /painel (404 por enquanto — normal).

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: setup projeto Next.js + Tailwind + Vitest + design tokens"
```

---

## Task 2: Supabase — Clientes e Types

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/types.ts`

- [ ] **Step 1: Criar tipo do banco de dados**

Criar `src/lib/supabase/types.ts`:

```typescript
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'rescheduling' | 'no_show'
export type MessageDirection = 'outbound' | 'inbound'
export type MessageType = 'confirmation' | 'followup' | 'reminder' | 'reply' | 'cancellation' | 'manual'
export type WapiStatus = 'sent' | 'delivered' | 'read' | 'failed'
export type TemplateType = 'confirmation' | 'followup' | 'reminder' | 'cancellation'

export interface Patient {
  id: string
  user_id: string
  name: string
  phone: string
  default_weekday: number | null
  default_time: string | null
  notes: string | null
  active: boolean
  created_at: string
}

export interface Appointment {
  id: string
  user_id: string
  patient_id: string
  date: string
  time: string
  duration_min: number
  status: AppointmentStatus
  confirmation_sent: boolean
  confirmation_sent_at: string | null
  followup_sent: boolean
  followup_sent_at: string | null
  alert: boolean
  created_at: string
  patient?: Patient
}

export interface Message {
  id: string
  user_id: string
  appointment_id: string | null
  patient_id: string
  direction: MessageDirection
  type: MessageType
  content: string
  wapi_status: WapiStatus
  wapi_message_id: string | null
  sent_at: string
}

export interface MessageTemplate {
  id: string
  user_id: string
  type: TemplateType
  content: string
  active: boolean
  updated_at: string
}

export interface Settings {
  id: string
  confirmation_time: string
  followup_delay_hours: number
  reminder_time: string
  default_duration_min: number
  break_between_min: number
  working_hours: Record<string, { start: string; end: string } | null>
  whatsapp_phone_id: string | null
  whatsapp_token: string | null
}
```

- [ ] **Step 2: Criar cliente browser**

Criar `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Criar cliente server**

Criar `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat: clientes Supabase (browser + server) e types do banco"
```

---

## Task 3: Migrations do Banco de Dados

**Files:**
- Create: `supabase/migrations/001_create_patients.sql` ate `006_seed_templates_and_settings.sql`

- [ ] **Step 1: Criar migration `001_create_patients.sql`**

```sql
create table patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) default auth.uid() not null,
  name text not null,
  phone text not null,
  default_weekday int check (default_weekday between 0 and 6),
  default_time time,
  notes text,
  active boolean default true not null,
  created_at timestamptz default now() not null
);

alter table patients enable row level security;

create policy "Usuarios veem apenas seus pacientes"
  on patients for all
  using (auth.uid() = user_id);

create index idx_patients_user_id on patients(user_id);
create index idx_patients_phone on patients(phone);
```

- [ ] **Step 2: Criar migration `002_create_appointments.sql`**

```sql
create type appointment_status as enum ('pending', 'confirmed', 'cancelled', 'rescheduling', 'no_show');

create table appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) default auth.uid() not null,
  patient_id uuid references patients(id) on delete cascade not null,
  date date not null,
  time time not null,
  duration_min int default 60 not null,
  status appointment_status default 'pending' not null,
  confirmation_sent boolean default false not null,
  confirmation_sent_at timestamptz,
  followup_sent boolean default false not null,
  followup_sent_at timestamptz,
  alert boolean default false not null,
  created_at timestamptz default now() not null
);

alter table appointments enable row level security;

create policy "Usuarios veem apenas seus agendamentos"
  on appointments for all
  using (auth.uid() = user_id);

create index idx_appointments_user_date on appointments(user_id, date);
create index idx_appointments_patient on appointments(patient_id);
create index idx_appointments_status on appointments(status);
```

- [ ] **Step 3: Criar migration `003_create_messages.sql`**

```sql
create type message_direction as enum ('outbound', 'inbound');
create type message_type as enum ('confirmation', 'followup', 'reminder', 'reply', 'cancellation', 'manual');
create type wapi_status as enum ('sent', 'delivered', 'read', 'failed');

create table messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) default auth.uid() not null,
  appointment_id uuid references appointments(id) on delete set null,
  patient_id uuid references patients(id) on delete cascade not null,
  direction message_direction not null,
  type message_type not null,
  content text not null,
  wapi_status wapi_status default 'sent' not null,
  wapi_message_id text,
  sent_at timestamptz default now() not null
);

alter table messages enable row level security;

create policy "Usuarios veem apenas suas mensagens"
  on messages for all
  using (auth.uid() = user_id);

create index idx_messages_patient on messages(patient_id);
create index idx_messages_appointment on messages(appointment_id);
```

- [ ] **Step 4: Criar migration `004_create_message_templates.sql`**

```sql
create type template_type as enum ('confirmation', 'followup', 'reminder', 'cancellation');

create table message_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) default auth.uid() not null,
  type template_type not null,
  content text not null,
  active boolean default true not null,
  updated_at timestamptz default now() not null
);

alter table message_templates enable row level security;

create policy "Usuarios veem apenas seus templates"
  on message_templates for all
  using (auth.uid() = user_id);
```

- [ ] **Step 5: Criar migration `005_create_settings.sql`**

```sql
create table settings (
  id uuid primary key references auth.users(id),
  confirmation_time time default '18:00' not null,
  followup_delay_hours int default 3 not null,
  reminder_time time default '07:00' not null,
  default_duration_min int default 60 not null,
  break_between_min int default 15 not null,
  working_hours jsonb default '{
    "1": {"start": "08:00", "end": "18:00"},
    "2": {"start": "08:00", "end": "18:00"},
    "3": {"start": "08:00", "end": "18:00"},
    "4": {"start": "08:00", "end": "18:00"},
    "5": {"start": "08:00", "end": "18:00"},
    "0": null,
    "6": null
  }'::jsonb not null,
  whatsapp_phone_id text,
  whatsapp_token text
);

alter table settings enable row level security;

create policy "Usuario ve apenas suas configuracoes"
  on settings for all
  using (auth.uid() = id);
```

- [ ] **Step 6: Criar migration `006_seed_templates_and_settings.sql`**

```sql
-- Seed executado manualmente apos criar o usuario no Supabase Auth
-- Substituir USER_ID_AQUI pelo UUID do usuario da Gabi

-- Templates padrao
insert into message_templates (user_id, type, content) values
  ('USER_ID_AQUI', 'confirmation', 'Ola, {nome}! Gostaria de confirmar sua sessao amanha, {dia_semana}, as {hora}. Posso confirmar? 🍃 ✨'),
  ('USER_ID_AQUI', 'followup', 'Oi, {nome}! Vi que ainda nao confirmou a sessao de amanha as {hora}. Consegue me confirmar? 🍃 ✨'),
  ('USER_ID_AQUI', 'reminder', 'Bom dia, {nome}! Lembrete: sua sessao e hoje as {hora}. Te espero! 🍃 ✨'),
  ('USER_ID_AQUI', 'cancellation', 'Oi, {nome}! Sua sessao de {dia_semana} as {hora} foi cancelada. Quando quiser reagendar, e so me chamar! 🍃 ✨');

-- Settings padrao
insert into settings (id) values ('USER_ID_AQUI');
```

- [ ] **Step 7: Commit**

```bash
git add supabase/
git commit -m "feat: migrations do banco — 5 tabelas + seed de templates"
```

---

## Task 4: Utilitarios e Helpers

**Files:**
- Create: `src/lib/utils.ts`, `__tests__/lib/utils.test.ts`

- [ ] **Step 1: Escrever testes dos helpers**

Criar `__tests__/lib/utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { formatTime, formatDate, weekdayName, greetingByTime } from '@/lib/utils'

describe('formatTime', () => {
  it('formata hora HH:MM para exibicao', () => {
    expect(formatTime('08:00:00')).toBe('08:00')
    expect(formatTime('14:30:00')).toBe('14:30')
    expect(formatTime('08:00')).toBe('08:00')
  })
})

describe('formatDate', () => {
  it('formata data ISO para dd/mm/aaaa', () => {
    expect(formatDate('2026-03-25')).toBe('25/03/2026')
  })
})

describe('weekdayName', () => {
  it('retorna nome do dia da semana em portugues', () => {
    expect(weekdayName('2026-03-25')).toBe('quarta-feira')
    expect(weekdayName('2026-03-24')).toBe('terca-feira')
  })
})

describe('greetingByTime', () => {
  it('retorna saudacao baseada na hora', () => {
    expect(greetingByTime(8)).toBe('Bom dia')
    expect(greetingByTime(13)).toBe('Boa tarde')
    expect(greetingByTime(19)).toBe('Boa noite')
  })
})
```

- [ ] **Step 2: Rodar testes — devem falhar**

```bash
npm run test:run -- __tests__/lib/utils.test.ts
```

Esperado: FAIL — modulos nao encontrados.

- [ ] **Step 3: Implementar helpers**

Criar `src/lib/utils.ts`:

```typescript
export function formatTime(time: string): string {
  return time.slice(0, 5)
}

export function formatDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function weekdayName(date: string): string {
  const d = new Date(date + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'long' })
}

export function greetingByTime(hour: number): string {
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}
```

- [ ] **Step 4: Rodar testes — devem passar**

```bash
npm run test:run -- __tests__/lib/utils.test.ts
```

Esperado: 4 testes PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.ts __tests__/lib/utils.test.ts
git commit -m "feat: helpers utilitarios (formatTime, formatDate, weekdayName, greeting)"
```

---

## Task 5: Classificador de Respostas WhatsApp

**Files:**
- Create: `src/lib/whatsapp/classifier.ts`, `__tests__/lib/whatsapp/classifier.test.ts`

- [ ] **Step 1: Escrever testes do classificador**

Criar `__tests__/lib/whatsapp/classifier.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { classifyResponse } from '@/lib/whatsapp/classifier'

describe('classifyResponse', () => {
  it('classifica confirmacoes', () => {
    expect(classifyResponse('Confirmo')).toBe('confirmed')
    expect(classifyResponse('sim')).toBe('confirmed')
    expect(classifyResponse('Pode confirmar')).toBe('confirmed')
    expect(classifyResponse('ok!')).toBe('confirmed')
    expect(classifyResponse('Sim, confirmado!')).toBe('confirmed')
    expect(classifyResponse('pode sim')).toBe('confirmed')
  })

  it('classifica cancelamentos', () => {
    expect(classifyResponse('Nao vou poder ir')).toBe('cancelled')
    expect(classifyResponse('Cancela por favor')).toBe('cancelled')
    expect(classifyResponse('nao posso amanha')).toBe('cancelled')
    expect(classifyResponse('Preciso cancelar')).toBe('cancelled')
  })

  it('classifica pedidos de remarcacao', () => {
    expect(classifyResponse('Posso trocar pra quinta?')).toBe('rescheduling')
    expect(classifyResponse('Quero remarcar')).toBe('rescheduling')
    expect(classifyResponse('Tem outro horario?')).toBe('rescheduling')
    expect(classifyResponse('Posso mudar o dia?')).toBe('rescheduling')
  })

  it('retorna unknown para mensagens ambiguas', () => {
    expect(classifyResponse('Oi, tudo bem?')).toBe('unknown')
    expect(classifyResponse('Obrigada!')).toBe('unknown')
    expect(classifyResponse('')).toBe('unknown')
  })

  it('e case-insensitive e ignora acentos', () => {
    expect(classifyResponse('CONFIRMO')).toBe('confirmed')
    expect(classifyResponse('NÃO VOU')).toBe('cancelled')
  })
})
```

- [ ] **Step 2: Rodar testes — devem falhar**

```bash
npm run test:run -- __tests__/lib/whatsapp/classifier.test.ts
```

- [ ] **Step 3: Implementar classificador**

Criar `src/lib/whatsapp/classifier.ts`:

```typescript
type Classification = 'confirmed' | 'cancelled' | 'rescheduling' | 'unknown'

const CONFIRM_PATTERNS = [
  /\bconfirm[oa]?(do)?\b/,
  /\bsim\b/,
  /\bpode\b/,
  /\bok\b/,
  /\bvou\s+(sim|estar)\b/,
]

const CANCEL_PATTERNS = [
  /\bn[aã]o\s+(vou|posso|consigo|da)\b/,
  /\bcancel[ao]?(r)?\b/,
  /\bdesist[oi]\b/,
]

const RESCHEDULE_PATTERNS = [
  /\btroc[ao]?(r)?\b/,
  /\bremarca[ro]?\b/,
  /\bmud[ao]?(r)?\b/,
  /\boutro\s+(hor[aá]rio|dia)\b/,
  /\balt?er[ao]?(r)?\b/,
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function classifyResponse(text: string): Classification {
  if (!text.trim()) return 'unknown'

  const normalized = normalize(text)

  // Cancelamento tem prioridade sobre confirmacao
  // "nao vou poder" contem "vou" mas e cancelamento
  for (const pattern of CANCEL_PATTERNS) {
    if (pattern.test(normalized)) return 'cancelled'
  }

  for (const pattern of RESCHEDULE_PATTERNS) {
    if (pattern.test(normalized)) return 'rescheduling'
  }

  for (const pattern of CONFIRM_PATTERNS) {
    if (pattern.test(normalized)) return 'confirmed'
  }

  return 'unknown'
}
```

- [ ] **Step 4: Rodar testes — devem passar**

```bash
npm run test:run -- __tests__/lib/whatsapp/classifier.test.ts
```

Esperado: todos os testes PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/whatsapp/classifier.ts __tests__/lib/whatsapp/classifier.test.ts
git commit -m "feat: classificador de respostas WhatsApp por palavras-chave"
```

---

## Task 6: Montador de Templates de Mensagem

**Files:**
- Create: `src/lib/whatsapp/templates.ts`, `__tests__/lib/whatsapp/templates.test.ts`

- [ ] **Step 1: Escrever testes**

Criar `__tests__/lib/whatsapp/templates.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { renderTemplate } from '@/lib/whatsapp/templates'

describe('renderTemplate', () => {
  it('substitui variaveis no template', () => {
    const template = 'Ola, {nome}! Sua sessao e as {hora} na {dia_semana}.'
    const result = renderTemplate(template, {
      nome: 'Maria',
      hora: '08:00',
      dia_semana: 'terca-feira',
    })
    expect(result).toBe('Ola, Maria! Sua sessao e as 08:00 na terca-feira.')
  })

  it('mantem variaveis nao fornecidas intactas', () => {
    const template = 'Oi, {nome}! Data: {data}'
    const result = renderTemplate(template, { nome: 'Ana' })
    expect(result).toBe('Oi, Ana! Data: {data}')
  })

  it('lida com template sem variaveis', () => {
    const template = 'Mensagem simples sem variaveis'
    const result = renderTemplate(template, { nome: 'Maria' })
    expect(result).toBe('Mensagem simples sem variaveis')
  })
})
```

- [ ] **Step 2: Rodar testes — devem falhar**

```bash
npm run test:run -- __tests__/lib/whatsapp/templates.test.ts
```

- [ ] **Step 3: Implementar renderTemplate**

Criar `src/lib/whatsapp/templates.ts`:

```typescript
export function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] ?? match
  })
}
```

- [ ] **Step 4: Rodar testes — devem passar**

```bash
npm run test:run -- __tests__/lib/whatsapp/templates.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/whatsapp/templates.ts __tests__/lib/whatsapp/templates.test.ts
git commit -m "feat: renderizador de templates de mensagem com variaveis"
```

---

## Task 7: Cliente WhatsApp Cloud API

**Files:**
- Create: `src/lib/whatsapp/client.ts`

- [ ] **Step 1: Implementar cliente**

Criar `src/lib/whatsapp/client.ts`:

```typescript
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0'

interface SendMessageResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendWhatsAppMessage(
  to: string,
  text: string
): Promise<SendMessageResult> {
  const phoneId = process.env.WHATSAPP_PHONE_ID
  const token = process.env.WHATSAPP_TOKEN

  if (!phoneId || !token) {
    return { success: false, error: 'WhatsApp nao configurado' }
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''),
          type: 'text',
          text: { body: text },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error?.message ?? 'Erro desconhecido' }
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de rede',
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/whatsapp/client.ts
git commit -m "feat: cliente WhatsApp Cloud API para envio de mensagens"
```

---

## Task 8: Componentes UI Base

**Files:**
- Create: `src/components/ui/button.tsx`, `badge.tsx`, `input.tsx`, `card.tsx`, `nav-bar.tsx`
- Create: `__tests__/components/badge.test.tsx`, `nav-bar.test.tsx`

- [ ] **Step 1: Criar componente Button**

Criar `src/components/ui/button.tsx`:

```typescript
import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const styles: Record<Variant, string> = {
  primary: 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-[0_2px_8px_rgba(124,58,237,0.25)] hover:from-brand-600 hover:to-brand-700',
  secondary: 'bg-white text-brand-500 border-[1.5px] border-brand-100 hover:bg-brand-50',
  ghost: 'text-text-secondary hover:text-text-primary',
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-[0.9rem] font-semibold transition-all ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Criar componente Badge**

Criar `src/components/ui/badge.tsx`:

```typescript
import type { AppointmentStatus } from '@/lib/supabase/types'

const statusConfig: Record<AppointmentStatus, { bg: string; text: string; label: string }> = {
  confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Confirmado' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Pendente' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-600', label: 'Cancelado' },
  rescheduling: { bg: 'bg-sky-50', text: 'text-sky-600', label: 'Remarcacao' },
  no_show: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Nao compareceu' },
}

export function Badge({ status }: { status: AppointmentStatus }) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`h-[7px] w-[7px] rounded-full bg-current`} />
      {config.label}
    </span>
  )
}
```

- [ ] **Step 3: Escrever teste do Badge**

Criar `__tests__/components/badge.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renderiza label correto para cada status', () => {
    const { rerender } = render(<Badge status="confirmed" />)
    expect(screen.getByText('Confirmado')).toBeDefined()

    rerender(<Badge status="pending" />)
    expect(screen.getByText('Pendente')).toBeDefined()

    rerender(<Badge status="cancelled" />)
    expect(screen.getByText('Cancelado')).toBeDefined()
  })
})
```

- [ ] **Step 4: Rodar teste do Badge**

```bash
npm run test:run -- __tests__/components/badge.test.tsx
```

Esperado: PASS.

- [ ] **Step 5: Criar componente Input**

Criar `src/components/ui/input.tsx`:

```typescript
import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-md border-[1.5px] border-surface-border bg-white px-4 py-3.5 text-[0.9rem] text-text-primary placeholder:text-text-tertiary outline-none transition-all focus:border-brand-300 focus:ring-[3px] focus:ring-brand-50 ${className}`}
        {...props}
      />
    </div>
  )
}
```

- [ ] **Step 6: Criar componente Card**

Criar `src/components/ui/card.tsx`:

```typescript
import { HTMLAttributes } from 'react'

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-md border border-surface-border bg-surface-card shadow-subtle ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 7: Criar componente NavBar**

Criar `src/components/ui/nav-bar.tsx`:

```typescript
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
```

- [ ] **Step 8: Escrever teste do NavBar**

Criar `__tests__/components/nav-bar.test.tsx`:

```typescript
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
```

- [ ] **Step 9: Rodar todos os testes**

```bash
npm run test:run
```

Esperado: todos PASS.

- [ ] **Step 10: Commit**

```bash
git add src/components/ui/ __tests__/components/
git commit -m "feat: componentes UI base (Button, Badge, Input, Card, NavBar)"
```

---

## Task 9: Autenticacao e Middleware

**Files:**
- Create: `middleware.ts`, `src/app/login/page.tsx`

- [ ] **Step 1: Criar middleware de protecao de rotas**

Criar `middleware.ts` na raiz:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/api/webhooks')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 2: Criar pagina de login**

Criar `src/app/login/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/painel` },
    })

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary">
            <span className="font-emoji">🍃</span> Gabi
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Agendamentos
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg bg-brand-50 p-6 text-center">
            <p className="font-emoji text-3xl">✨</p>
            <p className="mt-3 text-sm font-medium text-brand-600">
              Link enviado para {email}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Verifique seu email para acessar
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="gabi@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Entrar com Magic Link'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add middleware.ts src/app/login/
git commit -m "feat: autenticacao Magic Link + middleware de protecao de rotas"
```

---

## Task 10: Layout Autenticado com NavBar

**Files:**
- Create: `src/app/(app)/layout.tsx`, `src/app/(app)/painel/page.tsx`

- [ ] **Step 1: Criar layout do grupo autenticado**

Criar `src/app/(app)/layout.tsx`:

```typescript
import { NavBar } from '@/components/ui/nav-bar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-page pb-20">
      <main className="mx-auto max-w-lg px-4">
        {children}
      </main>
      <NavBar />
    </div>
  )
}
```

- [ ] **Step 2: Criar pagina do Painel (placeholder)**

Criar `src/app/(app)/painel/page.tsx`:

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { greetingByTime } from '@/lib/utils'

export default async function PainelPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const hour = new Date().getHours()

  return (
    <div className="pt-8">
      <p className="text-sm text-text-secondary">
        {greetingByTime(hour)}, Gabi <span className="font-emoji">🍃 ✨</span>
      </p>
      <h1 className="mt-1 text-2xl font-bold text-text-primary">
        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
      </h1>
      <div className="mt-6 rounded-lg border border-surface-border bg-surface-card p-8 text-center">
        <p className="text-sm text-text-secondary">Painel em construcao</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Testar visualmente**

```bash
npm run dev
```

Abrir localhost:3000 — deve redirecionar para /login. Interface limpa estilo Apple.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/
git commit -m "feat: layout autenticado com NavBar + pagina painel placeholder"
```

---

## Task 11: API Routes — Pacientes

**Files:**
- Create: `src/app/api/patients/route.ts`, `src/app/api/patients/[id]/route.ts`
- Create: `__tests__/api/patients.test.ts`

- [ ] **Step 1: Criar API route GET/POST pacientes**

Criar `src/app/api/patients/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('patients')
    .insert({
      name: body.name,
      phone: body.phone,
      default_weekday: body.default_weekday ?? null,
      default_time: body.default_time ?? null,
      notes: body.notes ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
```

- [ ] **Step 2: Criar API route PATCH/DELETE paciente**

Criar `src/app/api/patients/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('patients')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('patients')
    .update({ active: false })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/patients/
git commit -m "feat: API routes CRUD pacientes"
```

---

## Task 12: API Routes — Agendamentos

**Files:**
- Create: `src/app/api/appointments/route.ts`, `src/app/api/appointments/[id]/route.ts`

- [ ] **Step 1: Criar API route GET/POST agendamentos**

Criar `src/app/api/appointments/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  let query = supabase
    .from('appointments')
    .select('*, patient:patients(*)')
    .order('time')

  if (date) {
    query = query.eq('date', date)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: body.patient_id,
      date: body.date,
      time: body.time,
      duration_min: body.duration_min ?? 60,
    })
    .select('*, patient:patients(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
```

- [ ] **Step 2: Criar API route PATCH/DELETE agendamento**

Criar `src/app/api/appointments/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('appointments')
    .update(body)
    .eq('id', id)
    .select('*, patient:patients(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/appointments/
git commit -m "feat: API routes CRUD agendamentos"
```

---

## Task 13: API Routes — Mensagens, Templates, Settings, Webhook

**Files:**
- Create: todas as API routes restantes

- [ ] **Step 1: Criar API route mensagens (GET + POST send)**

Criar `src/app/api/messages/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patient_id')

  let query = supabase.from('messages').select('*').order('sent_at', { ascending: false }).limit(100)

  if (patientId) {
    query = query.eq('patient_id', patientId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

Criar `src/app/api/messages/send/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const body = await request.json()

  const result = await sendWhatsAppMessage(body.phone, body.content)

  const { data, error } = await supabase
    .from('messages')
    .insert({
      patient_id: body.patient_id,
      appointment_id: body.appointment_id ?? null,
      direction: 'outbound',
      type: 'manual',
      content: body.content,
      wapi_status: result.success ? 'sent' : 'failed',
      wapi_message_id: result.messageId ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: data, whatsapp: result })
}
```

- [ ] **Step 2: Criar API routes templates**

Criar `src/app/api/templates/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('message_templates').select('*').order('type')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

Criar `src/app/api/templates/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('message_templates')
    .update({ content: body.content, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 3: Criar API route settings**

Criar `src/app/api/settings/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

  const { data, error } = await supabase.from('settings').select('*').eq('id', user.id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('settings')
    .update(body)
    .eq('id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 4: Criar webhook WhatsApp (inbound)**

Criar `src/app/api/webhooks/whatsapp/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { classifyResponse } from '@/lib/whatsapp/classifier'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'
import { renderTemplate } from '@/lib/whatsapp/templates'
import { weekdayName, formatTime } from '@/lib/utils'

// Usar service role — webhook nao tem sessao de usuario
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET — Verificacao do webhook pela Meta
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Verificacao falhou' }, { status: 403 })
}

// POST — Mensagem recebida
export async function POST(request: NextRequest) {
  const body = await request.json()
  const supabase = getAdminClient()

  // Extrair mensagem do payload do WhatsApp
  const entry = body.entry?.[0]
  const change = entry?.changes?.[0]
  const message = change?.value?.messages?.[0]

  if (!message) {
    return NextResponse.json({ status: 'no_message' })
  }

  const phone = message.from
  const isText = message.type === 'text'
  const text = isText ? message.text.body : ''

  // Buscar paciente pelo telefone
  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('phone', phone)
    .eq('active', true)
    .single()

  if (!patient) {
    return NextResponse.json({ status: 'patient_not_found' })
  }

  // Buscar agendamento pendente mais proximo
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patient.id)
    .in('status', ['pending'])
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date')
    .order('time')
    .limit(1)
    .single()

  // Registrar mensagem recebida
  await supabase.from('messages').insert({
    user_id: patient.user_id,
    patient_id: patient.id,
    appointment_id: appointment?.id ?? null,
    direction: 'inbound',
    type: 'reply',
    content: isText ? text : `[${message.type}]`,
    wapi_status: 'delivered',
    wapi_message_id: message.id,
  })

  if (!appointment) {
    return NextResponse.json({ status: 'no_pending_appointment' })
  }

  // Classificar resposta
  const classification = isText ? classifyResponse(text) : 'unknown'

  if (classification === 'confirmed') {
    await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', appointment.id)

    // Buscar template de confirmacao para resposta
    const { data: templates } = await supabase
      .from('message_templates')
      .select('*')
      .eq('user_id', patient.user_id)
      .eq('type', 'confirmation')
      .eq('active', true)
      .limit(1)

    // Buscar e enviar resposta de confirmacao usando template do banco
    const vars = { nome: patient.name.split(' ')[0], hora: formatTime(appointment.time), dia_semana: weekdayName(appointment.date) }
    const confirmText = `Perfeito, ${vars.nome}! Sessao confirmada para ${vars.dia_semana} as ${vars.hora}. Te espero! 🍃 ✨`
    await sendWhatsAppMessage(phone, confirmText)

  } else if (classification === 'cancelled') {
    await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointment.id)

    // Buscar template de cancelamento do banco
    const { data: cancelTemplate } = await supabase
      .from('message_templates')
      .select('content')
      .eq('user_id', patient.user_id)
      .eq('type', 'cancellation')
      .eq('active', true)
      .single()

    const vars = { nome: patient.name.split(' ')[0], hora: formatTime(appointment.time), dia_semana: weekdayName(appointment.date) }
    const cancelText = cancelTemplate
      ? renderTemplate(cancelTemplate.content, vars)
      : `Oi, ${vars.nome}! Sua sessao foi cancelada. Quando quiser reagendar, e so me chamar! 🍃 ✨`
    await sendWhatsAppMessage(phone, cancelText)

  } else if (classification === 'rescheduling') {
    await supabase
      .from('appointments')
      .update({ status: 'rescheduling', alert: true })
      .eq('id', appointment.id)

  } else {
    // unknown — alertar Gabi
    await supabase
      .from('appointments')
      .update({ alert: true })
      .eq('id', appointment.id)
  }

  return NextResponse.json({ status: 'processed', classification })
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/
git commit -m "feat: API routes — mensagens, templates, settings, webhook WhatsApp"
```

---

## Task 14: Pagina Painel (Dashboard) Completa

**Files:**
- Create: `src/components/dashboard/stats-row.tsx`, `src/components/dashboard/day-overview.tsx`
- Modify: `src/app/(app)/painel/page.tsx`
- Create: `src/components/appointments/appointment-card.tsx`

- [ ] **Step 1: Criar componente AppointmentCard**

Criar `src/components/appointments/appointment-card.tsx`:

```typescript
import { Badge } from '@/components/ui/badge'
import { formatTime } from '@/lib/utils'
import type { Appointment } from '@/lib/supabase/types'

const statusColors: Record<string, string> = {
  confirmed: 'bg-emerald-500',
  pending: 'bg-amber-400',
  cancelled: 'bg-red-500',
  rescheduling: 'bg-sky-500',
  no_show: 'bg-gray-400',
}

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const isCancelled = appointment.status === 'cancelled'

  return (
    <div className="flex items-center gap-3 rounded-md border border-surface-border bg-surface-card p-3.5">
      <div className={`h-10 w-1 flex-shrink-0 rounded-full ${statusColors[appointment.status]}`} />
      <div className={`min-w-[44px] text-sm font-bold ${isCancelled ? 'text-text-tertiary line-through' : 'text-brand-500'}`}>
        {formatTime(appointment.time)}
      </div>
      <div className="flex-1 min-w-0">
        <h5 className={`text-[0.85rem] font-semibold ${isCancelled ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
          {appointment.patient?.name ?? 'Paciente'}
        </h5>
        <p className="text-xs text-text-secondary truncate">
          {appointment.alert ? 'Precisa de atencao' : 'Sessao'}
        </p>
      </div>
      <Badge status={appointment.status} />
    </div>
  )
}
```

- [ ] **Step 2: Criar componente StatsRow**

Criar `src/components/dashboard/stats-row.tsx`:

```typescript
interface StatCardProps {
  value: number
  label: string
  color: string
}

function StatCard({ value, label, color }: StatCardProps) {
  return (
    <div className="rounded-md border border-surface-border bg-surface-card p-3.5 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="mt-0.5 text-[0.68rem] font-medium text-text-secondary">{label}</div>
    </div>
  )
}

interface StatsRowProps {
  confirmed: number
  pending: number
  cancelled: number
}

export function StatsRow({ confirmed, pending, cancelled }: StatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      <StatCard value={confirmed} label="Confirmados" color="text-emerald-500" />
      <StatCard value={pending} label="Pendentes" color="text-amber-500" />
      <StatCard value={cancelled} label="Cancelados" color="text-red-500" />
    </div>
  )
}
```

- [ ] **Step 3: Atualizar pagina do Painel**

Substituir `src/app/(app)/painel/page.tsx`:

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { greetingByTime } from '@/lib/utils'
import { StatsRow } from '@/components/dashboard/stats-row'
import { AppointmentCard } from '@/components/appointments/appointment-card'
import type { Appointment } from '@/lib/supabase/types'

export default async function PainelPage() {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]
  const hour = new Date().getHours()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, patient:patients(*)')
    .eq('date', today)
    .order('time')

  const list = (appointments ?? []) as Appointment[]
  const confirmed = list.filter(a => a.status === 'confirmed').length
  const pending = list.filter(a => a.status === 'pending').length
  const cancelled = list.filter(a => a.status === 'cancelled').length

  return (
    <div className="pt-8 space-y-5">
      <div>
        <p className="text-sm text-text-secondary">
          {greetingByTime(hour)}, Gabi <span className="font-emoji">🍃 ✨</span>
        </p>
        <h1 className="mt-1 text-2xl font-bold text-text-primary">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
        </h1>
      </div>

      <StatsRow confirmed={confirmed} pending={pending} cancelled={cancelled} />

      <div className="space-y-2">
        {list.length === 0 ? (
          <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center">
            <p className="text-sm text-text-secondary">Nenhuma sessao hoje</p>
          </div>
        ) : (
          list.map(appointment => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verificar visualmente**

```bash
npm run dev
```

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/ src/components/appointments/appointment-card.tsx src/app/\(app\)/painel/
git commit -m "feat: pagina Painel completa — stats, lista de sessoes, estilo Apple"
```

---

## Task 15: Pagina Pacientes (CRUD)

**Files:**
- Create: `src/components/patients/patient-card.tsx`, `patient-list.tsx`, `patient-form.tsx`
- Create: `src/app/(app)/pacientes/page.tsx`, `src/app/(app)/pacientes/[id]/page.tsx`

> **NOTA PARA EXECUCAO:** O codigo completo destes componentes deve ser gerado durante a execucao, seguindo o design spec secao 6.3 e os padroes estabelecidos nas Tasks 8 e 14.

**Requisitos da pagina de lista:**
- Campo de busca (filtro por nome)
- Lista com avatar (iniciais), nome, dia/horario fixo, total de sessoes
- Botao "Novo paciente" abre formulario

**Requisitos da ficha do paciente ([id]):**
- Nome, telefone (WhatsApp), dia/horario fixo, notas privadas
- Historico de presenca: ultimas sessoes com status (query appointments WHERE patient_id, order by date desc, limit 10)
- Taxa de confirmacao: `(confirmed / total) * 100` calculado no server
- Botao "Enviar mensagem" → POST /api/messages/send

- [ ] **Step 1: Criar patient-card.tsx (avatar iniciais + info + badge)**
- [ ] **Step 2: Criar patient-list.tsx (busca + lista)**
- [ ] **Step 3: Criar patient-form.tsx (nome, phone, weekday, time, notes)**
- [ ] **Step 4: Criar pagina lista /pacientes (server component, fetch patients)**
- [ ] **Step 5: Criar pagina ficha /pacientes/[id] (historico, taxa, botao msg)**
- [ ] **Step 6: Testar visualmente**
- [ ] **Step 7: Commit**

```bash
git commit -m "feat: pagina Pacientes — lista, ficha, cadastro, busca"
```

---

## Task 16: Pagina Agenda

**Files:**
- Create: `src/app/(app)/agenda/page.tsx`, `src/components/appointments/appointment-form.tsx`, `src/components/appointments/appointment-list.tsx`

> **NOTA PARA EXECUCAO:** Codigo gerado durante execucao. Seguir design spec secao 6.2.

**Requisitos:**
- Alternador de visao: Dia / Semana / Mes (client-side state)
- Navegacao temporal (anterior/proximo)
- Visao dia: grid de horarios (08:00-18:00) com sessoes posicionadas
- Visao semana: grid seg-sex com numero de sessoes por dia
- Visao mes: calendario com contador de sessoes por dia
- Criar agendamento ao tocar em horario vazio → modal com appointment-form
- Bloquear dias/horarios: campo boolean no working_hours da settings
- Cores por status (verde/amarelo/vermelho/azul)

- [ ] **Step 1: Criar appointment-form.tsx (select paciente, date, time, duration)**
- [ ] **Step 2: Criar appointment-list.tsx (grid de horarios reutilizavel)**
- [ ] **Step 3: Criar pagina /agenda (visao dia com alternador)**
- [ ] **Step 4: Adicionar visao semana e mes**
- [ ] **Step 5: Testar visualmente**
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: pagina Agenda — visao dia/semana, criar agendamento"
```

---

## Task 17: Pagina Mensagens

**Files:**
- Create: `src/app/(app)/mensagens/page.tsx`, `src/components/messages/message-bubble.tsx`, `message-list.tsx`, `template-editor.tsx`

> **NOTA PARA EXECUCAO:** Codigo gerado durante execucao. Seguir design spec secao 6.4.

**Requisitos:**
- Duas abas: "Conversas" e "Templates" (client-side tabs)
- **Conversas:** lista de pacientes com ultima mensagem, ao tocar abre historico com bolhas
  - Outbound: gradiente violeta, texto branco, border-radius 18px canto inferior direito 6px
  - Inbound: fundo #f3f4f6, texto preto, border-radius 18px canto inferior esquerdo 6px
  - Confirmacao: gradiente verde
- **Templates:** 4 cards editaveis (confirmation, followup, reminder, cancellation)
  - Preview com variaveis destacadas
  - Salvar via PATCH /api/templates/[id]

- [ ] **Step 1: Criar message-bubble.tsx (outbound violeta, inbound cinza, confirm verde)**
- [ ] **Step 2: Criar message-list.tsx (lista por paciente + historico)**
- [ ] **Step 3: Criar template-editor.tsx (card editavel + preview)**
- [ ] **Step 4: Criar pagina /mensagens com abas**
- [ ] **Step 5: Testar visualmente**
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: pagina Mensagens — conversas com bolhas + editor de templates"
```

---

## Task 18: Pagina Ajustes

**Files:**
- Create: `src/app/(app)/ajustes/page.tsx`

> **NOTA PARA EXECUCAO:** Codigo gerado durante execucao. Seguir design spec secao 6.5.

**Requisitos:**
- Fetch GET /api/settings ao carregar
- Campos: confirmation_time, followup_delay_hours, reminder_time, default_duration_min, break_between_min
- Horarios de atendimento por dia da semana (working_hours JSON editor simples)
- Conexao WhatsApp (phone_id, token — campos senha)
- Secao "Modulo Financeiro" desabilitada com badge "Em breve"
- Salvar via PATCH /api/settings

- [ ] **Step 1: Criar pagina de ajustes com formulario completo**
- [ ] **Step 2: Testar visualmente**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat: pagina Ajustes — configuracoes de automacao e horarios"
```

---

## Task 19: Fluxos N8N — Documentacao e Configuracao

**Files:**
- Create: `docs/n8n-flows.md`

> Nao vamos criar os fluxos N8N por codigo — eles sao configurados pela UI do N8N. Este task documenta passo a passo como criar cada fluxo, com screenshots descritivos e os JSONs de configuracao necessarios. Conforme design spec (secao 8).

- [ ] **Step 1: Documentar fluxo de confirmacao (cron diario)**
- [ ] **Step 2: Documentar fluxo de follow-up**
- [ ] **Step 3: Documentar fluxo de lembrete do dia**
- [ ] **Step 4: Documentar fluxo de alerta (silencio persistente)**
- [ ] **Step 5: Commit**

```bash
git commit -m "docs: guia de configuracao dos 4 fluxos N8N"
```

---

## Task 20: Testes Finais e Deploy

**Files:**
- Modify: diversos para ajustes

- [ ] **Step 1: Rodar todos os testes**

```bash
npm run test:run
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

- [ ] **Step 3: Corrigir erros de build (se houver)**

- [ ] **Step 4: Testar fluxo completo localmente**

1. Login com Magic Link
2. Criar paciente
3. Criar agendamento
4. Ver no painel
5. Editar template
6. Alterar configuracoes

- [ ] **Step 5: Commit final**

```bash
git commit -m "chore: ajustes finais pre-deploy"
```

- [ ] **Step 6: Deploy na Vercel**

```bash
npx vercel --prod
```

---

## Resumo

| Task | Descricao | Commits |
|------|-----------|---------|
| 1 | Setup projeto | 1 |
| 2 | Supabase clients + types | 1 |
| 3 | Migrations banco | 1 |
| 4 | Helpers utilitarios | 1 |
| 5 | Classificador respostas | 1 |
| 6 | Montador templates | 1 |
| 7 | Cliente WhatsApp API | 1 |
| 8 | Componentes UI base | 1 |
| 9 | Auth + middleware | 1 |
| 10 | Layout + NavBar | 1 |
| 11 | API pacientes | 1 |
| 12 | API agendamentos | 1 |
| 13 | API msgs + templates + settings + webhook | 1 |
| 14 | Pagina Painel | 1 |
| 15 | Pagina Pacientes | 1 |
| 16 | Pagina Agenda | 1 |
| 17 | Pagina Mensagens | 1 |
| 18 | Pagina Ajustes | 1 |
| 19 | Docs N8N | 1 |
| 20 | Testes + deploy | 1 |

**Total: 20 tasks, ~20 commits**
