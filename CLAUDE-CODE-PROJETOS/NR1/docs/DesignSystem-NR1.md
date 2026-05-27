# Design System
## Plataforma de Conformidade NR-1

**Versão:** 1.0
**Data:** 26 de maio de 2026
**Stack:** Next.js + Tailwind CSS + shadcn/ui
**Filosofia:** Funcional, denso, defensável. Não é design de marketing — é ferramenta de trabalho.

---

## 1. Princípios de Design

### 1.1 Os 5 princípios

**1. Conformidade visível, sempre.**
O estado de conformidade do PGR é a informação mais importante da tela. Ele aparece sempre, em todas as telas relevantes, com clareza.

**2. Densidade > beleza.**
RH operacional vai usar 8 horas por dia. Telas otimizadas para produtividade, não para impressionar em demo. Mais informação por pixel, menos espaço em branco gratuito.

**3. Cor é informação, não decoração.**
Verde, amarelo e vermelho têm significado fixo (ok / atenção / crítico). Não usar essas cores por estética.

**4. Dois perfis, duas experiências.**
RH operacional vê interface densa, com muitos campos e atalhos. Gestor vê interface limpa, mobile-friendly, com poucas ações disponíveis.

**5. IA é transparente.**
Toda saída gerada por IA aparece marcada (badge, ícone, cor de borda). Usuário sempre sabe quando está olhando para algo gerado pela IA vs. inserido por humano.

---

## 2. Identidade Visual

### 2.1 Paleta de cores

#### Cores semânticas (não decorativas)

```css
/* Estados de conformidade — RESERVADAS */
--state-success: #16a34a;      /* verde-600 — conformidade ok */
--state-success-bg: #dcfce7;   /* verde-100 */
--state-warning: #d97706;      /* âmbar-600 — atenção, prazo próximo */
--state-warning-bg: #fef3c7;   /* âmbar-100 */
--state-critical: #dc2626;     /* vermelho-600 — pendência crítica */
--state-critical-bg: #fee2e2;  /* vermelho-100 */
--state-info: #2563eb;         /* azul-600 — informação neutra */
--state-info-bg: #dbeafe;      /* azul-100 */

/* Risco — matriz de avaliação */
--risk-low: #65a30d;            /* verde-lima-600 */
--risk-medium: #ca8a04;         /* âmbar-600 */
--risk-high: #ea580c;           /* laranja-600 */
--risk-critical: #b91c1c;       /* vermelho-700 */
```

#### Cores de marca e interface

```css
/* Marca — neutro profissional, evita conotações políticas ou de saúde */
--brand-primary: #0f172a;       /* slate-900 */
--brand-secondary: #334155;     /* slate-700 */
--brand-accent: #0891b2;        /* cyan-600 — toque de cor para CTAs */

/* Cinzas — fundação da interface */
--surface-0: #ffffff;           /* fundo principal */
--surface-1: #f8fafc;           /* slate-50 — fundo de seções */
--surface-2: #f1f5f9;           /* slate-100 — hover, divisores sutis */
--surface-3: #e2e8f0;           /* slate-200 — bordas */
--surface-4: #cbd5e1;           /* slate-300 — bordas mais fortes */

/* Texto */
--text-primary: #0f172a;        /* slate-900 */
--text-secondary: #475569;      /* slate-600 */
--text-tertiary: #94a3b8;       /* slate-400 */
--text-on-dark: #f8fafc;        /* slate-50 */

/* IA — uma cor própria para diferenciar conteúdo gerado por IA */
--ai-accent: #7c3aed;           /* violeta-600 */
--ai-accent-bg: #f3e8ff;        /* violeta-100 */
--ai-border: #c4b5fd;           /* violeta-300 */
```

### 2.2 Tipografia

**Família:** Inter (já incluída em projetos Next.js modernos via `next/font/google`).

**Justificativa:** Inter foi desenhada para interfaces densas, tem excelente legibilidade em tamanhos pequenos e é gratuita.

**Escala:**

| Token | Tamanho | Uso |
|-------|---------|-----|
| `text-xs` | 12px | Legendas, labels secundários, tabelas densas |
| `text-sm` | 14px | Padrão de tabelas, formulários, corpo de UI densa |
| `text-base` | 16px | Corpo de leitura, texto principal |
| `text-lg` | 18px | Subtítulos de seção |
| `text-xl` | 20px | Títulos de cards |
| `text-2xl` | 24px | Títulos de página |
| `text-3xl` | 30px | Hero do dashboard (raro) |

**Pesos:**
- `font-normal` (400) — corpo
- `font-medium` (500) — labels, botões
- `font-semibold` (600) — títulos de seção, ênfase
- `font-bold` (700) — títulos de página (apenas)

**Fonte monoespaçada:** JetBrains Mono ou Fira Code para códigos, IDs, hashes de auditoria.

### 2.3 Espaçamento

Sistema baseado em múltiplos de 4px (padrão Tailwind):

| Token | Valor | Uso típico |
|-------|-------|------------|
| `1` | 4px | Espaço mínimo (entre ícone e texto) |
| `2` | 8px | Padding interno compacto |
| `3` | 12px | Espaço entre campos de formulário denso |
| `4` | 16px | Padding padrão de card |
| `6` | 24px | Espaço entre seções de card |
| `8` | 32px | Margem entre seções principais |
| `12` | 48px | Espaço entre blocos de página |
| `16` | 64px | Margens externas de página (em telas largas) |

### 2.4 Bordas e sombras

```css
/* Bordas */
--border-radius-sm: 4px;        /* badges, inputs */
--border-radius-md: 6px;        /* botões, cards pequenos */
--border-radius-lg: 8px;        /* cards grandes, modais */

/* Sombras — sutis, funcionais */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08);

/* Foco — acessibilidade obrigatória */
--focus-ring: 0 0 0 3px rgba(8, 145, 178, 0.3);  /* cyan transparente */
```

---

## 3. Componentes

### 3.1 Botões

**Variantes:**

| Variante | Uso | Cor |
|----------|-----|-----|
| `primary` | CTA principal da tela | `brand-accent` (cyan-600) |
| `secondary` | Ações secundárias | `surface-0` com borda |
| `ghost` | Ações terciárias, links | Transparente |
| `destructive` | Excluir, rejeitar | `state-critical` (red-600) |
| `success` | Aprovar, publicar | `state-success` (green-600) |

**Tamanhos:**
- `sm` — altura 32px, padding x12 — usado em tabelas e cards densos
- `md` — altura 40px, padding x16 — padrão
- `lg` — altura 48px, padding x24 — CTAs principais

**Estados:** default, hover, focus, active, disabled, loading (com spinner).

### 3.2 Inputs e Formulários

**Padrão visual:**
- Altura padrão 40px
- Borda `surface-3` (slate-200)
- Borda no foco: `brand-accent` + focus-ring
- Label acima do campo, 12px, `text-secondary`, com asterisco vermelho para obrigatórios
- Mensagem de erro abaixo do campo, 12px, `state-critical`

**Tipos suportados:**
- Text, number, date, datetime
- Select (com search para listas longas)
- Multi-select (com chips)
- Textarea
- File upload (drag-and-drop)
- Switch (binário)
- Checkbox e radio

**Formulários densos:**
- 2 colunas em telas largas, 1 coluna em mobile
- Gap vertical: 12px
- Agrupamento por seções com título 14px semibold

### 3.3 Tabelas

**Tabelas são protagonistas neste sistema.** RH operacional passa o dia em tabelas.

**Padrão:**
- Header com `surface-2`, texto 12px uppercase, `text-secondary`
- Linhas com `text-sm` (14px), padding y10 px16
- Hover na linha: `surface-1`
- Borda inferior `surface-3` entre linhas
- Zebra striping opcional (configurável por tabela)

**Funcionalidades obrigatórias:**
- Ordenação por coluna (ícone de seta no header)
- Filtro por coluna (popover)
- Busca global no topo
- Paginação no rodapé (25/50/100 por página)
- Seleção em massa (checkbox na primeira coluna)
- Ações em lote (barra que aparece ao selecionar)
- Ação por linha (menu de três pontos no final)

**Densidade:**
- Modo padrão: linhas de 48px
- Modo compacto: linhas de 36px (toggle no canto superior)

### 3.4 Cards

**Card padrão:**
- Background `surface-0`
- Borda `surface-3`
- Border-radius `lg` (8px)
- Padding interno: 24px
- Sombra `shadow-sm`

**Card com header:**
- Título 18px semibold
- Subtítulo 14px `text-secondary`
- Linha divisória abaixo do header (`surface-3`)

**Card de estado:**
- Borda esquerda colorida de 4px de largura (state-success/warning/critical)
- Restante segue padrão

**Card de IA:**
- Borda completa em `ai-border` (violeta-300)
- Ícone de IA no canto superior direito
- Background `ai-accent-bg` em tom muito claro (opcional)

### 3.5 Badges e Status

**Badges de estado:**

```
🟢 Em conformidade    (state-success-bg + state-success)
🟡 Atenção            (state-warning-bg + state-warning)
🔴 Crítico            (state-critical-bg + state-critical)
🔵 Informativo        (state-info-bg + state-info)
⚪ Rascunho           (surface-2 + text-secondary)
```

**Badges de risco (matriz):**

```
Baixo       (risk-low + branco)
Médio       (risk-medium + branco)
Alto        (risk-high + branco)
Crítico     (risk-critical + branco)
```

**Badge de IA:**

```
✨ Sugerido pela IA   (ai-accent-bg + ai-accent + ícone Sparkles)
```

**Tamanho:**
- Padrão: 22px altura, padding x8, text-xs
- Compacto: 18px altura, padding x6, text-2xs (10px)

### 3.6 Navegação

**Sidebar lateral (perfil RH operacional):**
- Largura 240px (expandida) / 64px (colapsada)
- Background `surface-1`
- Itens com ícone + label
- Item ativo: borda esquerda `brand-accent` + background `surface-2`
- Agrupamento de itens com separador e label de grupo (12px uppercase)

**Top bar (todos os perfis):**
- Altura 56px
- Background `surface-0`
- Borda inferior `surface-3`
- Logo à esquerda, busca global no centro, ações + perfil à direita
- Sino de notificações com contador

**Navegação mobile (perfil Gestor):**
- Bottom tab bar com 4 itens: Início, Pendências, Documentos, Mais
- Top bar simples com título da tela e botão de voltar

### 3.7 Modais e Drawers

**Modal:**
- Centralizado, overlay escuro `rgba(0,0,0,0.5)`
- Largura padrão: 480px (sm), 640px (md), 800px (lg)
- Header com título + botão fechar
- Conteúdo com padding 24px
- Footer com botões alinhados à direita

**Drawer (preferido para edições densas):**
- Desliza da direita
- Largura: 480px (sm), 720px (md), 960px (lg)
- Mantém contexto da tela atrás visível
- Usado para: edição de risco, edição de ação, detalhes de documento

### 3.8 Toasts e Notificações

**Toast:**
- Aparece no canto inferior direito
- Auto-dismiss em 5 segundos (exceto erros: dismiss manual)
- Tipos: success, warning, error, info
- Ícone + título + mensagem + botão fechar
- Pode ter ação ("Desfazer", "Ver detalhes")

**Notificações persistentes:**
- Sino na topbar com contador
- Painel desliza ao clicar
- Itens marcados como lidos/não lidos
- Filtro por tipo (pendências, atualizações, alertas de IA)

---

## 4. Padrões de UX Específicos

### 4.1 Indicador de Conformidade do PGR

Componente fixo, presente no topo de telas-chave:

```
┌─────────────────────────────────────────────────────────┐
│ 🟡 PGR: Parcialmente em conformidade                    │
│    Última atualização: 22/05/2026 às 14:30              │
│    Pendências: 3 ações em atraso, 2 documentos vencendo │
│    [Ver detalhes]                                       │
└─────────────────────────────────────────────────────────┘
```

Estados:
- 🟢 Em conformidade — todos os critérios atendidos
- 🟡 Parcial — algumas pendências não críticas
- 🔴 Crítico — pendências que impedem fiscalização

### 4.2 Indicação de Conteúdo Gerado por IA

Qualquer informação gerada por IA precisa de marca visual:

- Card com borda violeta
- Badge "✨ Sugerido pela IA" próximo ao conteúdo
- Tooltip ao passar o mouse: "Esta sugestão foi gerada por IA e ainda não foi confirmada"
- Botões de ação: "Aceitar", "Editar", "Rejeitar" — sempre presentes

### 4.3 Confirmação Destrutiva

Ações destrutivas (excluir, rejeitar em massa, descartar versão) sempre exigem confirmação por modal com:
- Título claro: "Excluir este risco?"
- Descrição do impacto: "Esta ação removerá também 3 ações vinculadas. Não pode ser desfeita."
- Botão destrutivo + botão cancelar
- Em casos muito sérios: digitar uma palavra ("EXCLUIR") para confirmar

### 4.4 Estados de Vazio

Toda tela que pode estar vazia (lista, tabela, dashboard) tem estado vazio com:
- Ilustração simples (SVG, monocromática)
- Título explicativo
- Descrição curta
- CTA para a ação principal ("Cadastrar primeiro risco")

### 4.5 Loading States

- Skeleton screens para conteúdo previsível (listas, cards)
- Spinner para ações pontuais (salvar, gerar PDF)
- Barra de progresso para uploads e processamentos em lote
- Streaming visível no chat de IA (texto aparece conforme gerado)

### 4.6 Densidade adaptativa

Toggle no canto superior das tabelas: "Compacto / Padrão / Confortável".

- Compacto: linha 32px, padding mínimo, ideal para revisão rápida
- Padrão: linha 48px, equilíbrio entre densidade e legibilidade
- Confortável: linha 64px, ideal para usuários menos experientes

---

## 5. Acessibilidade (WCAG 2.1 AA)

### 5.1 Requisitos obrigatórios

- Contraste mínimo de 4.5:1 para texto normal, 3:1 para texto grande
- Todos os elementos interativos navegáveis por teclado (Tab, Enter, Esc)
- Focus ring visível em todos os elementos focáveis (`--focus-ring`)
- Labels em todos os campos de formulário
- `alt` text em todas as imagens informativas
- ARIA labels em ícones-botão sem texto
- Modais com foco aprisionado e Esc para fechar
- Toasts anunciados via `aria-live`

### 5.2 Atalhos de teclado

| Atalho | Ação |
|--------|------|
| `Ctrl + K` (ou `Cmd + K`) | Busca global |
| `Ctrl + N` | Novo (contextual à tela) |
| `Esc` | Fechar modal/drawer |
| `Ctrl + S` | Salvar (em formulários) |
| `?` | Abrir ajuda/atalhos |

---

## 6. Responsividade

### 6.1 Breakpoints

```css
sm: 640px    /* tablet vertical */
md: 768px    /* tablet horizontal */
lg: 1024px   /* desktop pequeno */
xl: 1280px   /* desktop padrão */
2xl: 1536px  /* desktop grande */
```

### 6.2 Estratégia

- **Perfil RH operacional:** otimizado para `lg` em diante. Em `md` e abaixo, mensagem sugerindo desktop. Sistema funciona, mas com limitações.
- **Perfil Gestor:** mobile-first. Otimizado para `sm` (mobile) e `md` (tablet). Em desktop, conteúdo centralizado com max-width.
- **Sidebar:** colapsa automaticamente em `md` e abaixo. Vira drawer overlay.
- **Tabelas em mobile:** transformam em cards (uma linha = um card empilhado).

---

## 7. Implementação no Stack

### 7.1 Tailwind config

Estender o `tailwind.config.ts` com:
- Cores customizadas (mapeando as variáveis CSS acima)
- Fonte Inter via `next/font/google`
- Plugin de forms (`@tailwindcss/forms`)
- Plugin de typography (`@tailwindcss/typography`) — opcional, para áreas de leitura longa

### 7.2 shadcn/ui

Componentes a instalar via CLI do shadcn/ui:
- `button`, `input`, `label`, `select`, `checkbox`, `radio-group`, `switch`
- `dialog`, `sheet` (drawer), `popover`, `tooltip`
- `table`, `tabs`, `accordion`
- `badge`, `card`, `alert`
- `toast` (sonner ou shadcn)
- `dropdown-menu`, `command` (para busca com Cmd+K)
- `calendar`, `date-picker`

Customizar o tema do shadcn/ui editando `globals.css` com as variáveis CSS desta documentação.

### 7.3 Ícones

**Biblioteca:** Lucide React (`lucide-react`)

Justificativa: consistente com shadcn/ui, leve, abrangente, gratuita.

Tamanhos padrão:
- 16px em badges e inline
- 20px em botões e itens de menu
- 24px em headers e estados vazios
- 32px+ em ilustrações

### 7.4 Estrutura de pastas sugerida

```
/components
  /ui                    # componentes do shadcn/ui (gerados pela CLI)
  /layout                # AppShell, Sidebar, Topbar, Footer
  /forms                 # campos especializados (RiskMatrixInput, NRSelect)
  /tables                # DataTable customizada com shadcn
  /domain                # componentes de negócio (RiskCard, ActionCard, PgrStatusBanner)
  /ai                    # componentes da camada de IA (ClassificationCard, ChatWidget)
/styles
  globals.css            # variáveis CSS, base styles
```

---

## 8. Tom de Voz da Interface

### 8.1 Princípios de texto

**Direto.** Sem rodeios corporativos.
- ❌ "Por favor, tenha a gentileza de informar..."
- ✅ "Informe o setor responsável"

**Em português, sempre.** Sem termos em inglês desnecessários.
- ❌ "Submit", "Cancel"
- ✅ "Enviar", "Cancelar"

**Específico nos erros.**
- ❌ "Erro ao salvar"
- ✅ "Não foi possível salvar: o campo 'prazo' precisa ser uma data futura"

**Útil nos vazios.**
- ❌ "Nenhum registro encontrado"
- ✅ "Você ainda não cadastrou nenhum risco. Comece pelo setor com mais colaboradores."

### 8.2 Linguagem técnica

Termos da NR-1 são preservados (PGR, GRO, NR-1, CIPA, PCMSO). Não traduzir nem simplificar — o usuário precisa aprender o vocabulário oficial.

Mas: usar tooltip ou ícone de info ao lado da primeira ocorrência de um termo técnico em cada tela, com definição curta.

---

## 9. Próximos Passos

1. **Setup do Tailwind config** com as variáveis CSS desta documentação
2. **Instalação dos componentes shadcn/ui** listados
3. **Criação do AppShell** (layout com sidebar + topbar)
4. **Implementação do PgrStatusBanner** (componente que aparece em todas as telas)
5. **Implementação do DataTable** customizado (será a base de várias telas)
6. **Implementação do ClassificationCard** (UX da IA)

---

## 10. Notas para Implementação no Claude Code

Quando trabalhar nas telas com Claude Code:

1. **Sempre carregar este documento como contexto** no início da sessão de UI
2. **Não inventar cores ou tamanhos** — use as variáveis CSS definidas aqui
3. **Reutilizar componentes** — antes de criar novo, verifique se existe similar em `/components`
4. **Densidade primeiro** — não adicionar padding/margin gratuitos pensando em "respiro visual"
5. **Acessibilidade não é opcional** — todo elemento interativo precisa de label, focus ring e suporte a teclado
6. **Mobile só para o perfil Gestor** — o perfil RH é desktop-first declaradamente

---

*Documento de referência visual e de componentes. Atualizado conforme o projeto evolui.*
