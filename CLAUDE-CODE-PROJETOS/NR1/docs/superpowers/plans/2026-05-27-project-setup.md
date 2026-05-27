# NR-1 Project Setup — Initial Scaffold

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a Next.js 14 App Router project with TypeScript, Tailwind CSS com tokens do design system NR-1, shadcn/ui inicializado, estrutura de pastas da camada de IA, e arquivos essenciais do projeto (.env.example, README).

**Architecture:** Next.js 14 App Router no diretório raiz do projeto. Tailwind v3 estendido com todas as variáveis CSS do DesignSystem-NR1.md. shadcn/ui inicializado com tema slate e CSS variables, depois sobrescrito com as cores semânticas do design system. Estrutura de pastas `/lib/ai/` conforme PRD-Agentes section 2.2 e `/components/` conforme DesignSystem section 7.4.

**Tech Stack:** Next.js 14, TypeScript 5, Tailwind CSS 3, shadcn/ui (latest), Node.js 24, npm 11, Anthropic SDK (@anthropic-ai/sdk)

---

## File Map

### Criados pelo scaffold (Next.js + shadcn)
- `package.json` — dependências do projeto
- `next.config.ts` — configuração do Next.js
- `tailwind.config.ts` — **MODIFICADO** com tokens do design system
- `app/globals.css` — **MODIFICADO** com variáveis CSS do design system
- `components.json` — configuração do shadcn/ui
- `tsconfig.json` — configuração TypeScript
- `.eslintrc.json` — configuração ESLint
- `.gitignore` — arquivos ignorados pelo git

### Criados por nós
- `lib/ai/clients/anthropic.ts` — singleton do cliente Anthropic
- `lib/ai/agents/classifier.ts` — placeholder do Agente Classificador
- `lib/ai/agents/assistant.ts` — placeholder do Agente de Atendimento
- `lib/ai/prompts/classifier.md` — prompt do Classificador (versionado)
- `lib/ai/prompts/assistant.md` — prompt do Atendimento (versionado)
- `lib/ai/utils/anonymizer.ts` — remove CPF/email/telefone antes de enviar à API
- `lib/ai/utils/logger.ts` — log de chamadas à API de IA
- `lib/ai/utils/cost-tracker.ts` — rastreamento de custo por chamada
- `lib/ai/utils/retry.ts` — retry com backoff exponencial
- `lib/ai/types/ai-types.ts` — tipos compartilhados da camada de IA
- `components/layout/.gitkeep` — pasta para AppShell, Sidebar, Topbar
- `components/forms/.gitkeep` — pasta para campos especializados
- `components/tables/.gitkeep` — pasta para DataTable customizada
- `components/domain/.gitkeep` — pasta para componentes de negócio
- `components/ai/.gitkeep` — pasta para componentes da camada de IA
- `.env.example` — variáveis de ambiente necessárias
- `README.md` — documentação inicial do projeto

---

## Task 1: Scaffold Next.js 14

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `app/globals.css`, `tsconfig.json`, `.eslintrc.json`, `.gitignore`, `app/layout.tsx`, `app/page.tsx`, `public/`

- [ ] **Step 1: Criar o projeto Next.js 14**

```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --import-alias "@/*" --use-npm
```

Quando solicitado sobre diretório existente: responder **y** (yes).
Quando solicitado sobre `src/` directory: responder **No**.
Quando solicitado sobre Turbopack: responder **No**.

- [ ] **Step 2: Verificar que o scaffold compilou**

```bash
npm run build
```

Saída esperada: `✓ Compiled successfully` com lista de rotas (no mínimo `/`).

- [ ] **Step 3: Commit do scaffold base**

```bash
git add .
git commit -m "feat: scaffold Next.js 14 com TypeScript, Tailwind e ESLint"
```

---

## Task 2: Configurar Tailwind com Design System

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Substituir tailwind.config.ts**

Substituir o conteúdo completo de `tailwind.config.ts` por:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Estados de conformidade — RESERVADAS (cor = informação, não decoração)
        'state-success':    '#16a34a',
        'state-success-bg': '#dcfce7',
        'state-warning':    '#d97706',
        'state-warning-bg': '#fef3c7',
        'state-critical':   '#dc2626',
        'state-critical-bg':'#fee2e2',
        'state-info':       '#2563eb',
        'state-info-bg':    '#dbeafe',
        // Matriz de risco
        'risk-low':      '#65a30d',
        'risk-medium':   '#ca8a04',
        'risk-high':     '#ea580c',
        'risk-critical': '#b91c1c',
        // Marca
        'brand-primary':   '#0f172a',
        'brand-secondary': '#334155',
        'brand-accent':    '#0891b2',
        // Superfícies
        'surface-0': '#ffffff',
        'surface-1': '#f8fafc',
        'surface-2': '#f1f5f9',
        'surface-3': '#e2e8f0',
        'surface-4': '#cbd5e1',
        // Texto
        'text-primary':   '#0f172a',
        'text-secondary': '#475569',
        'text-tertiary':  '#94a3b8',
        'text-on-dark':   '#f8fafc',
        // IA — cor própria para conteúdo gerado por IA
        'ai-accent':    '#7c3aed',
        'ai-accent-bg': '#f3e8ff',
        'ai-border':    '#c4b5fd',
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.07)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
        'focus': '0 0 0 3px rgba(8, 145, 178, 0.3)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4' }],
      },
      spacing: {
        '18': '72px',
        '72': '288px',
        '80': '320px',
        '96': '384px',
      },
      width: {
        'sidebar': '240px',
        'sidebar-collapsed': '64px',
        'drawer-sm': '480px',
        'drawer-md': '720px',
        'drawer-lg': '960px',
      },
      maxWidth: {
        'modal-sm': '480px',
        'modal-md': '640px',
        'modal-lg': '800px',
      },
      height: {
        'topbar': '56px',
        'row-compact': '32px',
        'row-default': '48px',
        'row-comfortable': '64px',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Verificar que Tailwind ainda compila**

```bash
npm run build
```

Saída esperada: build bem-sucedido, sem erros de TypeScript.

---

## Task 3: Configurar globals.css com variáveis CSS do Design System

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Substituir app/globals.css**

Substituir o conteúdo completo por (os `--background`, `--foreground` etc. serão configurados pelo shadcn/ui na Task 4 — aqui colocamos a estrutura base):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* ── Design System NR-1 — Estados de Conformidade (RESERVADAS) ── */
    --state-success:    #16a34a;
    --state-success-bg: #dcfce7;
    --state-warning:    #d97706;
    --state-warning-bg: #fef3c7;
    --state-critical:   #dc2626;
    --state-critical-bg:#fee2e2;
    --state-info:       #2563eb;
    --state-info-bg:    #dbeafe;

    /* ── Matriz de Risco ── */
    --risk-low:      #65a30d;
    --risk-medium:   #ca8a04;
    --risk-high:     #ea580c;
    --risk-critical: #b91c1c;

    /* ── Marca ── */
    --brand-primary:   #0f172a;
    --brand-secondary: #334155;
    --brand-accent:    #0891b2;

    /* ── Superfícies ── */
    --surface-0: #ffffff;
    --surface-1: #f8fafc;
    --surface-2: #f1f5f9;
    --surface-3: #e2e8f0;
    --surface-4: #cbd5e1;

    /* ── Texto ── */
    --text-primary:   #0f172a;
    --text-secondary: #475569;
    --text-tertiary:  #94a3b8;
    --text-on-dark:   #f8fafc;

    /* ── Camada de IA ── */
    --ai-accent:    #7c3aed;
    --ai-accent-bg: #f3e8ff;
    --ai-border:    #c4b5fd;

    /* ── Bordas e Sombras ── */
    --border-radius-sm: 4px;
    --border-radius-md: 6px;
    --border-radius-lg: 8px;
    --shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md:   0 4px 6px -1px rgba(0, 0, 0, 0.07);
    --shadow-lg:   0 10px 15px -3px rgba(0, 0, 0, 0.08);
    --focus-ring:  0 0 0 3px rgba(8, 145, 178, 0.3);

    /* ── shadcn/ui — preenchido pelo init na Task 4 ── */
    /* Estes valores serão sobrescritos pelo shadcn init  */
    /* mas são mantidos aqui como documentação da intenção */
    /* --background mapeado para surface-0 (#ffffff)      */
    /* --foreground mapeado para text-primary (#0f172a)   */
    /* --primary mapeado para brand-accent (#0891b2)      */
    /* --destructive mapeado para state-critical (#dc2626)*/
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Saída esperada: build bem-sucedido.

---

## Task 4: Inicializar shadcn/ui

**Files:**
- Create: `components.json`
- Modify: `tailwind.config.ts` (shadcn adiciona plugins)
- Modify: `app/globals.css` (shadcn adiciona variáveis HSL)

- [ ] **Step 1: Rodar o init do shadcn/ui**

```bash
npx shadcn@latest init
```

Responder aos prompts:
- Which style would you like to use? → **Default**
- Which color would you like to use as base color? → **Slate**
- Would you like to use CSS variables for colors? → **yes**

- [ ] **Step 2: Sobrescrever variáveis HSL do shadcn com as cores do design system**

O shadcn/ui adiciona variáveis HSL (ex: `--primary: 222.2 47.4% 11.2%`). Precisamos sobrescrever `--primary` para o brand-accent (cyan) e ajustar outras. Abrir `app/globals.css` e **modificar** as variáveis dentro do `:root { }` que o shadcn criou para:

```css
/* Dentro do :root { } criado pelo shadcn, sobrescrever: */
--primary: 192 91% 36%;           /* brand-accent #0891b2 */
--primary-foreground: 0 0% 100%;  /* branco sobre cyan */
--destructive: 0 72% 51%;         /* state-critical #dc2626 */
--ring: 192 91% 36%;              /* brand-accent para focus rings */
```

**Não apagar** as outras variáveis do shadcn (`--background`, `--foreground`, `--card`, etc.) — apenas sobrescrever as 4 acima.

- [ ] **Step 3: Verificar components.json criado**

```bash
cat components.json
```

Saída esperada: JSON com `style: "default"`, `tailwind.baseColor: "slate"`, `rsc: true`, `tsx: true`.

- [ ] **Step 4: Verificar build com shadcn configurado**

```bash
npm run build
```

Saída esperada: build bem-sucedido. Se houver erro de `border-border` undefined, confirmar que shadcn adicionou `--border` nas variáveis CSS.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: configurar Tailwind com design system NR-1 e inicializar shadcn/ui"
```

---

## Task 5: Criar tipos compartilhados da camada de IA

**Files:**
- Create: `lib/ai/types/ai-types.ts`

- [ ] **Step 1: Criar arquivo de tipos**

Criar `lib/ai/types/ai-types.ts`:

```typescript
export interface ClassificationResult {
  tipo_documento: string;
  setor_sugerido: string | null;
  tags: string[];
  risco_relacionado: string | null;
  nr_aplicavel: string[];
  confianca: 'alta' | 'media' | 'baixa';
  justificativa: string;
}

export type AgentType = 'classifier' | 'assistant';

export interface AILogEntry {
  user_id: string;
  agent_type: AgentType;
  model: string;
  tokens_input: number;
  tokens_output: number;
  cost_usd_estimated: number;
  latency_ms: number;
  success: boolean;
  error_message?: string;
  input_hash?: string;
}

export type ClassificationStatus = 'pendente' | 'aceita' | 'editada' | 'rejeitada';

export interface ClassificationFeedback {
  status: ClassificationStatus;
  edicao_humana?: Partial<ClassificationResult>;
  confirmada_por: string;
  confirmada_em: string;
}
```

---

## Task 6: Criar utilitários da camada de IA

**Files:**
- Create: `lib/ai/utils/anonymizer.ts`
- Create: `lib/ai/utils/cost-tracker.ts`
- Create: `lib/ai/utils/retry.ts`
- Create: `lib/ai/utils/logger.ts`

- [ ] **Step 1: Criar anonymizer.ts**

Criar `lib/ai/utils/anonymizer.ts`:

```typescript
const CPF_REGEX = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}/g;
const RG_REGEX = /\d{1,2}\.?\d{3}\.?\d{3}-?[0-9Xx]/g;
const BIRTH_DATE_REGEX = /\b(\d{2})\/(\d{2})\/(\d{4})\b/g;

export function anonymize(text: string): string {
  return text
    .replace(CPF_REGEX, '[CPF]')
    .replace(EMAIL_REGEX, '[EMAIL]')
    .replace(PHONE_REGEX, '[TELEFONE]')
    .replace(RG_REGEX, '[RG]')
    .replace(BIRTH_DATE_REGEX, 'XX/XX/$3');
}
```

- [ ] **Step 2: Criar cost-tracker.ts**

Criar `lib/ai/utils/cost-tracker.ts`:

```typescript
const PRICE_PER_1K_INPUT_USD: Record<string, number> = {
  'claude-haiku-4-5-20251001': 0.00025,
  'claude-sonnet-4-6':         0.003,
};

const PRICE_PER_1K_OUTPUT_USD: Record<string, number> = {
  'claude-haiku-4-5-20251001': 0.00125,
  'claude-sonnet-4-6':         0.015,
};

export function estimateCostUSD(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const inputRate = PRICE_PER_1K_INPUT_USD[model] ?? 0;
  const outputRate = PRICE_PER_1K_OUTPUT_USD[model] ?? 0;
  return (inputTokens / 1000) * inputRate + (outputTokens / 1000) * outputRate;
}
```

- [ ] **Step 3: Criar retry.ts**

Criar `lib/ai/utils/retry.ts`:

```typescript
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, initialDelayMs = 1000 } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLast = attempt >= maxAttempts;
      const status = (error as { status?: number }).status;
      const isRetryable = status !== undefined && RETRYABLE_STATUS_CODES.has(status);

      if (isLast || !isRetryable) throw error;

      const delayMs = initialDelayMs * Math.pow(3, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('Max retry attempts reached');
}
```

- [ ] **Step 4: Criar logger.ts**

Criar `lib/ai/utils/logger.ts`:

```typescript
import type { AILogEntry } from '../types/ai-types';

export async function logAICall(_entry: AILogEntry): Promise<void> {
  // Implementação em Semana 1 após configuração do Supabase.
  // Grava em tabela ai_logs com retenção e controle de custo.
  if (process.env.NODE_ENV === 'development') {
    console.log('[AI Log]', {
      agent: _entry.agent_type,
      model: _entry.model,
      tokens: _entry.tokens_input + _entry.tokens_output,
      cost: `$${_entry.cost_usd_estimated.toFixed(6)}`,
      latency: `${_entry.latency_ms}ms`,
      success: _entry.success,
    });
  }
}
```

---

## Task 7: Criar cliente Anthropic e placeholders de agentes

**Files:**
- Create: `lib/ai/clients/anthropic.ts`
- Create: `lib/ai/agents/classifier.ts`
- Create: `lib/ai/agents/assistant.ts`
- Create: `lib/ai/prompts/classifier.md`
- Create: `lib/ai/prompts/assistant.md`

- [ ] **Step 1: Instalar SDK da Anthropic**

```bash
npm install @anthropic-ai/sdk
```

Saída esperada: `added 1 package` (ou similar).

- [ ] **Step 2: Criar anthropic.ts (singleton configurado)**

Criar `lib/ai/clients/anthropic.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';

export const MODELS = {
  classifier: 'claude-haiku-4-5-20251001',
  assistant:  'claude-sonnet-4-6',
} as const;

export type ModelKey = keyof typeof MODELS;

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY não configurada. Verifique .env.local');
}

export const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 60_000,
  maxRetries: 0, // retry gerenciado por lib/ai/utils/retry.ts
});
```

- [ ] **Step 3: Criar classifier.ts (placeholder)**

Criar `lib/ai/agents/classifier.ts`:

```typescript
import type { ClassificationResult } from '../types/ai-types';

// Implementação completa na Semana 3.
// Pipeline: extração de texto → anonimização → Haiku → validação JSON → UI de revisão.
export async function classifyDocument(
  _textContent: string
): Promise<ClassificationResult> {
  throw new Error('Classificador não implementado ainda. Implementar na Semana 3.');
}
```

- [ ] **Step 4: Criar assistant.ts (placeholder)**

Criar `lib/ai/agents/assistant.ts`:

```typescript
// Implementação básica na Semana 4.
// Chat com prompt fixo, sem RAG. RAG completo fica para Fase 2.
export async function chat(
  _messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  _userProfile: 'rh_operacional' | 'gestor' | 'responsavel_tecnico'
): Promise<AsyncIterable<string>> {
  throw new Error('Agente de Atendimento não implementado ainda. Implementar na Semana 4.');
}
```

- [ ] **Step 5: Criar prompts placeholder**

Criar `lib/ai/prompts/classifier.md`:

```markdown
# Prompt do Agente Classificador — v0.1 (placeholder)

> Versão de produção implementada na Semana 3.
> Cada mudança de prompt gera nova versão e passa por bateria de 20 testes.

## Estrutura planejada

Você é um classificador de documentos de Segurança e Saúde no Trabalho (SST)
em conformidade com a NR-1 brasileira.

ENTRADA: texto extraído de um documento (máx. 8.000 tokens).

TAREFA: classificar o documento e retornar JSON estritamente no schema fornecido.

REGRAS:
- Use APENAS as categorias listadas abaixo
- Se não tiver certeza, marque confianca: "baixa"
- Nunca invente NRs que não existem
- Se o texto não parecer SST, retorne tipo_documento: "outro"

CATEGORIAS DE TIPO_DOCUMENTO:
- ASO (Atestado de Saúde Ocupacional)
- Ficha de Entrega de EPI
- Ata de CIPA
- Laudo Ergonômico
- Laudo de Insalubridade
- Laudo de Periculosidade
- PGR (Programa de Gerenciamento de Riscos)
- PCMSO (Programa de Controle Médico)
- Certificado de Treinamento
- Comunicação de Acidente de Trabalho (CAT)
- Procedimento Operacional
- Outro

[Schema JSON e conteúdo do documento serão injetados em runtime]
```

Criar `lib/ai/prompts/assistant.md`:

```markdown
# Prompt do Agente de Atendimento Interno — v0.1 (placeholder)

> Versão de produção implementada na Semana 4.

## Estrutura planejada

Você é o assistente interno da Plataforma de Conformidade NR-1 do {nome_cliente}.

SEU PAPEL:
- Ajudar usuários do RH e gestores a usar a plataforma
- Explicar conceitos básicos de NR-1
- Indicar onde encontrar informações no sistema

REGRAS RÍGIDAS:
- NUNCA invente respostas. Se não souber, diga claramente.
- NUNCA dê parecer técnico de SST (riscos específicos, cálculos, medidas).
- NUNCA dê parecer jurídico ou médico.
- SEMPRE recuse perguntas fora do escopo com a fórmula padrão.

RECUSA PADRÃO:
"Essa pergunta envolve [parecer técnico / decisão legal / etc.] e precisa ser
respondida pelo profissional habilitado responsável pelo PGR da empresa."

[Contexto do usuário e histórico de conversa serão injetados em runtime]
```

- [ ] **Step 6: Verificar TypeScript compila sem erros**

```bash
npx tsc --noEmit
```

Saída esperada: sem erros. Se houver erro em `anthropic.ts` sobre `ANTHROPIC_API_KEY` undefined no build time, adicionar `// @ts-expect-error` ou ajustar para checagem apenas em runtime.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: estrutura da camada de IA — cliente Anthropic, tipos, utilitários e placeholders"
```

---

## Task 8: Criar estrutura de pastas de componentes

**Files:**
- Create: `components/layout/.gitkeep`
- Create: `components/forms/.gitkeep`
- Create: `components/tables/.gitkeep`
- Create: `components/domain/.gitkeep`
- Create: `components/ai/.gitkeep`

- [ ] **Step 1: Criar pastas de componentes**

```bash
mkdir -p components/layout components/forms components/tables components/domain components/ai
touch components/layout/.gitkeep
touch components/forms/.gitkeep
touch components/tables/.gitkeep
touch components/domain/.gitkeep
touch components/ai/.gitkeep
```

Nota: `components/ui/` será criada pelo shadcn/ui quando instalarmos os primeiros componentes (próxima sessão).

- [ ] **Step 2: Verificar estrutura final de pastas**

```bash
find . -type d -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./.next/*" | sort
```

Saída esperada incluir ao menos:
```
./app
./components/ai
./components/domain
./components/forms
./components/layout
./components/tables
./lib/ai/agents
./lib/ai/clients
./lib/ai/prompts
./lib/ai/types
./lib/ai/utils
./public
```

---

## Task 9: Criar .env.example

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Criar .env.example**

Criar `.env.example`:

```bash
# ─────────────────────────────────────────
# Plataforma NR-1 — Variáveis de Ambiente
# Copie para .env.local e preencha os valores
# NUNCA commitar .env.local no git
# ─────────────────────────────────────────

# ── Supabase ──────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ── Anthropic ─────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...
# Limite de custo mensal em USD (default: 50)
AI_COST_LIMIT_MONTHLY_USD=50
# Alerta quando atingir X% do limite (default: 80)
AI_COST_ALERT_THRESHOLD_PCT=80

# ── Resend (email transacional) ───────────
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@seudominio.com.br

# ── Sentry (monitoramento de erros) ───────
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=sua-org
SENTRY_PROJECT=nr1-plataforma

# ── PostHog (analytics de produto) ────────
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# ── Aplicação ─────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

- [ ] **Step 2: Verificar que .gitignore cobre .env.local**

```bash
grep -E "^\.env" .gitignore
```

Saída esperada incluir: `.env*.local` ou `.env.local`.

---

## Task 10: Criar README.md

**Files:**
- Create: `README.md`

- [ ] **Step 1: Criar README.md**

Criar `README.md`:

```markdown
# Plataforma de Conformidade NR-1

Sistema web para gestão da conformidade com a NR-1 (Portaria MTE 1.419/2024),
com agentes de IA para classificação de documentos e atendimento interno.

**Cliente:** [a preencher]  
**Versão:** MVP 1.0 (30 dias)  
**Stack:** Next.js 14 + Supabase + Vercel + Anthropic Claude API

---

## Setup

### Pré-requisitos

- Node.js 18+
- npm 10+
- Conta Supabase (projeto criado)
- Chave Anthropic API

### Instalação

```bash
npm install
cp .env.example .env.local
# Preencher .env.local com os valores reais
npm run dev
```

### Variáveis de ambiente

Ver `.env.example` para lista completa. Variáveis obrigatórias para funcionar:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento em `localhost:3000` |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção (após build) |
| `npm run lint` | Verificar ESLint |
| `npx tsc --noEmit` | Verificar TypeScript |

---

## Estrutura de Pastas

```
app/                    # Next.js App Router (páginas e layouts)
components/
  ui/                   # shadcn/ui (gerado pela CLI)
  layout/               # AppShell, Sidebar, Topbar
  forms/                # Campos especializados (RiskMatrixInput, etc.)
  tables/               # DataTable customizada
  domain/               # Componentes de negócio (RiskCard, ActionCard, etc.)
  ai/                   # Componentes da camada de IA (ClassificationCard, ChatWidget)
lib/
  ai/
    clients/            # Cliente Anthropic configurado
    agents/             # Lógica dos agentes (Classificador, Atendimento)
    prompts/            # Prompts versionados em .md
    utils/              # Anonimizador, logger, cost-tracker, retry
    types/              # Tipos TypeScript compartilhados
public/                 # Assets estáticos
docs/                   # Documentação do projeto
  Escopo-NR1.md
  PRD-NR1-MVP-30dias.md
  PRD-Agentes-NR1.md
  DesignSystem-NR1.md
  Escopo-Agentes-NR1.md
```

---

## Módulos (MVP 30 dias)

| Módulo | Estado |
|--------|--------|
| 1. Repositório de Documentos | Simplificado |
| 2. Inventário de Riscos | **Completo** |
| 3. Plano de Ação | **Completo** |
| 4. Riscos Psicossociais | Básico |
| 5. Workflow de Aprovações | Simplificado |
| 6. Trilha de Auditoria | Mínima |
| 7. Dashboard de Conformidade | Simples |
| 8. Geração do PGR (PDF) | **Completo** |
| 9. Agente Classificador | **Completo** |
| 9. Agente de Atendimento | Básico |

---

## Agentes de IA

| Agente | Modelo | Estado MVP |
|--------|--------|-----------|
| Classificador | Claude Haiku 4.5 | Completo |
| Atendimento Interno | Claude Sonnet 4.6 | Básico (sem RAG) |

---

## Cronograma

| Semana | Foco |
|--------|------|
| 1 | Setup, modelagem de dados, auth, layout base |
| 2 | Inventário de Riscos, cadastros, repositório |
| 3 | Plano de Ação, Agente Classificador, dashboard |
| 4 | PGR em PDF, Psicossociais, Atendimento, deploy |

---

## Conformidade e Segurança

- **LGPD:** dados de saúde mental são dados sensíveis (Art. 5º, II)
- **Anonimização:** CPF, email, telefone removidos antes de enviar à Anthropic API
- **Retenção:** logs de auditoria por 20 anos (exigência regulatória)
- **RLS:** Row Level Security ativo em todas as tabelas Supabase

---

## Próximos Passos (Fase 2)

- Agente de Atendimento com RAG completo da base do cliente
- Workflow de aprovação automatizado
- Assinatura digital ICP-Brasil
- Integração eSocial (S-2240, S-2220)
- App mobile para gestores

---

*Plataforma de conformidade. Não substitui responsabilidade legal do empregador nem do profissional habilitado.*
```

---

## Task 11: Commit final e organizar documentação

**Files:**
- Modify: `.gitignore` (se necessário)

- [ ] **Step 1: Mover arquivos de documentação para docs/**

```bash
mkdir -p docs
mv Escopo-NR1.md docs/
mv Escopo-Agentes-NR1.md docs/
mv PRD-NR1-MVP-30dias.md docs/
mv PRD-Agentes-NR1.md docs/
mv DesignSystem-NR1.md docs/
```

- [ ] **Step 2: Commit final**

```bash
git add .
git commit -m "feat: setup completo — .env.example, README, docs organizados, estrutura de componentes"
```

- [ ] **Step 3: Verificar estado final do repositório**

```bash
git log --oneline
```

Saída esperada (4 commits):
```
[hash] feat: setup completo — .env.example, README, docs organizados
[hash] feat: estrutura da camada de IA — cliente Anthropic, tipos, utilitários
[hash] feat: configurar Tailwind com design system NR-1 e inicializar shadcn/ui
[hash] feat: scaffold Next.js 14 com TypeScript, Tailwind e ESLint
```

---

## Self-Review

### Cobertura do spec

- [x] Next.js 14 com App Router e TypeScript — Task 1
- [x] Tailwind CSS com variáveis CSS do DesignSystem — Tasks 2 e 3
- [x] shadcn/ui inicializado com tema customizado — Task 4
- [x] Estrutura de pastas conforme PRD-Agentes section 2.2 — Tasks 5, 6, 7
- [x] Estrutura de componentes conforme DesignSystem section 7.4 — Task 8
- [x] .env.example com todas as variáveis — Task 9 (Supabase, Anthropic, Resend, Sentry, PostHog)
- [x] README.md inicial — Task 10

### Placeholders
- `classifier.ts` e `assistant.ts` são placeholders explícitos com mensagem clara — correto, implementação prevista para Semanas 3 e 4
- `logger.ts` tem implementação parcial (apenas console.log em dev) — correto, implementação completa aguarda Supabase
- Prompts `.md` são skeletons com estrutura documentada — correto

### Consistência de tipos
- `AILogEntry` definido em `ai-types.ts` → usado em `logger.ts` ✓
- `ClassificationResult` definido em `ai-types.ts` → retornado por `classifier.ts` ✓
- `MODELS` exportado de `anthropic.ts` → referenciado em `cost-tracker.ts` via string ✓
- `RetryOptions` definido e exportado em `retry.ts` ✓
