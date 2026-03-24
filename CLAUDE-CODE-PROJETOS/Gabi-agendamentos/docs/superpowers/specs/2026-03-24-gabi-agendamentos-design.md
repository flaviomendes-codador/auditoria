# Gabi Agendamentos — PRD & Design Spec

> Produto de automacao de agenda e confirmacao de pacientes via WhatsApp para terapeuta radiestesista.

---

## 1. Visao Geral

### 1.1 Problema

Gabi e terapeuta radiestesista, atende sozinha, controla tudo pelo celular. Hoje ela usa agenda de papel e WhatsApp para:

- Agendar sessoes com pacientes
- Confirmar cada paciente um a um no dia anterior
- Fazer follow-up quando nao respondem
- Atender por videochamada no proprio WhatsApp

Com 6-10 pacientes/dia (picos acima de 10), o processo manual de confirmacao consome tempo e energia que poderiam ir para o atendimento.

### 1.2 Solucao

Webapp mobile-first que automatiza o ciclo de confirmacao de sessoes via WhatsApp Business API, gerencia a agenda e da visibilidade do dia a dia num painel simples.

### 1.3 Publico-Alvo

Terapeuta solo (Gabi) — sem recepcionista, sem equipe. Controla tudo pelo celular. Nao e tecnica, precisa de algo simples que funcione.

### 1.4 Metricas de Sucesso

| Metrica | Antes | Meta |
|---------|-------|------|
| Tempo gasto confirmando pacientes | ~30-45 min/dia | ~0 min (automatico) |
| Taxa de confirmacao | ~70% (esquece de cobrar) | ~95% (follow-up automatico) |
| No-shows (nao compareceu) | ~15% | <5% |
| Pacientes sem resposta no dia | ~3-4 | Alerta automatico |

---

## 2. Stack Tecnica

| Componente | Tecnologia | Justificativa |
|-----------|-----------|---------------|
| Frontend | Next.js (App Router) | SSR, mobile-first, API routes integradas |
| Banco de dados | Supabase (PostgreSQL) | Free tier, auth, realtime, RLS |
| Automacao | N8N (self-hosted ou cloud) | Fluxos visuais, cron, webhooks |
| Mensageria | WhatsApp Cloud API (Meta) | API oficial, 1000 msgs/mes gratis, sem risco de bloqueio |
| Hospedagem | Vercel (frontend) | Deploy automatico, edge functions |
| Estilo | Tailwind CSS | Utility-first, rapido, responsivo |

---

## 3. Arquitetura

```
GABI (Webapp Mobile-First)
        |
        | gerencia agenda, ve painel, configura mensagens
        |
  +-----------+        +------------+
  | Next.js   | -----> | Supabase   |
  | Front +   |        | DB + Auth  |
  | API Routes|        | + Realtime |
  +-----------+        +------------+
                             |
                    webhooks + triggers
                             |
                       +-----------+
                       |   N8N     |
                       | Automacao |
                       +-----------+
                        /         \
                  envia msgs    recebe respostas
                      /             \
              +-------------------------+
              | WhatsApp Cloud API      |
              | (Meta Business Platform)|
              +-------------------------+
                         |
                         v
                   PACIENTES DA GABI
                   (WhatsApp normal)
```

---

## 4. Fluxo Principal — Confirmacao Automatica

### 4.1 Fluxo Feliz

1. **CRON** (todo dia no horario configurado, ex: 18h)
   - N8N busca no Supabase todos os agendamentos do dia seguinte com status `pending`

2. **ENVIO**
   - Para cada paciente, envia mensagem via WhatsApp Cloud API:
   - Template: "Ola, {nome}! Gostaria de confirmar sua sessao amanha, {dia_semana}, as {hora}. Posso confirmar? 🍃 ✨"

3. **RESPOSTA — 3 caminhos:**
   - **Confirma** (palavras-chave: "confirmo", "sim", "pode", "ok", "confirmado") → Status = `confirmed`, Gabi ve no painel
   - **Cancela** (palavras-chave: "nao vou", "cancela", "nao posso") → Status = `cancelled`, horario liberado
   - **Pede remarcacao** (palavras-chave: "trocar", "mudar", "remarcar", "outro horario") → Status = `rescheduling`, Gabi recebe notificacao para resolver manualmente

4. **FOLLOW-UP** (sem resposta apos X horas configuravel, padrao: 3h)
   - N8N envia follow-up automatico:
   - Template: "Oi, {nome}! Vi que ainda nao confirmou a sessao de amanha as {hora}. Consegue me confirmar? 🍃 ✨"

5. **SILENCIO PERSISTENTE** (sem resposta apos follow-up)
   - Gabi recebe alerta no app para decidir manualmente
   - Status permanece `pending` com flag `alert: true`

### 4.2 Lembrete do Dia

- No dia da sessao (horario configuravel, ex: 7h), N8N envia lembrete:
- Template: "Bom dia, {nome}! Lembrete: sua sessao e hoje as {hora}. Te espero! 🍃 ✨"
- Apenas para agendamentos com status `confirmed`

### 4.3 Cancelamento Confirmado

- Quando paciente cancela, sistema envia automaticamente:
- Template: "Oi, {nome}! Sua sessao de {dia_semana} as {hora} foi cancelada. Quando quiser reagendar, e so me chamar! 🍃 ✨"

---

## 5. Modelo de Dados (Supabase / PostgreSQL)

### 5.1 Tabela `patients`

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid (PK) | Identificador unico |
| name | text | Nome completo do paciente |
| phone | text | WhatsApp com DDI (+5511...) |
| default_weekday | int | Dia fixo da semana (0=dom, 1=seg...) |
| default_time | time | Horario fixo da sessao |
| notes | text | Notas privadas da Gabi |
| active | bool | Paciente ativo ou inativo |
| created_at | timestamptz | Data de cadastro |

### 5.2 Tabela `appointments`

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid (PK) | Identificador unico |
| patient_id | uuid (FK → patients) | Referencia ao paciente |
| date | date | Data da sessao |
| time | time | Horario da sessao |
| duration_min | int | Duracao em minutos (padrao: 60) |
| status | enum | `pending`, `confirmed`, `cancelled`, `rescheduling`, `no_show` |
| confirmation_sent | bool | Mensagem de confirmacao ja enviada |
| confirmation_sent_at | timestamptz | Quando a confirmacao foi enviada (usado pelo fluxo de follow-up) |
| followup_sent | bool | Follow-up ja enviado |
| followup_sent_at | timestamptz | Quando o follow-up foi enviado (usado pelo fluxo de alerta) |
| alert | bool | Gabi precisa intervir manualmente |
| created_at | timestamptz | Data de criacao |

### 5.3 Tabela `messages`

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid (PK) | Identificador unico |
| appointment_id | uuid (FK → appointments) | Sessao relacionada |
| patient_id | uuid (FK → patients) | Paciente da mensagem |
| direction | enum | `outbound` (enviada), `inbound` (recebida) |
| type | enum | `confirmation`, `followup`, `reminder`, `reply`, `cancellation`, `manual` |
| content | text | Conteudo da mensagem |
| wapi_status | enum | `sent`, `delivered`, `read`, `failed` |
| wapi_message_id | text | ID da mensagem na API do WhatsApp |
| sent_at | timestamptz | Quando foi enviada/recebida |

### 5.4 Tabela `message_templates`

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid (PK) | Identificador unico |
| type | enum | `confirmation`, `followup`, `reminder`, `cancellation` |
| content | text | Texto com variaveis {nome}, {hora}, {data}, {dia_semana} |
| active | bool | Template ativo |
| updated_at | timestamptz | Ultima edicao |

### 5.5 Tabela `settings`

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid (PK) | Identificador unico (singleton) |
| confirmation_time | time | Hora do envio automatico (ex: 18:00) |
| followup_delay_hours | int | Horas ate follow-up (ex: 3) |
| reminder_time | time | Hora do lembrete no dia (ex: 07:00) |
| default_duration_min | int | Duracao padrao da sessao |
| break_between_min | int | Intervalo minimo entre sessoes |
| working_hours | jsonb | Dias e horarios de atendimento |
| whatsapp_phone_id | text | Phone ID da Meta Cloud API |
| whatsapp_token | text | Token de acesso (encriptado) |

### 5.6 Relacionamentos

```
patients ──── 1:N ────▸ appointments
appointments ──── 1:N ────▸ messages
patients ──── 1:N ────▸ messages
message_templates ──── usado por N8N ao enviar
settings ──── singleton (1 registro)
```

### 5.7 Coluna `user_id`

Todas as tabelas (exceto `settings`) incluem uma coluna `user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid()` que e preenchida automaticamente. A tabela `settings` usa `id` como referencia direta ao `auth.users(id)`.

### 5.8 RLS (Row Level Security)

- Todas as tabelas protegidas por RLS
- Apenas o usuario autenticado (Gabi) tem acesso
- Politica: `auth.uid() = user_id` em todas as tabelas com `user_id`
- Politica em `settings`: `auth.uid() = id`
- Como e sistema single-user, uma alternativa simplificada e `auth.uid() IS NOT NULL`

---

## 6. Telas do Webapp

### 6.1 Painel (Dashboard) — Tela Principal

**Objetivo:** Gabi abre e ve tudo do dia de uma vez.

**Elementos:**
- Saudacao: "Bom dia, Gabi 🍃 ✨"
- Data do dia
- Barra decorativa gradiente dos 7 chakras
- 3 cards de resumo: Confirmados (verde), Pendentes (amarelo), Cancelados (vermelho)
- Lista cronologica de sessoes do dia com:
  - Indicador de cor por status (barra lateral)
  - Horario
  - Nome do paciente
  - Descricao breve (ex: "Sessao semanal", "Primeira sessao")
  - Badge de status
- Navegacao inferior com 5 itens: Painel, Agenda, Pacientes, Mensagens, Ajustes

### 6.2 Agenda

**Objetivo:** Visao semanal/mensal, criar e gerenciar agendamentos.

**Elementos:**
- Alternador de visao: Dia / Semana / Mes
- Navegacao temporal (anterior/proximo)
- Grid de horarios com sessoes posicionadas
- Cores por status dos chakras
- Criar agendamento ao tocar no horario vazio
- Bloquear dias/horarios (folga, feriado)
- Numero de sessoes por dia visivel na visao mensal

### 6.3 Pacientes

**Objetivo:** Cadastro e historico dos pacientes.

**Elementos:**
- Campo de busca
- Lista de pacientes com avatar (iniciais), nome, dia/horario fixo, total de sessoes
- Ao tocar num paciente, abre a ficha:
  - Nome, telefone (WhatsApp)
  - Dia e horario fixo da sessao
  - Notas privadas da Gabi
  - Historico de presenca (ultimas sessoes com status)
  - Taxa de confirmacao (%)
  - Botao para enviar mensagem manual

### 6.4 Mensagens

**Objetivo:** Ver historico de conversas e editar templates.

**Elementos:**
- Duas abas: "Conversas" e "Templates"
- **Conversas:** lista de mensagens recentes por paciente, com bolhas estilo WhatsApp (outbound em violeta, inbound em cinza claro, confirmacao em verde)
- **Templates:** cards editaveis para cada tipo de mensagem (confirmacao, follow-up, lembrete, cancelamento), com preview das variaveis

### 6.5 Ajustes (Configuracoes)

**Objetivo:** Configurar a automacao e dados do sistema.

**Elementos:**
- Horario de envio da confirmacao
- Tempo de espera para follow-up
- Horario de envio do lembrete do dia
- Duracao padrao da sessao
- Intervalo entre sessoes
- Horarios de atendimento por dia da semana
- Conexao com WhatsApp Business (Phone ID, Token)
- Secao futura (desabilitada): Modulo Financeiro

---

## 7. Design System

### 7.1 Conceito da Marca

**"Energia que organiza. Frequencia que cuida."**

O design reflete o universo da radiestesia e dos chakras. O gradiente dos 7 centros energeticos permeia a interface como fio condutor de equilibrio. Formas suaves e arredondadas transmitem acolhimento. Tudo respira, tudo flui.

**Palavras-chave:** Vibracao, Frequencia, Chakras, Equilibrio, Harmonia, Radiestesia, Energia, Acolhimento

### 7.2 Paleta de Cores — Chakras

#### Cores dos 7 Chakras

| Chakra | Cor | Hex | Uso no Sistema |
|--------|-----|-----|----------------|
| Coronario | Violeta | #9F7AEA | Cor primaria, marca, botoes, navegacao ativa |
| Frontal | Indigo | #667EEA | Gradiente primario (com coronario) |
| Laringeo | Azul | #4299E1 | Comunicacao, area de mensagens, remarcacao |
| Cardiaco | Verde | #48BB78 | Confirmacao, sucesso, cura |
| Plexo Solar | Amarelo | #ECC94B | Pendencia, aguardando resposta |
| Sacral | Laranja | #ED8936 | Acentos, alertas leves |
| Raiz | Vermelho | #E53E3E | Cancelamento, alertas criticos |

#### Cores de Status (derivadas dos chakras)

| Status | Cor de Fundo | Cor do Texto | Chakra de Origem |
|--------|-------------|-------------|-----------------|
| Confirmado | #ecfdf5 | #059669 | Cardiaco |
| Pendente | #fffbeb | #d97706 | Plexo Solar |
| Cancelado | #fef2f2 | #dc2626 | Raiz |
| Remarcacao | #f0f9ff | #0284c7 | Laringeo |
| Nao compareceu | #f5f5f5 | #6b7280 | — |

#### Neutros

| Funcao | Hex |
|--------|-----|
| Texto principal | #1D1D1F |
| Texto secundario | #6B7280 |
| Texto terciario | #86868B |
| Fundo da pagina | #F9FAFB |
| Fundo dos cards | #FFFFFF |
| Bordas | #F3F4F6 |

#### Gradientes

| Nome | Valor | Uso |
|------|-------|-----|
| Chakra Completo | linear-gradient(90deg, #E53E3E, #ED8936, #ECC94B, #48BB78, #4299E1, #667EEA, #9F7AEA) | Barras decorativas, loading, separadores |
| Violeta Profundo | linear-gradient(135deg, #9F7AEA, #667EEA) | Botoes primarios, header |
| Verde Cura | linear-gradient(135deg, #48BB78, #38A169) | Mensagem de confirmacao |
| Azul Comunicacao | linear-gradient(135deg, #667EEA, #4299E1) | Area de mensagens |

### 7.3 Tipografia

**Fonte:** Inter (Google Fonts)

| Nivel | Tamanho | Peso | Uso |
|-------|---------|------|-----|
| Titulo de pagina | 2rem (32px) | Bold 700 | "Bom dia, Gabi" |
| Titulo de secao | 1.25rem (20px) | Semibold 600 | "Agenda de hoje" |
| Corpo destaque | 1rem (16px) | Medium 500 | Nomes, horarios |
| Corpo texto | 0.9rem (14.4px) | Regular 400 | Descricoes, subtextos |
| Label / Caption | 0.78rem (12.5px) | Semibold 600 | Status, categorias (uppercase) |

**Principios:**
- Letter-spacing negativo em titulos (-0.02em a -0.03em) para estilo Apple
- Line-height confortavel (1.5 a 1.7)
- Cor de texto principal #1D1D1F, secundario #6B7280

### 7.4 Emojis

**OBRIGATORIO:** Todos os emojis no app e na web devem renderizar no estilo iOS (Apple Color Emoji).

**Implementacao:**
- CSS: `font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;` para elementos com emoji
- Alternativa: usar biblioteca Twemoji (Twitter/X) que renderiza emojis estilo Apple em todas as plataformas
- Emojis da marca Gabi: 🍃 ✨ (presentes em todas as mensagens)

**Emojis do sistema:**
- 📊 Painel
- 📅 Agenda
- 👤 Pacientes
- 💬 Mensagens
- ⚙️ Ajustes
- ✅ Confirmado
- ⏳ Pendente
- ❌ Cancelado
- 🔄 Remarcar
- 🔔 Alerta

### 7.5 Espacamento

| Token | Valor | Uso |
|-------|-------|-----|
| xs | 4px | Espacamento minimo entre elementos inline |
| sm | 8px | Gap entre badges, itens pequenos |
| md | 16px | Padding interno de cards, gap de listas |
| lg | 24px | Padding de secoes, margem entre blocos |
| xl | 32px | Separacao entre secoes |
| 2xl | 48px | Margem de pagina, separacao maior |

### 7.6 Bordas Arredondadas

| Token | Valor | Uso |
|-------|-------|-----|
| sm | 8px | Elementos pequenos, tags |
| md | 14px | Botoes, inputs, cards menores |
| lg | 20px | Cards principais, modais |
| full | 100px | Badges de status, avatares, pills |

### 7.7 Sombras

| Nivel | Valor | Uso |
|-------|-------|-----|
| Sutil | 0 1px 2px rgba(0,0,0,0.03) | Cards de sessao |
| Leve | 0 2px 8px rgba(0,0,0,0.04) | Cards de destaque |
| Media | 0 4px 24px rgba(0,0,0,0.06) | Modais, phone frame |

### 7.8 Componentes

#### Botoes

- **Primario:** Gradiente violeta (coronario + frontal), texto branco, sombra violeta, border-radius 14px
- **Secundario:** Fundo branco, borda lavanda, texto violeta
- **Ghost:** Sem fundo, sem borda, texto cinza

#### Badges de Status

- Pill com border-radius 100px
- Dot colorido (7px) + texto em caps
- Cores conforme tabela de status

#### Card de Sessao

- Fundo branco, border-radius 14px, borda #f3f4f6
- Indicador lateral colorido (4px) por status
- Horario em violeta, nome em preto, subtexto em cinza
- Badge de status alinhado a direita

#### Bolhas de Mensagem

- Outbound: gradiente violeta (coronario), texto branco, radius 18px com canto inferior direito 6px
- Inbound: fundo #f3f4f6, texto preto, radius 18px com canto inferior esquerdo 6px
- Confirmacao: gradiente verde (cardiaco), texto branco

#### Navegacao Inferior (Mobile)

- 5 itens: Painel, Agenda, Pacientes, Mensagens, Ajustes
- Emoji como icone + label
- Ativo: cor violeta (coronario)
- Inativo: cor cinza #c4c4c8

#### Inputs

- Fundo branco, borda #e5e7eb, border-radius 14px
- Padding 14px 16px
- Focus: borda lavanda + box-shadow violeta sutil
- Label acima: 0.78rem, semibold, cinza

---

## 8. Fluxos N8N

### 8.1 Fluxo de Confirmacao (Cron Diario)

```
[Cron Trigger: todo dia as {confirmation_time}]
  → [Supabase: buscar appointments WHERE date = amanha AND status = pending AND confirmation_sent = false]
  → [Loop: para cada agendamento]
    → [Supabase: buscar patient pelo patient_id]
    → [Supabase: buscar template tipo 'confirmation']
    → [Montar mensagem: substituir {nome}, {hora}, {dia_semana}]
    → [WhatsApp Cloud API: enviar mensagem]
    → [Supabase: atualizar appointment.confirmation_sent = true]
    → [Supabase: inserir registro na tabela messages]
```

### 8.2 Fluxo de Follow-up

```
[Cron Trigger: a cada 30 minutos]
  → [Supabase: buscar appointments WHERE date = amanha AND status = pending AND confirmation_sent = true AND followup_sent = false AND (agora - confirmation_sent_at) > {followup_delay_hours}]
  → [Loop: para cada agendamento]
    → [Supabase: buscar template tipo 'followup']
    → [Montar e enviar mensagem]
    → [Supabase: atualizar appointment.followup_sent = true]
    → [Supabase: inserir registro na tabela messages]
```

### 8.3 Fluxo de Lembrete do Dia

```
[Cron Trigger: todo dia as {reminder_time}]
  → [Supabase: buscar appointments WHERE date = hoje AND status = confirmed]
  → [Loop: para cada agendamento]
    → [Supabase: buscar template tipo 'reminder']
    → [Montar e enviar mensagem]
    → [Supabase: inserir registro na tabela messages]
```

### 8.4 Webhook de Respostas (Inbound)

```
[Webhook: recebe mensagem do WhatsApp Cloud API]
  → [Identificar paciente pelo numero de telefone]
  → [Buscar agendamento pendente mais proximo desse paciente]
  → [Classificar resposta por palavras-chave:]
    → confirma/sim/ok/pode → atualizar status = confirmed
    → cancela/nao vou/nao posso → atualizar status = cancelled, enviar template cancellation
    → trocar/remarcar/outro horario → atualizar status = rescheduling, alertar Gabi
    → nao identificado → manter status, alertar Gabi
    → mensagem nao-texto (audio, imagem, video, sticker) → tratar como "nao identificado", alertar Gabi
  → [Supabase: inserir registro na tabela messages (direction: inbound)]
  → [Se confirmou: enviar mensagem de confirmacao verde]
```

> **Nota:** Mensagens de audio, imagem ou video nao sao interpretadas no MVP. O sistema registra a mensagem e alerta a Gabi para resolver manualmente. IA conversacional pode ser adicionada no futuro para interpretar respostas ambiguas.

### 8.5 Fluxo de Alerta (Silencio Persistente)

```
[Cron Trigger: a cada 1 hora]
  → [Supabase: buscar appointments WHERE date = amanha AND status = pending AND followup_sent = true AND alert = false AND (agora - followup_sent_at) > 3h]
  → [Loop: para cada agendamento]
    → [Supabase: atualizar appointment.alert = true]
    → [Notificar Gabi no app (Supabase Realtime)]
```

---

## 9. Integracao WhatsApp Cloud API

### 9.1 Pre-requisitos

- Conta Meta Business verificada
- App no Meta Developers
- Numero de telefone WhatsApp Business registrado
- Templates de mensagem aprovados pela Meta

### 9.2 Templates Meta (precisam aprovacao)

| Nome do Template | Categoria | Texto |
|-----------------|-----------|-------|
| confirmacao_sessao | UTILITY | "Ola, {{1}}! Gostaria de confirmar sua sessao amanha, {{2}}, as {{3}}. Posso confirmar? 🍃 ✨" |
| followup_sessao | UTILITY | "Oi, {{1}}! Vi que ainda nao confirmou a sessao de amanha as {{2}}. Consegue me confirmar? 🍃 ✨" |
| lembrete_sessao | UTILITY | "Bom dia, {{1}}! Lembrete: sua sessao e hoje as {{2}}. Te espero! 🍃 ✨" |
| cancelamento_sessao | UTILITY | "Oi, {{1}}! Sua sessao de {{2}} as {{3}} foi cancelada. Quando quiser reagendar, e so me chamar! 🍃 ✨" |

### 9.3 Webhook de Recebimento

- Endpoint: `POST /api/webhooks/whatsapp`
- Verificacao do webhook: `GET /api/webhooks/whatsapp?hub.verify_token=...`
- Payload processado pelo N8N ou diretamente pela API Route do Next.js

### 9.4 Limites e Custos

- 1.000 conversas de servico (utility) gratuitas por mes
- Volume da Gabi: ~300-600 msgs/mes (dentro do free tier)
- Acima disso: ~R$0,25 por conversa adicional

---

## 10. Autenticacao e Seguranca

### 10.1 Login

- Supabase Auth com Magic Link (email)
- Unica usuario: Gabi
- Sem cadastro publico — conta criada manualmente

### 10.2 Seguranca

- RLS habilitado em todas as tabelas
- Token do WhatsApp armazenado encriptado no banco
- HTTPS obrigatorio (Vercel)
- Webhook do WhatsApp validado com token de verificacao
- Rate limiting nas API routes

### 10.3 API Routes (Next.js)

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /api/patients | Listar pacientes |
| POST | /api/patients | Criar paciente |
| PATCH | /api/patients/[id] | Atualizar paciente |
| DELETE | /api/patients/[id] | Desativar paciente |
| GET | /api/appointments | Listar agendamentos (filtro por data) |
| POST | /api/appointments | Criar agendamento |
| PATCH | /api/appointments/[id] | Atualizar agendamento (status, horario) |
| DELETE | /api/appointments/[id] | Cancelar agendamento |
| GET | /api/messages | Listar mensagens (filtro por paciente/data) |
| POST | /api/messages/send | Enviar mensagem manual |
| GET | /api/templates | Listar templates |
| PATCH | /api/templates/[id] | Atualizar template |
| GET | /api/settings | Buscar configuracoes |
| PATCH | /api/settings | Atualizar configuracoes |
| POST | /api/webhooks/whatsapp | Webhook inbound do WhatsApp |
| GET | /api/webhooks/whatsapp | Verificacao do webhook (hub.verify_token) |

---

## 11. Modulo Futuro — Financeiro (Plugavel)

> NAO sera implementado no MVP. Arquitetura preparada para plugar depois.

**Funcionalidades planejadas:**
- Valor da sessao por paciente
- Controle de pagamento (pago/pendente)
- Relatorio mensal de faturamento
- Integracao com Pix (opcional)

**Tabela futura: `payments`**

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid (PK) | Identificador unico |
| appointment_id | uuid (FK) | Sessao relacionada |
| amount | decimal | Valor da sessao |
| status | enum | `pending`, `paid`, `overdue` |
| paid_at | timestamptz | Data do pagamento |

---

## 12. Fases de Implementacao

### Fase 1 — Fundacao (Semana 1)

- Setup do projeto Next.js + Tailwind + Supabase
- Modelo de dados (migrations)
- Autenticacao (Magic Link)
- Design system (tokens, componentes base)
- Layout mobile-first com navegacao

### Fase 2 — Agenda e Pacientes (Semana 2)

- CRUD de pacientes
- CRUD de agendamentos
- Tela de agenda (visao dia/semana)
- Tela de painel (dashboard)

### Fase 3 — WhatsApp e Automacao (Semana 3)

- Integracao WhatsApp Cloud API
- Fluxos N8N: confirmacao, follow-up, lembrete
- Webhook de respostas
- Classificacao de respostas por palavras-chave
- Templates de mensagem editaveis

### Fase 4 — Polimento (Semana 4)

- Tela de mensagens (historico + templates)
- Tela de ajustes
- Notificacoes em tempo real (Supabase Realtime)
- Alertas de silencio persistente
- Testes e ajustes finais
- Deploy em producao

---

## 13. Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| Templates Meta recusados | Media | Alto | Submeter templates cedo, seguir guidelines da Meta |
| Gabi nao se adaptar ao webapp | Baixa | Alto | UX ultra simples, onboarding guiado, manter WhatsApp como canal |
| Palavras-chave nao cobrem todas as respostas | Alta | Medio | Fallback: alertar Gabi para resolver manualmente |
| WhatsApp Cloud API muda precos/limites | Baixa | Medio | Volume baixo, margem grande no free tier |
| N8N instabilidade (se self-hosted) | Media | Alto | Monitoramento + fallback para N8N Cloud |

---

## 14. Decisoes de Design Importantes

1. **Singleton settings** — Uma terapeuta, sem multi-tenancy. Simplifica tudo.
2. **Emojis estilo iOS** — Apple Color Emoji ou Twemoji em todas as plataformas.
3. **Chakras funcionais** — Cada cor dos chakras tem funcao no sistema, nao e decorativo.
4. **Gradiente dos 7 chakras** — Fio condutor visual presente em barras, loading, separadores.
5. **Light mode** — Fundo claro, limpo, arejado. Sem dark mode.
6. **Tudo em portugues BR** — Interface, mensagens, labels, tudo.
7. **Mobile-first** — Celular e a ferramenta principal da Gabi.
8. **Tom da Gabi** — Profissional + 🍃 ✨ em todas as mensagens automaticas.
9. **Sem over-engineering** — 5 tabelas, 5 telas, 4 fluxos N8N. Nada mais.
10. **Modulo financeiro como extensao** — Arquitetura permite, mas nao implementa no MVP.
