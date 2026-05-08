# Design Spec — Sistema de Produtividade Pessoal Flávio

**Data:** 2026-05-08  
**Status:** Aprovado  
**Arquivo de saída:** `index.html` (single-file, sem build)

---

## 1. Visão geral

Sistema de produtividade pessoal para uso 100% local, offline-first. Single-page em HTML/CSS/JS puro, sem dependências externas além de Google Fonts. Persistência total em `localStorage` com chave `flavio_produtividade_v1`.

**Não será publicado.** Nenhum SEO, analytics, meta social, ou CDN externo de JS.

---

## 2. Stack e constraints

| Item | Decisão |
|------|---------|
| Entregável | 1 único `index.html` |
| CSS/JS | Inline no arquivo (`<style>` + `<script>`) |
| Fontes | Google Fonts via `<link>` (única exceção externa) |
| Persistência | `localStorage` — chave `flavio_produtividade_v1` |
| Build | Nenhum. Abre no navegador direto. |
| Frameworks | Nenhum |
| Tema padrão | Escuro, com toggle para claro |
| Responsividade | Mobile-friendly, otimizado para desktop |

---

## 3. Estrutura de dados (localStorage)

```json
{
  "version": 1,
  "frentes": [
    { "id": "tiktok_shop", "nome": "TikTok Shop", "tipo": "paralelo", "cor": "#1d9e75", "ativa": true },
    { "id": "youtube_dark", "nome": "Canal dark YouTube", "tipo": "paralelo", "cor": "#639922", "ativa": true },
    { "id": "curso_latam", "nome": "Curso original LATAM", "tipo": "paralelo", "cor": "#ba7517", "ativa": true },
    { "id": "apps_proprios", "nome": "3 Apps próprios", "tipo": "paralelo", "cor": "#7f77dd", "ativa": true },
    { "id": "saas_nicho", "nome": "SaaS de nicho", "tipo": "paralelo", "cor": "#534ab7", "ativa": false },
    { "id": "produto_politico", "nome": "Produto político", "tipo": "paralelo", "cor": "#a32d2d", "ativa": false },
    { "id": "clinicflow", "nome": "ClinicFlow IA", "tipo": "consultor", "cor": "#185fa5", "ativa": true },
    { "id": "leadscore", "nome": "LeadScore Imob", "tipo": "consultor", "cor": "#378add", "ativa": true },
    { "id": "esteticaflow", "nome": "EstéticaFlow", "tipo": "consultor", "cor": "#0f6e56", "ativa": true }
  ],
  "metas_diarias": {
    "YYYY-MM-DD": {
      "meta_principal": "texto livre",
      "frentes": {
        "frente_id": { "meta": "texto", "status": "feito|em_andamento|nao_iniciado" }
      },
      "habitos": {
        "exercicio": false,
        "leitura": false,
        "agua": 0,
        "sono": false
      }
    }
  },
  "tarefas": [
    {
      "id": "uuid",
      "frente_id": "tiktok_shop",
      "titulo": "Validar fornecedor",
      "descricao": "Cotar 3 fornecedores",
      "prioridade": "alta|media|baixa",
      "status": "pendente|em_andamento|concluida",
      "criada_em": "ISO8601",
      "concluida_em": null,
      "estimativa_pomodoros": 2,
      "pomodoros_usados": 0,
      "horario_sugerido": "manha|tarde|noite",
      "data_planejada": "YYYY-MM-DD",
      "carried_over": false,
      "data_planejada_original": null
    }
  ],
  "pomodoros_log": [
    {
      "id": "uuid",
      "tarefa_id": "uuid",
      "frente_id": "tiktok_shop",
      "iniciado_em": "ISO8601",
      "concluido_em": "ISO8601",
      "tipo": "foco|pausa_curta|pausa_longa",
      "interrompido": false,
      "nota": null
    }
  ],
  "config": {
    "tema": "dark",
    "pomodoro_foco_min": 25,
    "pomodoro_pausa_curta_min": 5,
    "pomodoro_pausa_longa_min": 15,
    "ciclos_ate_pausa_longa": 4,
    "som_ativo": true,
    "notificacoes_ativas": false,
    "auto_start_delay_s": 3,
    "horarios": {
      "manha": { "inicio": "10:00", "fim": "12:00" },
      "tarde": { "inicio": "14:00", "fim": "17:00" },
      "noite": { "inicio": "18:30", "fim": "20:00" }
    },
    "habitos": ["exercicio", "leitura", "agua", "sono"],
    "onboarding_completo": false,
    "ultima_data_aberta": "YYYY-MM-DD"
  }
}
```

---

## 4. Organização do código (seções do `<script>`)

```
// ═══════════════════════════════
// STATE — objeto em memória
// ═══════════════════════════════
// ═══════════════════════════════
// PERSIST — load/save/export/import
// ═══════════════════════════════
// ═══════════════════════════════
// UTILS — uuid, formatDate, formatTime, beep
// ═══════════════════════════════
// ═══════════════════════════════
// POMODORO — timer + Web Worker via Blob
// ═══════════════════════════════
// ═══════════════════════════════
// RENDER — funções de render por aba
// ═══════════════════════════════
// ═══════════════════════════════
// EVENTS — todos os event listeners
// ═══════════════════════════════
// ═══════════════════════════════
// BOOT — init + onboarding check
// ═══════════════════════════════
```

---

## 5. Layout — 4 abas

### 5.1 Aba: Hoje (default)

Layout 3 colunas desktop (`grid-template-columns: 40% 35% 25%`), empilhadas no mobile.

**Coluna esquerda — Pipeline (40%):**
- Header com data (ex: "Quinta-feira, 8 de maio")
- 3 blocos colapsáveis: Manhã / Tarde / Noite
- Cada bloco mostra: label com horário + capacidade em 🍅
- Tarefas dentro de cada bloco: título · badge frente (cor) · 🍅×N · botão ▶ iniciar · checkbox concluído
- Botão "↕ Mover" em cada tarefa abre mini-menu com os 3 blocos destino (abordagem selecionada pelo usuário — sem drag-and-drop nativo)
- Botão "+ Adicionar tarefa" por bloco → modal de criação
- Tarefas com `carried_over: true` exibem badge "ontem" em amarelo
- Bloco do horário vigente destacado com borda colorida

**Coluna central — Timer (35%):**
- Display MM:SS em fonte monoespaçada, ~72px
- 4 círculos indicadores de ciclo (● preenchido = ciclo completo)
- Label de estado: FOCO / PAUSA CURTA / PAUSA LONGA
- Card "Tarefa em foco" (dropdown selecionável)
- Botões: Iniciar · Pausar · Resetar · ⏭ Pular fase
- Modal pós-pomodoro: "Foi produtivo?" → Sim | Não | Adicionar nota
- Auto-inicia próxima fase após 3s (configurável)

**Coluna direita — Metas e Hábitos (25%):**
- Campo "Meta principal do dia" (textarea livre)
- Hábitos: Exercício (checkbox) · Leitura (checkbox) · Água (contador 0/8, clique incrementa) · Sono > 7h (checkbox)
- Mini-resumo: "Hoje você completou X 🍅 · Y tarefas · em Z frentes"

### 5.2 Aba: Frentes

- Toggle filtro: Paralelo | Consultor | Todas
- Cards com faixa lateral colorida (4px border-left na cor da frente)
- Cada card: nome · tipo badge · toggle ativa/inativa · contadores (pendente/andamento/concluída) · total 🍅 último mês
- Botão "Ver tarefas" — expande lista inline
- Botão "Adicionar tarefa rápida" — modal pré-preenchido
- FAB "+ Nova frente" (canto inferior direito)

### 5.3 Aba: Tarefas

- Filtros: frente (multi-select) · status · prioridade · horário sugerido · busca por título
- Ordenação: prioridade | data criação | frente
- Desktop: tabela. Mobile: cards.
- Edição inline ao clicar na linha
- Bulk actions: selecionar via checkboxes → marcar concluída | mover de frente | deletar

### 5.4 Aba: Estatísticas

- Pomodoros últimos 30 dias: barras verticais CSS (altura proporcional ao máximo do período)
- Distribuição por frente: barras horizontais com % do total
- Tarefas concluídas por semana: 4 últimas semanas
- Streak: N dias consecutivos com ≥1 🍅 completo
- Comparativo esta semana vs semana passada: 🍅 · tarefas · frentes ativas
- Hábitos: % de cumprimento por hábito nos últimos 30 dias

---

## 6. Funcionalidades obrigatórias

| Funcionalidade | Implementação |
|---------------|--------------|
| Timer background | Web Worker via `Blob URL` — não pausa com aba em background |
| Notificação do browser | `Notification API` — permissão pedida na 1ª vez, salva em `config` |
| Atalho `Espaço` | Iniciar/pausar timer |
| Atalho `N` | Abrir modal nova tarefa |
| Atalhos `1`–`4` | Trocar aba |
| Atalho `Esc` | Fechar modais |
| Export JSON | Baixa `flavio_backup_YYYYMMDD.json` com todo o localStorage |
| Import JSON | Upload de arquivo, confirmação antes de sobrescrever |
| Reset diário | No `BOOT`: se `config.ultima_data_aberta !== hoje`, move tarefas não concluídas para hoje com `carried_over: true` |
| Highlight horário | Compara hora atual com `config.horarios` — adiciona classe `bloco-ativo` no bloco vigente |
| Som foco | Web Audio API: 880Hz, 200ms (fim de pomodoro de foco) |
| Som pausa | Web Audio API: 440Hz, 200ms (fim de pausa) |
| Toggle som | Header — salva em `config.som_ativo` |
| Toggle tema | Header — salva em `config.tema`, troca classe no `<body>` |

---

## 7. Design system

### Cores (tema escuro — padrão)

```css
--bg:        #0d0d0d;
--surface:   #1a1a1a;
--border:    #2a2a2a;
--text:      #e5e5e5;
--text-muted: #888888;
--surface-hover: #222222;
```

### Cores (tema claro)

```css
--bg:        #fafaf7;
--surface:   #ffffff;
--border:    #e5e3dc;
--text:      #1a1a1a;
--text-muted: #666666;
--surface-hover: #f5f5f2;
```

### Tipografia

- Família: `Inter`, fallback `system-ui`
- Body: 14px
- Secundário: 12px
- Títulos: 18–22px
- Timer display: 72px, `font-family: monospace`

### Espaçamento

- Padding interno cards: 16–24px
- Gap entre cards: 16px
- Border-radius: cards 8px · botões 6px · inputs 4px

### Regras visuais

- Sem gradientes
- Sem sombras pesadas (no `box-shadow` em cards principais)
- Sem emojis decorativos (exceto 🍅 para contar pomodoros)
- Animações: 150–200ms em hover, fade-in em modais
- Cores das frentes: usadas como `background` em badges e `border-left` em cards

---

## 8. Onboarding (primeira abertura)

Condição: `config.onboarding_completo === false`

**Tela 1 — Boas-vindas:** explicação em 3 linhas do sistema. Botão "Próximo".

**Tela 2 — Horários:** campos editáveis para os 3 blocos (manhã/tarde/noite) com valores padrão pré-preenchidos.

**Tela 3 — Frentes:** lista das 9 frentes com checkbox para ativar/desativar cada uma.

**Finalização:** clique em "Começar" → `config.onboarding_completo = true` → salvar localStorage → renderizar aba Hoje.

---

## 9. Critérios de pronto

- [ ] Abre em Chrome, Firefox, Edge, Safari modernos
- [ ] Funciona 100% offline após 1ª abertura
- [ ] Sobrevive F5 sem perder dados
- [ ] Timer continua em background (Web Worker)
- [ ] Notificação dispara com aba minimizada
- [ ] Export/Import JSON funcionando
- [ ] Sem erros no console
- [ ] Mobile-responsive (usável, não perfeito)

---

## 10. Decisões de design registradas

| Decisão | Alternativas consideradas | Motivo |
|---------|--------------------------|--------|
| Single HTML file | Multi-file com build | Uso pessoal, zero fricção para abrir |
| Web Worker via Blob URL | Arquivo worker.js separado | Mantém o single-file constraint |
| Botão "↕ Mover" para mover tarefas entre blocos | HTML5 drag-and-drop · click-select-then-click | Mais robusto, funciona em qualquer dispositivo, zero library |
| CSS puro para gráficos | Chart.js · D3 | Zero dependências externas de JS |
| Seções marcadas no `<script>` | Classes ES6 · módulos | Simplicidade, navegabilidade no DevTools |
