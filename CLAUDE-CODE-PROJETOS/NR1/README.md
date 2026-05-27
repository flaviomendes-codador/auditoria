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

### Variáveis de ambiente obrigatórias

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role (server-side only) |
| `ANTHROPIC_API_KEY` | Chave da API Anthropic |

Ver `.env.example` para lista completa.

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento em `localhost:3000` |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção (após build) |
| `npm run lint` | Verificar ESLint |
| `npx tsc --noEmit` | Verificar tipos TypeScript |

---

## Estrutura de Pastas

```
app/                    # Next.js App Router (páginas e layouts)
components/
  ui/                   # shadcn/ui (gerado pela CLI — não editar manualmente)
  layout/               # AppShell, Sidebar, Topbar
  forms/                # Campos especializados (RiskMatrixInput, NRSelect)
  tables/               # DataTable customizada
  domain/               # Componentes de negócio (RiskCard, ActionCard, PgrStatusBanner)
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
```

---

## Módulos (MVP 30 dias)

| # | Módulo | Estado MVP |
|---|--------|-----------|
| 1 | Repositório de Documentos | Simplificado |
| 2 | Inventário de Riscos | **Completo** |
| 3 | Plano de Ação | **Completo** |
| 4 | Riscos Psicossociais | Básico |
| 5 | Workflow de Aprovações | Simplificado |
| 6 | Trilha de Auditoria | Mínima |
| 7 | Dashboard de Conformidade | Simples |
| 8 | Geração do PGR (PDF) | **Completo** |
| 9 | Agente Classificador | **Completo** |
| 9 | Agente de Atendimento | Básico |

---

## Agentes de IA

| Agente | Modelo | Estado MVP | Implementação |
|--------|--------|-----------|--------------|
| Classificador | Claude Haiku 4.5 | Completo | Semana 3 |
| Atendimento Interno | Claude Sonnet 4.6 | Básico (sem RAG) | Semana 4 |

---

## Cronograma

| Semana | Foco |
|--------|------|
| 1 | Setup, modelagem de dados, auth, layout base |
| 2 | Inventário de Riscos, cadastros, repositório |
| 3 | Plano de Ação, Agente Classificador, dashboard |
| 4 | PGR em PDF, Psicossociais, Atendimento, deploy |

---

## Design System

O design system segue o princípio **"Cor é informação, não decoração"**:

| Grupo | Uso |
|-------|-----|
| `state-*` | Estados de conformidade (success/warning/critical/info) — RESERVADAS |
| `risk-*` | Matriz de avaliação de risco (low/medium/high/critical) |
| `brand-*` | Identidade visual (primary=slate-900, accent=cyan-600) |
| `ai-*` | Conteúdo gerado por IA (violeta — sempre visível ao usuário) |

---

## Conformidade e Segurança

- **LGPD:** dados de saúde mental são dados sensíveis (Art. 5º, II)
- **Anonimização:** CPF, email, telefone, RG removidos antes de enviar à Anthropic API
- **Retenção:** logs de auditoria por 20 anos (exigência regulatória NR-1)
- **RLS:** Row Level Security ativo em todas as tabelas Supabase
- **Custo de IA:** limite configurável via `AI_COST_LIMIT_MONTHLY_USD`

---

## Roadmap Pós-MVP (Fase 2)

- Agente de Atendimento com RAG completo da base do cliente
- Workflow de aprovação automatizado com notificações
- Assinatura digital ICP-Brasil
- Integração eSocial (S-2240, S-2220)
- Dashboard com gráficos avançados
- App mobile para gestores

---

*Esta plataforma é uma ferramenta de gestão. Não substitui a responsabilidade legal do empregador nem do profissional habilitado responsável pelo PGR.*
