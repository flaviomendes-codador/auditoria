# Sistema de Produtividade Pessoal — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar `index.html` — sistema completo de produtividade pessoal com timer Pomodoro, pipeline diário por blocos de horário, gestão de frentes/tarefas e estatísticas, tudo persistido em localStorage.

**Architecture:** Single HTML file com `<style>` e `<script>` inline. Script organizado em seções marcadas: STATE · PERSIST · UTILS · POMODORO · RENDER · EVENTS · BOOT. Web Worker via Blob URL para o timer não pausar em background. Persistência completa em localStorage com chave `flavio_produtividade_v1`.

**Tech Stack:** HTML5, CSS3 (custom properties), JavaScript ES2020, Web Audio API, Notification API, Web Worker via Blob URL, localStorage.

**Spec:** `docs/superpowers/specs/2026-05-08-planner-pessoal-design.md`

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---------|-----------------|
| `index.html` | Tudo — único arquivo entregável |

Organização interna do `<script>`:

```
// ═══════════════ STATE ════════════════
// ═══════════════ PERSIST ═════════════
// ═══════════════ UTILS ═══════════════
// ═══════════════ POMODORO ════════════
// ═══════════════ RENDER ══════════════
// ═══════════════ EVENTS ══════════════
// ═══════════════ BOOT ════════════════
```

---

## Task 1: Shell HTML + CSS + navegação entre abas

**Files:**
- Create: `index.html`

- [ ] **Step 1: Criar o arquivo `index.html` com estrutura completa**

Crie `index.html` com o seguinte conteúdo (este é o esqueleto que todas as outras tasks vão expandir):

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planner</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* ─── RESET ─────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    button { cursor: pointer; font-family: inherit; }
    input, textarea, select { font-family: inherit; }

    /* ─── TEMA ───────────────────────────── */
    :root {
      --bg:           #0d0d0d;
      --surface:      #1a1a1a;
      --border:       #2a2a2a;
      --text:         #e5e5e5;
      --text-muted:   #888888;
      --surface-hover:#222222;
      --accent:       #1d9e75;
      --radius-card:  8px;
      --radius-btn:   6px;
      --radius-input: 4px;
    }
    body.light {
      --bg:           #fafaf7;
      --surface:      #ffffff;
      --border:       #e5e3dc;
      --text:         #1a1a1a;
      --text-muted:   #666666;
      --surface-hover:#f5f5f2;
    }

    /* ─── BASE ───────────────────────────── */
    body {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 14px;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      line-height: 1.5;
    }

    /* ─── NAVBAR ─────────────────────────── */
    .navbar {
      display: flex;
      align-items: center;
      gap: 0;
      background: var(--bg);
      border-bottom: 1px solid var(--border);
      padding: 0 16px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .navbar .brand {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-muted);
      padding: 12px 16px 12px 0;
      border-right: 1px solid var(--border);
      margin-right: 8px;
    }
    .tab-btn {
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 500;
      padding: 12px 16px;
      transition: color 150ms, border-color 150ms;
    }
    .tab-btn:hover { color: var(--text); }
    .tab-btn.active { color: var(--text); border-bottom-color: var(--text); }
    .navbar-actions {
      margin-left: auto;
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .icon-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 16px;
      padding: 6px 8px;
      border-radius: var(--radius-btn);
      transition: color 150ms, background 150ms;
    }
    .icon-btn:hover { color: var(--text); background: var(--surface-hover); }

    /* ─── ABAS ───────────────────────────── */
    .tab-panel { display: none; padding: 20px 16px; }
    .tab-panel.active { display: block; }

    /* ─── CARDS ──────────────────────────── */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-card);
    }

    /* ─── BOTÕES ─────────────────────────── */
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      border: none;
      border-radius: var(--radius-btn);
      font-size: 13px;
      font-weight: 500;
      padding: 8px 16px;
      transition: opacity 150ms, background 150ms;
    }
    .btn:hover { opacity: 0.85; }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-ghost   { background: var(--surface); border: 1px solid var(--border); color: var(--text); }
    .btn-danger  { background: #a32d2d; color: #fff; }
    .btn-sm { padding: 4px 10px; font-size: 12px; }

    /* ─── INPUTS ─────────────────────────── */
    .input {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-input);
      color: var(--text);
      font-size: 13px;
      padding: 7px 10px;
      width: 100%;
      outline: none;
      transition: border-color 150ms;
    }
    .input:focus { border-color: var(--accent); }
    textarea.input { resize: vertical; min-height: 60px; }

    /* ─── MODAIS ─────────────────────────── */
    .modal-overlay {
      display: none;
      position: fixed; inset: 0;
      background: rgba(0,0,0,.6);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    .modal-overlay.open { display: flex; animation: fadeIn 150ms ease; }
    .modal {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-card);
      padding: 24px;
      width: 100%;
      max-width: 480px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
    .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }

    /* ─── FORMULÁRIOS ────────────────────── */
    .form-row { margin-bottom: 14px; }
    .form-label { font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: .5px; }
    .form-row select.input option { background: var(--surface); }

    /* ─── BADGES ─────────────────────────── */
    .badge {
      display: inline-flex; align-items: center;
      font-size: 11px; font-weight: 500;
      padding: 2px 7px;
      border-radius: 4px;
      white-space: nowrap;
    }

    /* ─── UTILITÁRIOS ────────────────────── */
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-8 { gap: 8px; }
    .gap-12 { gap: 12px; }
    .mt-8 { margin-top: 8px; }
    .mt-16 { margin-top: 16px; }
    .text-muted { color: var(--text-muted); }
    .text-sm { font-size: 12px; }

    /* ─── ANIMAÇÕES ──────────────────────── */
    @keyframes fadeIn { from { opacity: 0; transform: scale(.97); } to { opacity: 1; transform: scale(1); } }

    /* ─── SCROLLBAR ──────────────────────── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

    /* ─── RESPONSIVE ─────────────────────── */
    @media (max-width: 768px) {
      .navbar .brand { display: none; }
      .tab-btn { padding: 12px 10px; font-size: 12px; }
    }
  </style>
</head>
<body>

  <!-- NAVBAR -->
  <nav class="navbar">
    <span class="brand">Planner</span>
    <button class="tab-btn active" data-tab="hoje" onclick="switchTab('hoje')">Hoje</button>
    <button class="tab-btn" data-tab="frentes" onclick="switchTab('frentes')">Frentes</button>
    <button class="tab-btn" data-tab="tarefas" onclick="switchTab('tarefas')">Tarefas</button>
    <button class="tab-btn" data-tab="stats" onclick="switchTab('stats')">Estatísticas</button>
    <div class="navbar-actions">
      <button class="icon-btn" id="btn-som" onclick="toggleSom()" title="Som">🔔</button>
      <button class="icon-btn" id="btn-tema" onclick="toggleTema()" title="Tema">☀</button>
      <button class="icon-btn" onclick="exportarDados()" title="Exportar">⬇</button>
      <label class="icon-btn" title="Importar" style="display:inline-flex;align-items:center">
        ⬆<input type="file" id="import-file" accept=".json" style="display:none" onchange="importarDados(event)">
      </label>
    </div>
  </nav>

  <!-- ABAS -->
  <div id="tab-hoje"    class="tab-panel active"></div>
  <div id="tab-frentes" class="tab-panel"></div>
  <div id="tab-tarefas" class="tab-panel"></div>
  <div id="tab-stats"   class="tab-panel"></div>

  <!-- MODAIS (injetados pelo JS) -->
  <div id="modal-overlay" class="modal-overlay" onclick="fecharModal(event)">
    <div class="modal" id="modal-conteudo"></div>
  </div>

  <!-- TELA DE ONBOARDING (injetada pelo JS) -->
  <div id="onboarding" style="display:none; position:fixed; inset:0; background:var(--bg); z-index:2000; overflow-y:auto; padding:40px 16px;"></div>

  <script>
  // ═══════════════ STATE ════════════════
  // (preenchido na Task 2)

  // ═══════════════ PERSIST ═════════════
  // (preenchido na Task 2)

  // ═══════════════ UTILS ═══════════════
  // (preenchido na Task 3)

  // ═══════════════ POMODORO ════════════
  // (preenchido na Task 5)

  // ═══════════════ RENDER ══════════════
  // (preenchido nas Tasks 4, 6, 7, 8, 9, 10)

  // ═══════════════ EVENTS ══════════════

  function switchTab(nome) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === nome));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + nome));
    if (nome === 'hoje')    renderHoje();
    if (nome === 'frentes') renderFrentes();
    if (nome === 'tarefas') renderTarefas();
    if (nome === 'stats')   renderStats();
  }

  function toggleTema() {
    const isLight = document.body.classList.toggle('light');
    STATE.config.tema = isLight ? 'light' : 'dark';
    salvar();
  }

  function toggleSom() {
    STATE.config.som_ativo = !STATE.config.som_ativo;
    document.getElementById('btn-som').style.opacity = STATE.config.som_ativo ? '1' : '0.4';
    salvar();
  }

  function abrirModal(html) {
    document.getElementById('modal-conteudo').innerHTML = html;
    document.getElementById('modal-overlay').classList.add('open');
  }

  function fecharModal(e) {
    if (!e || e.target === document.getElementById('modal-overlay')) {
      document.getElementById('modal-overlay').classList.remove('open');
    }
  }

  // Funções stub — preenchidas em tasks futuras
  function renderHoje()    { document.getElementById('tab-hoje').innerHTML    = '<p style="padding:24px;color:var(--text-muted)">Aba Hoje em construção</p>'; }
  function renderFrentes() { document.getElementById('tab-frentes').innerHTML = '<p style="padding:24px;color:var(--text-muted)">Aba Frentes em construção</p>'; }
  function renderTarefas() { document.getElementById('tab-tarefas').innerHTML = '<p style="padding:24px;color:var(--text-muted)">Aba Tarefas em construção</p>'; }
  function renderStats()   { document.getElementById('tab-stats').innerHTML   = '<p style="padding:24px;color:var(--text-muted)">Aba Estatísticas em construção</p>'; }
  function exportarDados() {}
  function importarDados() {}

  // ═══════════════ BOOT ════════════════
  (function boot() {
    renderHoje();
  })();
  </script>
</body>
</html>
```

- [ ] **Step 2: Verificar no browser**

Abra `index.html` diretamente no Chrome (`Ctrl+O` ou arraste o arquivo). Verifique:
- Fundo preto, texto claro (tema dark)
- 4 tabs no topo clicáveis (Hoje, Frentes, Tarefas, Estatísticas)
- Clicar nos tabs troca o conteúdo sem erro no console
- Botão ☀ no canto direito: clicar vira tema claro e volta ao clicar de novo
- Sem erros vermelhos no DevTools (F12)

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: shell HTML + CSS base + navegação entre abas"
```

---

## Task 2: STATE + PERSIST

**Files:**
- Modify: `index.html` (seção `// STATE` e `// PERSIST`)

- [ ] **Step 1: Substituir a seção `// STATE` com o objeto em memória**

Substitua o comentário `// ═══════════════ STATE ════════════════` e a linha abaixo pelo seguinte bloco:

```js
// ═══════════════ STATE ════════════════
const STORAGE_KEY = 'flavio_produtividade_v1';

const FRENTES_INICIAIS = [
  { id: 'tiktok_shop',      nome: 'TikTok Shop',          tipo: 'paralelo',  cor: '#1d9e75', ativa: true  },
  { id: 'youtube_dark',     nome: 'Canal dark YouTube',    tipo: 'paralelo',  cor: '#639922', ativa: true  },
  { id: 'curso_latam',      nome: 'Curso original LATAM',  tipo: 'paralelo',  cor: '#ba7517', ativa: true  },
  { id: 'apps_proprios',    nome: '3 Apps próprios',       tipo: 'paralelo',  cor: '#7f77dd', ativa: true  },
  { id: 'saas_nicho',       nome: 'SaaS de nicho',         tipo: 'paralelo',  cor: '#534ab7', ativa: false },
  { id: 'produto_politico', nome: 'Produto político',      tipo: 'paralelo',  cor: '#a32d2d', ativa: false },
  { id: 'clinicflow',       nome: 'ClinicFlow IA',         tipo: 'consultor', cor: '#185fa5', ativa: true  },
  { id: 'leadscore',        nome: 'LeadScore Imob',        tipo: 'consultor', cor: '#378add', ativa: true  },
  { id: 'esteticaflow',     nome: 'EstéticaFlow',          tipo: 'consultor', cor: '#0f6e56', ativa: true  },
];

const CONFIG_PADRAO = {
  tema: 'dark',
  pomodoro_foco_min: 25,
  pomodoro_pausa_curta_min: 5,
  pomodoro_pausa_longa_min: 15,
  ciclos_ate_pausa_longa: 4,
  som_ativo: true,
  notificacoes_ativas: false,
  auto_start_delay_s: 3,
  horarios: {
    manha: { inicio: '10:00', fim: '12:00' },
    tarde: { inicio: '14:00', fim: '17:00' },
    noite: { inicio: '18:30', fim: '20:00' },
  },
  habitos: ['exercicio', 'leitura', 'agua', 'sono'],
  onboarding_completo: false,
  ultima_data_aberta: null,
};

let STATE = {
  frentes: [],
  metas_diarias: {},
  tarefas: [],
  pomodoros_log: [],
  config: { ...CONFIG_PADRAO },
};
```

- [ ] **Step 2: Remover os stubs vazios da seção EVENTS**

Na seção EVENTS do arquivo, localize e **remova** estas duas linhas:
```js
function exportarDados() {}
function importarDados() {}
```
Elas serão substituídas pelas implementações reais abaixo.

- [ ] **Step 3: Substituir a seção `// PERSIST` com load/save/export/import**

Substitua o comentário `// ═══════════════ PERSIST ═════════════` e a linha abaixo pelo seguinte bloco:

```js
// ═══════════════ PERSIST ═════════════
function salvar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
}

function carregar() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    const salvo = JSON.parse(raw);
    // Merge em vez de substituir, para suportar versões futuras
    STATE = {
      frentes:       salvo.frentes       ?? [],
      metas_diarias: salvo.metas_diarias ?? {},
      tarefas:       salvo.tarefas       ?? [],
      pomodoros_log: salvo.pomodoros_log ?? [],
      config:        { ...CONFIG_PADRAO, ...(salvo.config ?? {}) },
    };
    return true;
  } catch {
    return false;
  }
}

function exportarDados() {
  const data = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const blob = new Blob([JSON.stringify(STATE, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `flavio_backup_${data}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Variável global para segurar o conteúdo do import enquanto o modal está aberto
let _importPendente = null;

function importarDados(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    _importPendente = e.target.result;  // guarda sem injetar no onclick
    abrirModal(`
      <div class="modal-title">Importar backup</div>
      <p style="color:var(--text-muted);margin-bottom:16px">
        Isso vai <strong style="color:#e55">substituir todos os dados atuais</strong> pelo arquivo <em>${file.name}</em>. Tem certeza?
      </p>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="fecharModal()">Cancelar</button>
        <button class="btn btn-danger" onclick="confirmarImport()">Substituir dados</button>
      </div>
    `);
  };
  reader.readAsText(file);
  event.target.value = '';
}

function confirmarImport() {
  if (!_importPendente) return;
  try {
    const dados = JSON.parse(_importPendente);
    STATE = dados;
    salvar();
    _importPendente = null;
    fecharModal();
    location.reload();
  } catch {
    alert('Arquivo inválido.');
  }
}
```

- [ ] **Step 4: Atualizar a função `boot` para chamar `carregar()`**

Substitua a função boot existente:

```js
// ═══════════════ BOOT ════════════════
(function boot() {
  const temDados = carregar();
  if (STATE.config.tema === 'light') document.body.classList.add('light');
  document.getElementById('btn-som').style.opacity = STATE.config.som_ativo ? '1' : '0.4';
  renderHoje();
})();
```

- [ ] **Step 5: Verificar no browser**

Abra o DevTools (F12) → Console. Execute:
```js
salvar()                             // deve retornar undefined sem erros
JSON.parse(localStorage.getItem('flavio_produtividade_v1'))  // deve mostrar o objeto STATE
exportarDados()                      // deve baixar um arquivo JSON
```

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: STATE + PERSIST (load/save/export/import)"
```

---

## Task 3: UTILS (uuid, formatDate, formatTime, beep)

**Files:**
- Modify: `index.html` (seção `// UTILS`)

- [ ] **Step 1: Substituir a seção `// UTILS`**

```js
// ═══════════════ UTILS ═══════════════
function uuid() {
  return crypto.randomUUID ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
}

function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatarData(iso) {
  const d = new Date(iso + 'T00:00:00');
  const dias   = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
  const meses  = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]}`;
}

function formatarTempo(segundos) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// Calcula os pomodoros que cabem num bloco dado start/end "HH:MM"
function capacidadeBloco(inicio, fim, minFoco, minPausa) {
  const [sh, sm] = inicio.split(':').map(Number);
  const [eh, em] = fim.split(':').map(Number);
  const totalMin = (eh * 60 + em) - (sh * 60 + sm);
  const cicloDurMin = minFoco + minPausa;
  return Math.floor(totalMin / cicloDurMin);
}

// Retorna 'manha' | 'tarde' | 'noite' | null conforme hora atual
function blocoAtual() {
  const agora = new Date();
  const minAtual = agora.getHours() * 60 + agora.getMinutes();
  for (const [nome, h] of Object.entries(STATE.config.horarios)) {
    const [sh, sm] = h.inicio.split(':').map(Number);
    const [eh, em] = h.fim.split(':').map(Number);
    if (minAtual >= sh * 60 + sm && minAtual <= eh * 60 + em) return nome;
  }
  return null;
}

// Web Audio API — beep simples
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function beep(frequencia = 880, duracaoMs = 200, volume = 0.3) {
  if (!STATE.config.som_ativo) return;
  if (!audioCtx) audioCtx = new AudioCtx();
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = frequencia;
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duracaoMs / 1000);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + duracaoMs / 1000);
}
function beepFoco()  { beep(880, 250, 0.3); }  // fim de foco
function beepPausa() { beep(440, 200, 0.2); }  // fim de pausa

// Notificação do browser
function notificar(titulo, corpo) {
  if (!STATE.config.notificacoes_ativas) return;
  if (Notification.permission === 'granted') {
    new Notification(titulo, { body: corpo, icon: '🍅' });
  }
}

function pedirPermissaoNotificacao() {
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(p => {
      STATE.config.notificacoes_ativas = (p === 'granted');
      salvar();
    });
  }
}

function frente(id) { return STATE.frentes.find(f => f.id === id); }

function tarefasHoje(horario) {
  const hoje = hojeISO();
  return STATE.tarefas.filter(t =>
    t.data_planejada === hoje &&
    t.status !== 'concluida' &&
    (horario ? t.horario_sugerido === horario : true)
  );
}
```

- [ ] **Step 2: Verificar no browser (DevTools > Console)**

```js
uuid()          // deve retornar string UUID
hojeISO()       // ex: "2026-05-08"
formatarData('2026-05-08')  // "quinta-feira, 8 de maio"
formatarTempo(1499)         // "24:59"
capacidadeBloco('10:00','12:00', 25, 5)  // 4
blocoAtual()    // 'manha' | 'tarde' | 'noite' | null
beepFoco()      // deve emitir tom agudo (confirmar áudio ligado)
beepPausa()     // tom mais grave
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: UTILS — uuid, formatDate, capacidade, beep, notificações"
```

---

## Task 4: Onboarding (primeira abertura)

**Files:**
- Modify: `index.html` (seção `// BOOT` + adicionar funções de onboarding antes do BOOT)

- [ ] **Step 1: Adicionar as funções de onboarding antes do comentário `// BOOT`**

```js
// ─── ONBOARDING ──────────────────────
function renderOnboarding() {
  const el = document.getElementById('onboarding');
  el.style.display = 'block';
  mostrarOnboardingTela(1);
}

function mostrarOnboardingTela(tela) {
  const el = document.getElementById('onboarding');
  if (tela === 1) {
    el.innerHTML = `
      <div style="max-width:520px;margin:0 auto">
        <div style="font-size:28px;font-weight:700;margin-bottom:12px">Seu planner.</div>
        <p style="color:var(--text-muted);margin-bottom:32px;line-height:1.7">
          Organize seu dia em blocos de horário, gerencie suas frentes e acompanhe seu foco com o timer Pomodoro. Tudo offline, tudo seu.
        </p>
        <button class="btn btn-primary" onclick="mostrarOnboardingTela(2)">Próximo →</button>
      </div>
    `;
  } else if (tela === 2) {
    const { manha, tarde, noite } = STATE.config.horarios;
    el.innerHTML = `
      <div style="max-width:520px;margin:0 auto">
        <div style="font-size:20px;font-weight:600;margin-bottom:8px">Seus horários de trabalho</div>
        <p style="color:var(--text-muted);margin-bottom:24px">Ajuste se precisar.</p>
        ${['manha','tarde','noite'].map(b => `
          <div class="form-row">
            <label class="form-label">${b === 'manha' ? 'Manhã' : b === 'tarde' ? 'Tarde' : 'Noite'}</label>
            <div class="flex gap-8 items-center">
              <input class="input" style="width:100px" type="time" id="ob-${b}-i" value="${STATE.config.horarios[b].inicio}">
              <span style="color:var(--text-muted)">até</span>
              <input class="input" style="width:100px" type="time" id="ob-${b}-f" value="${STATE.config.horarios[b].fim}">
            </div>
          </div>
        `).join('')}
        <div class="flex gap-8 mt-16">
          <button class="btn btn-ghost" onclick="mostrarOnboardingTela(1)">← Voltar</button>
          <button class="btn btn-primary" onclick="salvarHorariosOnboarding()">Próximo →</button>
        </div>
      </div>
    `;
  } else if (tela === 3) {
    el.innerHTML = `
      <div style="max-width:520px;margin:0 auto">
        <div style="font-size:20px;font-weight:600;margin-bottom:8px">Suas frentes ativas</div>
        <p style="color:var(--text-muted);margin-bottom:24px">Selecione as que você vai trabalhar agora.</p>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px">
          ${STATE.frentes.map(f => `
            <label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);cursor:pointer">
              <input type="checkbox" id="ob-f-${f.id}" ${f.ativa ? 'checked' : ''} style="accent-color:${f.cor}">
              <span style="flex:1">${f.nome}</span>
              <span class="badge" style="background:${f.cor}22;color:${f.cor}">${f.tipo}</span>
            </label>
          `).join('')}
        </div>
        <div class="flex gap-8">
          <button class="btn btn-ghost" onclick="mostrarOnboardingTela(2)">← Voltar</button>
          <button class="btn btn-primary" onclick="concluirOnboarding()">Começar</button>
        </div>
      </div>
    `;
  }
}

function salvarHorariosOnboarding() {
  ['manha','tarde','noite'].forEach(b => {
    STATE.config.horarios[b].inicio = document.getElementById(`ob-${b}-i`).value;
    STATE.config.horarios[b].fim    = document.getElementById(`ob-${b}-f`).value;
  });
  mostrarOnboardingTela(3);
}

function concluirOnboarding() {
  STATE.frentes.forEach(f => {
    const cb = document.getElementById(`ob-f-${f.id}`);
    if (cb) f.ativa = cb.checked;
  });
  STATE.config.onboarding_completo = true;
  STATE.config.ultima_data_aberta  = hojeISO();
  salvar();
  document.getElementById('onboarding').style.display = 'none';
  pedirPermissaoNotificacao();
  renderHoje();
}
```

- [ ] **Step 2: Atualizar a função `boot` para checar onboarding e popular frentes iniciais**

Substitua o bloco `// ═══════════════ BOOT ════════════════` inteiro:

```js
// ═══════════════ BOOT ════════════════
(function boot() {
  const temDados = carregar();

  // Primeira abertura: popular frentes
  if (!temDados || STATE.frentes.length === 0) {
    STATE.frentes = FRENTES_INICIAIS.map(f => ({ ...f }));
    salvar();
  }

  if (STATE.config.tema === 'light') document.body.classList.add('light');
  document.getElementById('btn-som').style.opacity = STATE.config.som_ativo ? '1' : '0.4';

  if (!STATE.config.onboarding_completo) {
    renderOnboarding();
    return;
  }

  pedirPermissaoNotificacao();
  resetDiario();
  renderHoje();
})();

function resetDiario() {
  const hoje = hojeISO();
  if (STATE.config.ultima_data_aberta === hoje) return;

  // Mover tarefas pendentes/em_andamento do dia anterior para hoje
  const ontem = STATE.config.ultima_data_aberta;
  if (ontem) {
    STATE.tarefas.forEach(t => {
      if (t.data_planejada === ontem && t.status !== 'concluida') {
        t.data_planejada          = hoje;
        t.carried_over            = true;
        t.data_planejada_original = ontem;
      }
    });
  }

  STATE.config.ultima_data_aberta = hoje;
  salvar();
}
```

- [ ] **Step 3: Verificar onboarding**

1. Abra o DevTools e execute `localStorage.clear()` + `location.reload()`
2. Deve aparecer a tela de onboarding (fundo sólido, 3 passos)
3. Percorra os 3 passos — altere um horário, desative uma frente, clique "Começar"
4. Deve fechar e mostrar a aba Hoje
5. Recarregue (F5) — onboarding não deve aparecer novamente

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: onboarding 3 telas + reset diário + boot"
```

---

## Task 5: Pomodoro — Web Worker + state machine

**Files:**
- Modify: `index.html` (seção `// POMODORO`)

- [ ] **Step 1: Substituir a seção `// POMODORO`**

```js
// ═══════════════ POMODORO ════════════
// O timer roda num Web Worker criado via Blob URL para não pausar
// quando a aba perde foco (setTimeout/setInterval são throttled).
const WORKER_CODE = `
  let iv = null;
  self.onmessage = ({ data }) => {
    if (data.cmd === 'start') {
      clearInterval(iv);
      iv = setInterval(() => self.postMessage({ tick: true }), 1000);
    }
    if (data.cmd === 'stop') {
      clearInterval(iv);
      iv = null;
    }
  };
`;
const _workerBlob = new Blob([WORKER_CODE], { type: 'application/javascript' });
const pomWorker   = new Worker(URL.createObjectURL(_workerBlob));

// Estado do pomodoro (não persiste — recomeça ao recarregar)
const POM = {
  fase:       'foco',       // 'foco' | 'pausa_curta' | 'pausa_longa'
  cicloAtual: 0,            // 0-based, reseta após pausa_longa
  rodando:    false,
  segundos:   0,            // tempo restante
  tarefaId:   null,         // tarefa atualmente em foco
  logAtualId: null,         // id do pomodoro_log em curso
  autoStartTimer: null,     // setTimeout para auto-iniciar próxima fase
};

function pomSegsTotal() {
  const c = STATE.config;
  if (POM.fase === 'foco')        return c.pomodoro_foco_min * 60;
  if (POM.fase === 'pausa_curta') return c.pomodoro_pausa_curta_min * 60;
  return c.pomodoro_pausa_longa_min * 60;
}

function pomIniciar(tarefaId) {
  if (tarefaId) POM.tarefaId = tarefaId;
  if (POM.segundos === 0) POM.segundos = pomSegsTotal();
  POM.rodando = true;

  // Criar entrada no log
  if (POM.fase === 'foco') {
    POM.logAtualId = uuid();
    STATE.pomodoros_log.push({
      id: POM.logAtualId,
      tarefa_id:   POM.tarefaId,
      frente_id:   STATE.tarefas.find(t => t.id === POM.tarefaId)?.frente_id ?? null,
      iniciado_em: new Date().toISOString(),
      concluido_em: null,
      tipo: 'foco',
      interrompido: false,
      nota: null,
    });
    salvar();
  }

  pomWorker.postMessage({ cmd: 'start' });
  renderTimerDisplay();
}

function pomPausar() {
  POM.rodando = false;
  pomWorker.postMessage({ cmd: 'stop' });
  // Marcar pomodoro como interrompido se estava em foco
  if (POM.fase === 'foco' && POM.logAtualId) {
    const log = STATE.pomodoros_log.find(l => l.id === POM.logAtualId);
    if (log) { log.interrompido = true; log.concluido_em = new Date().toISOString(); }
    POM.logAtualId = null;
    salvar();
  }
  renderTimerDisplay();
}

function pomResetar() {
  pomPausar();
  POM.segundos    = pomSegsTotal();
  POM.logAtualId  = null;
  renderTimerDisplay();
}

function pomPularFase() {
  pomParar();
  pomAvancarFase(false);
}

function pomParar() {
  POM.rodando = false;
  pomWorker.postMessage({ cmd: 'stop' });
  clearTimeout(POM.autoStartTimer);
}

function pomAvancarFase(foiProdutivo = true) {
  const cfg = STATE.config;

  if (POM.fase === 'foco') {
    // Concluir entrada no log
    if (POM.logAtualId) {
      const log = STATE.pomodoros_log.find(l => l.id === POM.logAtualId);
      if (log) {
        log.concluido_em = new Date().toISOString();
        log.interrompido = !foiProdutivo;
      }
      // Incrementar pomodoros usados na tarefa
      if (foiProdutivo && POM.tarefaId) {
        const t = STATE.tarefas.find(x => x.id === POM.tarefaId);
        if (t) t.pomodoros_usados++;
      }
      POM.logAtualId = null;
    }
    POM.cicloAtual++;
    POM.fase = (POM.cicloAtual % cfg.ciclos_ate_pausa_longa === 0) ? 'pausa_longa' : 'pausa_curta';
    salvar();
    renderTimerDisplay();
    if (cfg.auto_start_delay_s > 0) {
      POM.autoStartTimer = setTimeout(() => pomIniciar(), cfg.auto_start_delay_s * 1000);
    }
  } else {
    // Pausa concluída → volta para foco
    if (POM.fase === 'pausa_longa') POM.cicloAtual = 0;
    POM.fase = 'foco';
    POM.segundos = pomSegsTotal();
    salvar();
    renderTimerDisplay();
    if (cfg.auto_start_delay_s > 0) {
      POM.autoStartTimer = setTimeout(() => pomIniciar(), cfg.auto_start_delay_s * 1000);
    }
  }
}

pomWorker.onmessage = ({ data }) => {
  if (!data.tick) return;
  POM.segundos--;
  renderTimerDisplay();

  if (POM.segundos <= 0) {
    pomParar();
    const ehFoco = POM.fase === 'foco';
    if (ehFoco) {
      beepFoco();
      notificar('Pomodoro concluído! 🍅', 'Foi produtivo?');
      // Mostrar modal de confirmação
      abrirModalPomodoroConcluido();
    } else {
      beepPausa();
      notificar('Pausa concluída', 'Hora de focar!');
      pomAvancarFase(true);
    }
  }
};

function abrirModalPomodoroConcluido() {
  abrirModal(`
    <div class="modal-title">Pomodoro concluído! 🍅</div>
    <p style="color:var(--text-muted);margin-bottom:20px">Como foi?</p>
    <div class="flex gap-8" style="margin-bottom:12px">
      <button class="btn btn-primary" style="flex:1" onclick="confirmarPomodoro(true, null)">Sim, foi produtivo</button>
      <button class="btn btn-ghost" style="flex:1" onclick="confirmarPomodoro(false, null)">Não muito</button>
    </div>
    <div class="form-row">
      <label class="form-label">Nota (opcional)</label>
      <input class="input" id="pom-nota" placeholder="O que fiz nesse ciclo...">
    </div>
    <button class="btn btn-ghost btn-sm" style="width:100%" onclick="confirmarPomodoro(true, document.getElementById('pom-nota').value)">Salvar com nota</button>
  `);
}

function confirmarPomodoro(foiProdutivo, nota) {
  if (nota !== null && nota !== undefined) {
    const log = STATE.pomodoros_log.find(l => l.id === POM.logAtualId);
    if (log && nota.trim()) log.nota = nota.trim();
  }
  fecharModal();
  pomAvancarFase(foiProdutivo);
  renderHoje();
}
```

- [ ] **Step 2: Verificar no console**

```js
// Timer deve rodar em background (mude para outra aba e volte)
pomIniciar()    // deve começar contagem
POM.rodando     // true
POM.fase        // 'foco'
pomPausar()     // deve parar
pomResetar()    // POM.segundos volta ao total
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: POMODORO — Web Worker Blob, state machine, beep, modal conclusão"
```

---

## Task 6: Aba Hoje — Timer UI

**Files:**
- Modify: `index.html` (substituir função stub `renderHoje` e adicionar CSS)

- [ ] **Step 1: Adicionar CSS do timer na tag `<style>` (antes de `@media`)**

```css
/* ─── ABA HOJE ───────────────────────── */
.hoje-grid {
  display: grid;
  grid-template-columns: 40% 35% 25%;
  gap: 0;
  min-height: calc(100vh - 44px);
}
.hoje-col {
  padding: 20px 16px;
  border-right: 1px solid var(--border);
}
.hoje-col:last-child { border-right: none; }

/* Timer */
.timer-display {
  font-family: 'Courier New', monospace;
  font-size: 72px;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
  letter-spacing: -2px;
  text-align: center;
}
.timer-fase {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  text-align: center;
  margin-bottom: 16px;
}
.timer-fase.foco        { color: #1d9e75; }
.timer-fase.pausa_curta { color: #378add; }
.timer-fase.pausa_longa { color: #534ab7; }
.ciclo-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}
.ciclo-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--border);
  transition: background 300ms;
}
.ciclo-dot.ativo { background: #1d9e75; }
.timer-controles {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
}

/* Bloco horário */
.bloco-horario {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  margin-bottom: 12px;
  overflow: hidden;
  transition: border-color 200ms;
}
.bloco-horario.ativo { border-color: var(--accent); }
.bloco-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  cursor: pointer;
  user-select: none;
}
.bloco-header:hover { background: var(--surface-hover); }
.bloco-corpo { border-top: 1px solid var(--border); padding: 8px; }
.bloco-corpo.collapsed { display: none; }

/* Item tarefa */
.tarefa-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface-hover);
  border-radius: 6px;
  padding: 8px 10px;
  margin-bottom: 6px;
}
.tarefa-item input[type=checkbox] { flex-shrink: 0; }
.tarefa-titulo {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tarefa-titulo.concluida { text-decoration: line-through; color: var(--text-muted); }
.carried-badge {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  background: #ba751722;
  color: #ba7517;
}

@media (max-width: 768px) {
  .hoje-grid { grid-template-columns: 1fr; }
  .hoje-col  { border-right: none; border-bottom: 1px solid var(--border); }
  .timer-display { font-size: 56px; }
}
```

- [ ] **Step 2: Substituir a função stub `renderHoje`**

```js
function renderHoje() {
  const hoje = hojeISO();
  const blocoVigente = blocoAtual();

  // Garantir que existe a estrutura do dia
  if (!STATE.metas_diarias[hoje]) {
    STATE.metas_diarias[hoje] = { meta_principal: '', frentes: {}, habitos: { exercicio: false, leitura: false, agua: 0, sono: false } };
    salvar();
  }
  const diaState = STATE.metas_diarias[hoje];

  document.getElementById('tab-hoje').innerHTML = `
    <div class="hoje-grid">
      <!-- Coluna 1: Pipeline -->
      <div class="hoje-col">
        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Pipeline</div>
        <div style="font-size:18px;font-weight:600;margin-bottom:16px">${formatarData(hoje)}</div>
        ${['manha','tarde','noite'].map(b => renderBloco(b, blocoVigente === b)).join('')}
      </div>

      <!-- Coluna 2: Timer -->
      <div class="hoje-col" id="col-timer" style="display:flex;flex-direction:column;align-items:center;justify-content:center">
        ${renderTimerHTML()}
      </div>

      <!-- Coluna 3: Metas + Hábitos -->
      <div class="hoje-col">
        ${renderMetasHabitos(diaState)}
      </div>
    </div>
  `;

  // Re-bind select de tarefa após render
  const sel = document.getElementById('timer-tarefa-sel');
  if (sel && POM.tarefaId) sel.value = POM.tarefaId;
}
```

- [ ] **Step 3: Adicionar a função `renderTimerHTML`**

```js
function renderTimerHTML() {
  const maxCiclos = STATE.config.ciclos_ate_pausa_longa;
  const dots = Array.from({ length: maxCiclos }, (_, i) =>
    `<div class="ciclo-dot ${i < POM.cicloAtual % maxCiclos ? 'ativo' : ''}"></div>`
  ).join('');

  const tarefasDisp = STATE.tarefas.filter(t =>
    t.data_planejada === hojeISO() && t.status !== 'concluida'
  );
  const opcoesTarefas = tarefasDisp.map(t => {
    const fr = frente(t.frente_id);
    return `<option value="${t.id}" ${t.id === POM.tarefaId ? 'selected' : ''}>${t.titulo}${fr ? ' ('+fr.nome+')' : ''}</option>`;
  }).join('');

  return `
    <div class="timer-fase ${POM.fase}" id="timer-fase-label">
      ${POM.fase === 'foco' ? '● FOCO' : POM.fase === 'pausa_curta' ? '● PAUSA CURTA' : '● PAUSA LONGA'}
    </div>
    <div class="timer-display" id="timer-display">${formatarTempo(POM.segundos || pomSegsTotal())}</div>
    <div class="ciclo-dots">${dots}</div>
    <div style="width:100%;margin-bottom:16px">
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Tarefa em foco</div>
      <select class="input" id="timer-tarefa-sel" onchange="POM.tarefaId=this.value">
        <option value="">— selecionar —</option>
        ${opcoesTarefas}
      </select>
    </div>
    <div class="timer-controles">
      <button class="btn btn-primary" id="btn-timer-play" onclick="toggleTimer()">
        ${POM.rodando ? 'Pausar' : 'Iniciar'}
      </button>
      <button class="btn btn-ghost" onclick="pomResetar();renderTimerDisplay()" title="Resetar">↺</button>
      <button class="btn btn-ghost" onclick="pomPularFase();renderTimerDisplay()" title="Pular fase">⏭</button>
    </div>
  `;
}

function renderTimerDisplay() {
  // Atualização leve — só os elementos que mudam tick a tick
  const display = document.getElementById('timer-display');
  if (display) display.textContent = formatarTempo(POM.segundos || pomSegsTotal());
  const playBtn = document.getElementById('btn-timer-play');
  if (playBtn) playBtn.textContent = POM.rodando ? 'Pausar' : 'Iniciar';
  const faseLabel = document.getElementById('timer-fase-label');
  if (faseLabel) {
    faseLabel.className = `timer-fase ${POM.fase}`;
    faseLabel.textContent = POM.fase === 'foco' ? '● FOCO' : POM.fase === 'pausa_curta' ? '● PAUSA CURTA' : '● PAUSA LONGA';
  }
}

function toggleTimer() {
  if (POM.rodando) pomPausar();
  else pomIniciar(document.getElementById('timer-tarefa-sel')?.value || POM.tarefaId);
}
```

- [ ] **Step 4: Verificar no browser**

1. Aba Hoje deve mostrar 3 colunas
2. Coluna central: display `25:00`, botão Iniciar
3. Clicar Iniciar: contagem começa, botão vira "Pausar"
4. Mudar para outra aba do browser por 10s e voltar: contagem deve ter continuado
5. Clicar ⏭ deve avançar de fase (foco → pausa curta)
6. Sem erros no console

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: timer UI — display, ciclos, controles, seleção de tarefa"
```

---

## Task 7: Aba Hoje — Pipeline (blocos + tarefas)

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Adicionar funções `renderBloco` e `renderTarefaItem`**

```js
function renderBloco(nomeBloco, ativo) {
  const nomes = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };
  const h = STATE.config.horarios[nomeBloco];
  const cap = capacidadeBloco(h.inicio, h.fim,
    STATE.config.pomodoro_foco_min, STATE.config.pomodoro_pausa_curta_min);
  const tarefas = tarefasHoje(nomeBloco);
  const colapsado = false; // sempre aberto por padrão

  return `
    <div class="bloco-horario ${ativo ? 'ativo' : ''}" id="bloco-${nomeBloco}">
      <div class="bloco-header" onclick="toggleBloco('${nomeBloco}')">
        <div>
          <span style="font-size:13px;font-weight:600">${nomes[nomeBloco]}</span>
          <span style="font-size:12px;color:var(--text-muted);margin-left:8px">${h.inicio}–${h.fim} · ${cap}🍅</span>
        </div>
        <span id="bloco-arrow-${nomeBloco}" style="color:var(--text-muted);font-size:12px">▼</span>
      </div>
      <div class="bloco-corpo" id="bloco-corpo-${nomeBloco}">
        ${tarefas.map(t => renderTarefaItem(t)).join('')}
        ${tarefas.length === 0 ? `<div style="font-size:12px;color:var(--text-muted);padding:8px 4px">Nenhuma tarefa planejada</div>` : ''}
        <button class="btn btn-ghost btn-sm"
          style="width:100%;border-style:dashed;margin-top:4px;color:var(--text-muted)"
          onclick="abrirModalNovaTarefa('${nomeBloco}')">
          + Adicionar tarefa
        </button>
      </div>
    </div>
  `;
}

function renderTarefaItem(t) {
  const fr = frente(t.frente_id);
  const cor = fr?.cor ?? '#888';
  const badgeFrente = fr
    ? `<span class="badge" style="background:${cor}22;color:${cor};flex-shrink:0">${fr.nome}</span>`
    : '';
  const badgeOntem = t.carried_over
    ? `<span class="carried-badge">ontem</span>`
    : '';
  const concluida = t.status === 'concluida';

  return `
    <div class="tarefa-item" id="ti-${t.id}">
      <input type="checkbox" ${concluida ? 'checked' : ''}
        style="accent-color:${cor}"
        onchange="toggleTarefaStatus('${t.id}', this.checked)">
      <span class="tarefa-titulo ${concluida ? 'concluida' : ''}">${t.titulo}</span>
      ${badgeOntem}
      ${badgeFrente}
      <span style="font-size:11px;color:var(--text-muted);flex-shrink:0" title="Pomodoros">🍅×${t.estimativa_pomodoros}</span>
      <button class="btn btn-ghost btn-sm" style="flex-shrink:0;padding:3px 7px"
        onclick="pomIniciar('${t.id}');document.getElementById('timer-tarefa-sel') && (document.getElementById('timer-tarefa-sel').value='${t.id}')"
        title="Iniciar pomodoro">▶</button>
      <button class="btn btn-ghost btn-sm" style="flex-shrink:0;padding:3px 7px"
        onclick="abrirMenuMover('${t.id}')"
        title="Mover para outro bloco">↕</button>
    </div>
  `;
}

function toggleBloco(nome) {
  const corpo = document.getElementById(`bloco-corpo-${nome}`);
  const arrow = document.getElementById(`bloco-arrow-${nome}`);
  const colapsado = corpo.classList.toggle('collapsed');
  arrow.textContent = colapsado ? '▶' : '▼';
}

function toggleTarefaStatus(id, concluida) {
  const t = STATE.tarefas.find(x => x.id === id);
  if (!t) return;
  t.status       = concluida ? 'concluida' : 'pendente';
  t.concluida_em = concluida ? new Date().toISOString() : null;
  salvar();
  renderHoje();
}

function abrirMenuMover(tarefaId) {
  const nomes = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };
  abrirModal(`
    <div class="modal-title">Mover tarefa para</div>
    <div class="flex flex-col gap-8">
      ${Object.entries(nomes).map(([k, v]) => `
        <button class="btn btn-ghost" onclick="moverTarefa('${tarefaId}','${k}')">
          ${v} (${STATE.config.horarios[k].inicio}–${STATE.config.horarios[k].fim})
        </button>
      `).join('')}
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="fecharModal()">Cancelar</button>
    </div>
  `);
}

function moverTarefa(id, bloco) {
  const t = STATE.tarefas.find(x => x.id === id);
  if (t) { t.horario_sugerido = bloco; salvar(); }
  fecharModal();
  renderHoje();
}
```

- [ ] **Step 2: Adicionar modal de nova tarefa**

```js
function abrirModalNovaTarefa(blocoDefault) {
  const frentesAtivas = STATE.frentes.filter(f => f.ativa);
  abrirModal(`
    <div class="modal-title">Nova tarefa</div>
    <div class="form-row">
      <label class="form-label">Título</label>
      <input class="input" id="nt-titulo" placeholder="O que precisa ser feito?">
    </div>
    <div class="form-row">
      <label class="form-label">Descrição (opcional)</label>
      <textarea class="input" id="nt-desc" placeholder="Detalhes..."></textarea>
    </div>
    <div class="form-row">
      <label class="form-label">Frente</label>
      <select class="input" id="nt-frente">
        <option value="">— sem frente —</option>
        ${frentesAtivas.map(f => `<option value="${f.id}">${f.nome}</option>`).join('')}
      </select>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="form-row">
        <label class="form-label">Prioridade</label>
        <select class="input" id="nt-prio">
          <option value="alta">Alta</option>
          <option value="media" selected>Média</option>
          <option value="baixa">Baixa</option>
        </select>
      </div>
      <div class="form-row">
        <label class="form-label">Pomodoros estimados</label>
        <input class="input" id="nt-poms" type="number" min="1" max="12" value="2">
      </div>
    </div>
    <div class="form-row">
      <label class="form-label">Bloco de horário</label>
      <select class="input" id="nt-bloco">
        <option value="manha" ${blocoDefault === 'manha' ? 'selected' : ''}>Manhã</option>
        <option value="tarde" ${blocoDefault === 'tarde' ? 'selected' : ''}>Tarde</option>
        <option value="noite" ${blocoDefault === 'noite' ? 'selected' : ''}>Noite</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="fecharModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="criarTarefa()">Criar</button>
    </div>
  `);
}

function criarTarefa(frenteIdOverride, dataOverride) {
  const titulo = document.getElementById('nt-titulo')?.value?.trim();
  if (!titulo) { alert('Digite um título.'); return; }
  const t = {
    id:                   uuid(),
    frente_id:            document.getElementById('nt-frente')?.value || frenteIdOverride || null,
    titulo,
    descricao:            document.getElementById('nt-desc')?.value?.trim() || '',
    prioridade:           document.getElementById('nt-prio')?.value || 'media',
    status:               'pendente',
    criada_em:            new Date().toISOString(),
    concluida_em:         null,
    estimativa_pomodoros: parseInt(document.getElementById('nt-poms')?.value) || 2,
    pomodoros_usados:     0,
    horario_sugerido:     document.getElementById('nt-bloco')?.value || 'manha',
    data_planejada:       dataOverride || hojeISO(),
    carried_over:         false,
    data_planejada_original: null,
  };
  STATE.tarefas.push(t);
  salvar();
  fecharModal();
  renderHoje();
}
```

- [ ] **Step 3: Verificar no browser**

1. Aba Hoje → coluna esquerda mostra os 3 blocos com "Manhã / Tarde / Noite"
2. Clicar no header do bloco: colapsa e expande (▼/▶)
3. Clicar "+ Adicionar tarefa" → modal abre com formulário completo
4. Criar uma tarefa → aparece no bloco correto com badge da frente
5. Clicar ↕ → modal de mover aparece com os 3 blocos → mover funciona
6. Marcar checkbox → tarefa fica com riscado

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: pipeline diário — blocos colapsáveis, tarefas, mover, criar"
```

---

## Task 8: Aba Hoje — Metas e Hábitos

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Adicionar função `renderMetasHabitos`**

```js
function renderMetasHabitos(diaState) {
  const hoje = hojeISO();
  const pomsHoje = STATE.pomodoros_log.filter(l =>
    l.iniciado_em?.startsWith(hoje) && !l.interrompido && l.tipo === 'foco'
  ).length;
  const tarefasConcluidasHoje = STATE.tarefas.filter(t =>
    t.data_planejada === hoje && t.status === 'concluida'
  ).length;
  const frentesHoje = new Set(
    STATE.pomodoros_log
      .filter(l => l.iniciado_em?.startsWith(hoje) && l.frente_id)
      .map(l => l.frente_id)
  ).size;

  const habLabels = { exercicio: 'Exercício', leitura: 'Leitura', sono: 'Sono > 7h' };

  return `
    <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Meta do dia</div>
    <textarea class="input" id="meta-principal" style="height:68px;resize:none"
      placeholder="Qual é o foco principal de hoje?"
      onblur="salvarMetaPrincipal(this.value)">${diaState.meta_principal || ''}</textarea>

    <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin:18px 0 10px">Hábitos</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${Object.entries(habLabels).map(([k, label]) => `
        <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">
          <input type="checkbox" ${diaState.habitos[k] ? 'checked' : ''}
            style="accent-color:var(--accent)"
            onchange="toggleHabito('${k}', this.checked)">
          ${label}
        </label>
      `).join('')}
      <!-- Água com contador -->
      <div style="display:flex;align-items:center;gap:8px;font-size:13px">
        <span style="flex:1">Água</span>
        <div style="display:flex;align-items:center;gap:6px">
          ${Array.from({ length: 8 }, (_, i) => `
            <div onclick="setAgua(${i+1})"
              style="width:10px;height:10px;border-radius:50%;cursor:pointer;
                     background:${i < (diaState.habitos.agua || 0) ? 'var(--accent)' : 'var(--border)'}"></div>
          `).join('')}
          <span style="font-size:12px;color:var(--text-muted);margin-left:2px">${diaState.habitos.agua || 0}/8</span>
        </div>
      </div>
    </div>

    <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
      <div style="font-size:11px;color:var(--text-muted)">Hoje você completou</div>
      <div style="font-size:22px;font-weight:700;margin:4px 0">${pomsHoje} 🍅</div>
      <div style="font-size:12px;color:var(--text-muted)">${tarefasConcluidasHoje} tarefa${tarefasConcluidasHoje !== 1 ? 's' : ''} · ${frentesHoje} frente${frentesHoje !== 1 ? 's' : ''}</div>
    </div>
  `;
}

function salvarMetaPrincipal(valor) {
  const hoje = hojeISO();
  if (!STATE.metas_diarias[hoje]) return;
  STATE.metas_diarias[hoje].meta_principal = valor;
  salvar();
}

function toggleHabito(hab, valor) {
  const hoje = hojeISO();
  if (!STATE.metas_diarias[hoje]) return;
  STATE.metas_diarias[hoje].habitos[hab] = valor;
  salvar();
  renderHoje();
}

function setAgua(qtd) {
  const hoje = hojeISO();
  if (!STATE.metas_diarias[hoje]) return;
  // Clicar no copo já marcado desmarca (toggle: se clicar no último, zera)
  const atual = STATE.metas_diarias[hoje].habitos.agua || 0;
  STATE.metas_diarias[hoje].habitos.agua = atual === qtd ? qtd - 1 : qtd;
  salvar();
  renderHoje();
}
```

- [ ] **Step 2: Verificar no browser**

1. Coluna direita mostra meta, hábitos e contadores
2. Digitar na meta e clicar fora: persiste após F5
3. Checkboxes dos hábitos: persiste após F5
4. Bolinhas de água: clicar incrementa, clicar na última desmarca
5. Contador "Hoje você completou" muda conforme pomodoros e tarefas

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: metas diárias + hábitos + contador água + resumo do dia"
```

---

## Task 9: Aba Frentes

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Adicionar CSS de frentes na `<style>`**

```css
/* ─── ABA FRENTES ─────────────────────── */
.frente-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  border-left-width: 4px;
  margin-bottom: 12px;
  overflow: hidden;
}
.frente-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}
.frente-tarefas-inline {
  border-top: 1px solid var(--border);
  padding: 8px 12px;
  display: none;
}
.frente-tarefas-inline.aberta { display: block; }

.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 22px;
  background: var(--accent);
  color: #fff;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 50;
}
```

- [ ] **Step 2: Substituir a função stub `renderFrentes`**

```js
function renderFrentes() {
  let filtroAtivo = 'todas'; // controlado por closure

  const renderConteudo = () => {
    const frentes = STATE.frentes.filter(f =>
      filtroAtivo === 'todas' ? true : f.tipo === filtroAtivo
    );
    return `
      <div style="margin-bottom:16px;display:flex;gap:8px">
        ${['todas','paralelo','consultor'].map(t => `
          <button class="btn ${filtroAtivo === t ? 'btn-primary' : 'btn-ghost'} btn-sm"
            onclick="filtroFrentes('${t}')">
            ${t === 'todas' ? 'Todas' : t === 'paralelo' ? 'Paralelo' : 'Consultor'}
          </button>
        `).join('')}
      </div>
      <div id="frentes-lista">
        ${frentes.map(f => renderFrenteCard(f)).join('')}
      </div>
      <button class="fab" onclick="abrirModalNovaFrente()" title="Nova frente">+</button>
    `;
  };

  document.getElementById('tab-frentes').innerHTML = renderConteudo();
}

window.filtroFrentes = function(tipo) {
  // Re-render com novo filtro
  const lista = document.getElementById('frentes-lista');
  if (!lista) return;
  const frentes = STATE.frentes.filter(f => tipo === 'todas' ? true : f.tipo === tipo);
  lista.innerHTML = frentes.map(f => renderFrenteCard(f)).join('');
  // Atualizar botões
  document.querySelectorAll('[onclick^="filtroFrentes"]').forEach(b => {
    const t = b.getAttribute('onclick').match(/'(\w+)'/)[1];
    b.className = `btn ${t === tipo ? 'btn-primary' : 'btn-ghost'} btn-sm`;
  });
};

function renderFrenteCard(f) {
  const hoje = new Date();
  const h30  = new Date(hoje); h30.setDate(h30.getDate() - 30);
  const pomsMes = STATE.pomodoros_log.filter(l =>
    l.frente_id === f.id && new Date(l.iniciado_em) >= h30 && !l.interrompido
  ).length;
  const tAll        = STATE.tarefas.filter(t => t.frente_id === f.id);
  const tPendente   = tAll.filter(t => t.status === 'pendente').length;
  const tAndamento  = tAll.filter(t => t.status === 'em_andamento').length;
  const tConcluida  = tAll.filter(t => t.status === 'concluida').length;

  return `
    <div class="frente-card" style="border-left-color:${f.cor}">
      <div class="frente-card-header">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="font-size:15px;font-weight:600">${f.nome}</span>
            <span class="badge" style="background:${f.cor}22;color:${f.cor}">${f.tipo}</span>
            ${!f.ativa ? '<span class="badge" style="background:var(--border);color:var(--text-muted)">inativa</span>' : ''}
          </div>
          <div style="font-size:12px;color:var(--text-muted)">
            ${tPendente} pendente · ${tAndamento} andamento · ${tConcluida} concluída · ${pomsMes}🍅 este mês
          </div>
        </div>
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
          <input type="checkbox" ${f.ativa ? 'checked' : ''}
            style="accent-color:${f.cor}"
            onchange="toggleFrenteAtiva('${f.id}', this.checked)">
          ativa
        </label>
      </div>
      <div style="padding:0 16px 12px;display:flex;gap:8px">
        <button class="btn btn-ghost btn-sm" onclick="toggleTarefasFrente('${f.id}')">Ver tarefas</button>
        <button class="btn btn-ghost btn-sm" onclick="abrirModalNovaTarefaFrente('${f.id}')">+ Tarefa rápida</button>
      </div>
      <div class="frente-tarefas-inline" id="ft-${f.id}">
        ${STATE.tarefas.filter(t => t.frente_id === f.id && t.status !== 'concluida').map(t => `
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
            <input type="checkbox" style="accent-color:${f.cor}"
              onchange="toggleTarefaStatus('${t.id}',this.checked)">
            <span style="flex:1;font-size:13px">${t.titulo}</span>
            <span style="font-size:11px;color:var(--text-muted)">🍅×${t.estimativa_pomodoros}</span>
          </div>
        `).join('') || '<div style="font-size:12px;color:var(--text-muted);padding:8px 0">Sem tarefas pendentes</div>'}
      </div>
    </div>
  `;
}

function toggleFrenteAtiva(id, ativa) {
  const f = STATE.frentes.find(x => x.id === id);
  if (f) { f.ativa = ativa; salvar(); }
}

function toggleTarefasFrente(id) {
  const el = document.getElementById(`ft-${id}`);
  if (el) el.classList.toggle('aberta');
}

function abrirModalNovaTarefaFrente(frenteId) {
  const frentesAtivas = STATE.frentes.filter(f => f.ativa);
  abrirModal(`
    <div class="modal-title">Nova tarefa</div>
    <div class="form-row">
      <label class="form-label">Título</label>
      <input class="input" id="nt-titulo" placeholder="O que precisa ser feito?">
    </div>
    <div class="form-row">
      <label class="form-label">Descrição (opcional)</label>
      <textarea class="input" id="nt-desc" placeholder="Detalhes..."></textarea>
    </div>
    <div class="form-row">
      <label class="form-label">Frente</label>
      <select class="input" id="nt-frente">
        ${frentesAtivas.map(f => `<option value="${f.id}" ${f.id === frenteId ? 'selected' : ''}>${f.nome}</option>`).join('')}
      </select>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="form-row">
        <label class="form-label">Prioridade</label>
        <select class="input" id="nt-prio">
          <option value="alta">Alta</option>
          <option value="media" selected>Média</option>
          <option value="baixa">Baixa</option>
        </select>
      </div>
      <div class="form-row">
        <label class="form-label">Pomodoros estimados</label>
        <input class="input" id="nt-poms" type="number" min="1" max="12" value="2">
      </div>
    </div>
    <div class="form-row">
      <label class="form-label">Bloco de horário</label>
      <select class="input" id="nt-bloco">
        <option value="manha">Manhã</option>
        <option value="tarde">Tarde</option>
        <option value="noite">Noite</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="fecharModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="criarTarefa()">Criar</button>
    </div>
  `);
}

function abrirModalNovaFrente() {
  abrirModal(`
    <div class="modal-title">Nova frente</div>
    <div class="form-row">
      <label class="form-label">Nome</label>
      <input class="input" id="nf-nome" placeholder="Ex: Newsletter">
    </div>
    <div class="form-row">
      <label class="form-label">Tipo</label>
      <select class="input" id="nf-tipo">
        <option value="paralelo">Paralelo</option>
        <option value="consultor">Consultor</option>
      </select>
    </div>
    <div class="form-row">
      <label class="form-label">Cor</label>
      <input class="input" id="nf-cor" type="color" value="#1d9e75" style="height:38px;padding:4px">
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="fecharModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="criarFrente()">Criar</button>
    </div>
  `);
}

function criarFrente() {
  const nome = document.getElementById('nf-nome').value.trim();
  if (!nome) { alert('Digite um nome.'); return; }
  STATE.frentes.push({
    id:   nome.toLowerCase().replace(/\s+/g,'_') + '_' + Date.now(),
    nome,
    tipo: document.getElementById('nf-tipo').value,
    cor:  document.getElementById('nf-cor').value,
    ativa: true,
  });
  salvar();
  fecharModal();
  renderFrentes();
}
```

- [ ] **Step 3: Verificar no browser**

1. Aba Frentes → lista de cards com faixa colorida à esquerda
2. Toggle filtros Paralelo/Consultor/Todas funciona
3. Toggle "ativa" persiste após F5
4. "Ver tarefas" expande inline
5. "+ Tarefa rápida" abre modal com frente pré-selecionada
6. FAB "+" → modal nova frente → frente aparece na lista

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: aba Frentes — cards, filtros, inline tasks, nova frente"
```

---

## Task 10: Aba Tarefas

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Adicionar CSS da aba Tarefas**

```css
/* ─── ABA TAREFAS ─────────────────────── */
.tabela-tarefas { width: 100%; border-collapse: collapse; font-size: 13px; }
.tabela-tarefas th {
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--text-muted);
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
}
.tabela-tarefas td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.tabela-tarefas tr:hover td { background: var(--surface-hover); }
.filtros-barra {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  align-items: center;
}
.filtros-barra .input { width: auto; }
```

- [ ] **Step 2: Adicionar variáveis globais de filtro antes de `renderTarefas`**

Adicione estas duas linhas imediatamente **antes** do comentário `// ═══════════════ RENDER ══════════════`:

```js
const FILTROS    = { frentes: [], status: '', prioridade: '', horario: '', busca: '' };
const SELECIONADAS = new Set();
```

- [ ] **Step 3: Substituir a função stub `renderTarefas`**

```js

function renderTarefas() {
  const frentesAtivas = STATE.frentes;

  document.getElementById('tab-tarefas').innerHTML = `
    <div class="filtros-barra">
      <input class="input" style="width:200px" placeholder="Buscar..." id="f-busca"
        value="${FILTROS.busca}" oninput="FILTROS.busca=this.value;renderListaTarefas()">
      <select class="input" id="f-status" onchange="FILTROS.status=this.value;renderListaTarefas()">
        <option value="">Todos os status</option>
        <option value="pendente"    ${FILTROS.status==='pendente'    ? 'selected':''}>Pendente</option>
        <option value="em_andamento"${FILTROS.status==='em_andamento'? 'selected':''}>Em andamento</option>
        <option value="concluida"   ${FILTROS.status==='concluida'   ? 'selected':''}>Concluída</option>
      </select>
      <select class="input" id="f-prio" onchange="FILTROS.prioridade=this.value;renderListaTarefas()">
        <option value="">Toda prioridade</option>
        <option value="alta"  ${FILTROS.prioridade==='alta'  ? 'selected':''}>Alta</option>
        <option value="media" ${FILTROS.prioridade==='media' ? 'selected':''}>Média</option>
        <option value="baixa" ${FILTROS.prioridade==='baixa' ? 'selected':''}>Baixa</option>
      </select>
      <select class="input" id="f-horario" onchange="FILTROS.horario=this.value;renderListaTarefas()">
        <option value="">Todo horário</option>
        <option value="manha" ${FILTROS.horario==='manha' ? 'selected':''}>Manhã</option>
        <option value="tarde" ${FILTROS.horario==='tarde' ? 'selected':''}>Tarde</option>
        <option value="noite" ${FILTROS.horario==='noite' ? 'selected':''}>Noite</option>
      </select>
      <button class="btn btn-primary btn-sm" onclick="abrirModalNovaTarefa('manha')">+ Nova tarefa</button>
    </div>
    <div id="bulk-actions" style="display:none;margin-bottom:12px;display:flex;gap:8px;align-items:center">
      <span id="bulk-count" style="font-size:13px;color:var(--text-muted)">0 selecionadas</span>
      <button class="btn btn-ghost btn-sm" onclick="bulkConcluir()">Marcar concluída</button>
      <button class="btn btn-danger btn-sm" onclick="bulkDeletar()">Deletar</button>
      <button class="btn btn-ghost btn-sm" onclick="SELECIONADAS.clear();renderListaTarefas()">Limpar</button>
    </div>
    <div id="lista-tarefas-wrap" style="overflow-x:auto"></div>
  `;

  renderListaTarefas();
}

function tarefasFiltradas() {
  return STATE.tarefas.filter(t => {
    if (FILTROS.frentes.length && !FILTROS.frentes.includes(t.frente_id)) return false;
    if (FILTROS.status    && t.status    !== FILTROS.status)    return false;
    if (FILTROS.prioridade&& t.prioridade!== FILTROS.prioridade)return false;
    if (FILTROS.horario   && t.horario_sugerido !== FILTROS.horario) return false;
    if (FILTROS.busca && !t.titulo.toLowerCase().includes(FILTROS.busca.toLowerCase())) return false;
    return true;
  });
}

function renderListaTarefas() {
  const tarefas = tarefasFiltradas();
  const bulk = document.getElementById('bulk-actions');
  const bulkCount = document.getElementById('bulk-count');
  if (bulk) {
    bulk.style.display = SELECIONADAS.size > 0 ? 'flex' : 'none';
    if (bulkCount) bulkCount.textContent = `${SELECIONADAS.size} selecionada${SELECIONADAS.size !== 1 ? 's' : ''}`;
  }

  const html = `
    <table class="tabela-tarefas">
      <thead>
        <tr>
          <th style="width:32px"><input type="checkbox" onchange="selecionarTodas(this.checked)"></th>
          <th>Tarefa</th>
          <th>Frente</th>
          <th>Status</th>
          <th>Prioridade</th>
          <th>🍅</th>
          <th>Horário</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${tarefas.map(t => {
          const fr = frente(t.frente_id);
          const cor = fr?.cor ?? '#888';
          const nomeHorario = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };
          return `
            <tr>
              <td><input type="checkbox" ${SELECIONADAS.has(t.id) ? 'checked' : ''}
                onchange="toggleSelecionada('${t.id}', this.checked)"></td>
              <td>
                <div style="font-weight:500">${t.titulo}</div>
                ${t.descricao ? `<div style="font-size:11px;color:var(--text-muted)">${t.descricao}</div>` : ''}
                ${t.carried_over ? `<span class="carried-badge">ontem</span>` : ''}
              </td>
              <td>${fr ? `<span class="badge" style="background:${cor}22;color:${cor}">${fr.nome}</span>` : '—'}</td>
              <td>
                <select class="input" style="width:120px;padding:4px 6px;font-size:12px"
                  onchange="alterarStatusTarefa('${t.id}', this.value)">
                  <option value="pendente"     ${t.status==='pendente'     ? 'selected':''}>Pendente</option>
                  <option value="em_andamento" ${t.status==='em_andamento' ? 'selected':''}>Em andamento</option>
                  <option value="concluida"    ${t.status==='concluida'    ? 'selected':''}>Concluída</option>
                </select>
              </td>
              <td>
                <span class="badge" style="background:${t.prioridade==='alta'?'#a32d2d22':t.prioridade==='media'?'#ba751722':'#33333322'};color:${t.prioridade==='alta'?'#e55':t.prioridade==='media'?'#ba7517':'var(--text-muted)'}">
                  ${t.prioridade}
                </span>
              </td>
              <td style="font-size:12px">${t.pomodoros_usados}/${t.estimativa_pomodoros}</td>
              <td style="font-size:12px;color:var(--text-muted)">${nomeHorario[t.horario_sugerido] ?? '—'}</td>
              <td>
                <button class="btn btn-ghost btn-sm" onclick="deletarTarefa('${t.id}')">✕</button>
              </td>
            </tr>
          `;
        }).join('')}
        ${tarefas.length === 0 ? `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-muted)">Nenhuma tarefa encontrada</td></tr>` : ''}
      </tbody>
    </table>
  `;

  const wrap = document.getElementById('lista-tarefas-wrap');
  if (wrap) wrap.innerHTML = html;
}

function alterarStatusTarefa(id, status) {
  const t = STATE.tarefas.find(x => x.id === id);
  if (!t) return;
  t.status       = status;
  t.concluida_em = status === 'concluida' ? new Date().toISOString() : null;
  salvar();
}

function deletarTarefa(id) {
  if (!confirm('Deletar esta tarefa?')) return;
  STATE.tarefas = STATE.tarefas.filter(t => t.id !== id);
  salvar();
  renderListaTarefas();
}

function toggleSelecionada(id, sel) {
  sel ? SELECIONADAS.add(id) : SELECIONADAS.delete(id);
  renderListaTarefas();
}

function selecionarTodas(sel) {
  tarefasFiltradas().forEach(t => sel ? SELECIONADAS.add(t.id) : SELECIONADAS.delete(t.id));
  renderListaTarefas();
}

function bulkConcluir() {
  SELECIONADAS.forEach(id => {
    const t = STATE.tarefas.find(x => x.id === id);
    if (t) { t.status = 'concluida'; t.concluida_em = new Date().toISOString(); }
  });
  SELECIONADAS.clear();
  salvar();
  renderListaTarefas();
}

function bulkDeletar() {
  if (!confirm(`Deletar ${SELECIONADAS.size} tarefa(s)?`)) return;
  STATE.tarefas = STATE.tarefas.filter(t => !SELECIONADAS.has(t.id));
  SELECIONADAS.clear();
  salvar();
  renderListaTarefas();
}
```

- [ ] **Step 3: Verificar no browser**

1. Aba Tarefas → tabela com filtros no topo
2. Criar tarefas na aba Hoje → aparecem aqui
3. Filtros de status, prioridade e busca funcionam
4. Select de status na tabela: trocar persiste após F5
5. Checkboxes de seleção + bulk actions (concluir/deletar)
6. Botão + Nova tarefa abre modal

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: aba Tarefas — tabela filtrável, bulk actions, edição inline"
```

---

## Task 11: Aba Estatísticas

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Adicionar CSS de estatísticas**

```css
/* ─── ABA STATS ──────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-width: 900px;
}
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 16px 20px;
}
.stat-card-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  margin-bottom: 12px;
}
/* Barras verticais (pomodoros por dia) */
.barras-verticais {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 80px;
  overflow-x: auto;
}
.barra-dia {
  flex: 1;
  min-width: 6px;
  max-width: 20px;
  background: var(--accent);
  border-radius: 3px 3px 0 0;
  transition: background 150ms;
  cursor: default;
}
.barra-dia:hover { background: #25c890; }
.barra-dia.hoje  { background: #534ab7; }
/* Barras horizontais (por frente) */
.barra-h-wrap { margin-bottom: 8px; }
.barra-h-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 3px;
}
.barra-h-track {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
}
.barra-h-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 300ms ease;
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Substituir a função stub `renderStats`**

```js
function renderStats() {
  const hoje = hojeISO();
  const todosLogs = STATE.pomodoros_log.filter(l => !l.interrompido && l.tipo === 'foco');

  // ── Pomodoros últimos 30 dias ────────────
  const dias30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
  const pomsPorDia = dias30.map(d => ({
    data:  d,
    count: todosLogs.filter(l => l.iniciado_em?.startsWith(d)).length,
  }));
  const maxPoms = Math.max(...pomsPorDia.map(x => x.count), 1);

  // ── Distribuição por frente ──────────────
  const porFrente = STATE.frentes.filter(f => f.ativa).map(f => ({
    frente: f,
    count:  todosLogs.filter(l => l.frente_id === f.id).length,
  })).filter(x => x.count > 0).sort((a,b) => b.count - a.count);
  const maxFrente = Math.max(...porFrente.map(x => x.count), 1);

  // ── Streak ──────────────────────────────
  let streak = 0;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    if (todosLogs.some(l => l.iniciado_em?.startsWith(iso))) streak++;
    else if (i < 29) break; // só conta streak contínuo até hoje
  }

  // ── Esta semana vs semana passada ────────
  const inicioSemana = (offset) => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay() - offset * 7);
    return d.toISOString().slice(0, 10);
  };
  const isNaSemana = (iso, offset) => {
    const s = new Date(inicioSemana(offset));
    const e = new Date(s); e.setDate(e.getDate() + 7);
    const d = new Date(iso);
    return d >= s && d < e;
  };
  const pomsSemAtu = todosLogs.filter(l => isNaSemana(l.iniciado_em, 0)).length;
  const pomsSemAnt = todosLogs.filter(l => isNaSemana(l.iniciado_em, 1)).length;
  const tarefasSemAtu = STATE.tarefas.filter(t => t.concluida_em && isNaSemana(t.concluida_em, 0)).length;
  const tarefasSemAnt = STATE.tarefas.filter(t => t.concluida_em && isNaSemana(t.concluida_em, 1)).length;

  // ── Hábitos (último mês) ─────────────────
  const diasComMeta = Object.keys(STATE.metas_diarias).filter(d => dias30.includes(d));
  const habLabels = { exercicio: 'Exercício', leitura: 'Leitura', sono: 'Sono > 7h' };
  const habStats = Object.entries(habLabels).map(([k, label]) => {
    const cumpridos = diasComMeta.filter(d => STATE.metas_diarias[d]?.habitos?.[k]).length;
    const pct = diasComMeta.length ? Math.round(cumpridos / diasComMeta.length * 100) : 0;
    return { label, pct };
  });

  const delta = (a, b) => a > b ? `▲ +${a-b}` : a < b ? `▼ -${b-a}` : '=';

  document.getElementById('tab-stats').innerHTML = `
    <div class="stats-grid">
      <!-- Pomodoros 30 dias -->
      <div class="stat-card" style="grid-column: 1 / -1">
        <div class="stat-card-title">Pomodoros — últimos 30 dias</div>
        <div class="barras-verticais">
          ${pomsPorDia.map(({ data, count }) => `
            <div class="barra-dia ${data === hoje ? 'hoje' : ''}"
              style="height:${count === 0 ? '2px' : Math.max(4, Math.round(count / maxPoms * 76)) + 'px'}"
              title="${data}: ${count}🍅"></div>
          `).join('')}
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px">← 30 dias atrás &nbsp;&nbsp;&nbsp; hoje (roxo) →</div>
      </div>

      <!-- Distribuição por frente -->
      <div class="stat-card">
        <div class="stat-card-title">Tempo por frente (total)</div>
        ${porFrente.length === 0
          ? '<div style="font-size:13px;color:var(--text-muted)">Sem dados ainda</div>'
          : porFrente.map(({ frente: f, count }) => `
            <div class="barra-h-wrap">
              <div class="barra-h-label">
                <span>${f.nome}</span>
                <span style="color:var(--text-muted)">${count}🍅</span>
              </div>
              <div class="barra-h-track">
                <div class="barra-h-fill"
                  style="width:${Math.round(count / maxFrente * 100)}%;background:${f.cor}"></div>
              </div>
            </div>
          `).join('')
        }
      </div>

      <!-- Semana atual vs anterior -->
      <div class="stat-card">
        <div class="stat-card-title">Esta semana vs semana passada</div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div>
            <div style="font-size:11px;color:var(--text-muted)">Pomodoros</div>
            <div style="font-size:20px;font-weight:700">${pomsSemAtu} 🍅</div>
            <div style="font-size:12px;color:${pomsSemAtu>=pomsSemAnt?'#1d9e75':'#e55'}">${delta(pomsSemAtu, pomsSemAnt)} vs semana anterior</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted)">Tarefas concluídas</div>
            <div style="font-size:20px;font-weight:700">${tarefasSemAtu}</div>
            <div style="font-size:12px;color:${tarefasSemAtu>=tarefasSemAnt?'#1d9e75':'#e55'}">${delta(tarefasSemAtu, tarefasSemAnt)} vs semana anterior</div>
          </div>
        </div>
      </div>

      <!-- Streak -->
      <div class="stat-card">
        <div class="stat-card-title">Streak atual</div>
        <div style="font-size:48px;font-weight:700;line-height:1">${streak}</div>
        <div style="font-size:13px;color:var(--text-muted);margin-top:4px">dias consecutivos com ≥ 1 🍅</div>
      </div>

      <!-- Hábitos -->
      <div class="stat-card">
        <div class="stat-card-title">Hábitos — últimos 30 dias</div>
        ${habStats.map(({ label, pct }) => `
          <div class="barra-h-wrap">
            <div class="barra-h-label">
              <span>${label}</span>
              <span style="color:var(--text-muted)">${pct}%</span>
            </div>
            <div class="barra-h-track">
              <div class="barra-h-fill"
                style="width:${pct}%;background:var(--accent)"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
```

- [ ] **Step 3: Verificar no browser**

1. Aba Estatísticas → 5 cards renderizando
2. Gráfico de barras verticais (dias): alturas proporcionais ao máximo
3. Barra do dia atual em roxo
4. Hover nas barras mostra tooltip com data e count
5. Distribuição por frente: barras horizontais com cor da frente
6. Streak, comparativo semana, hábitos todos com dados coerentes

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: aba Estatísticas — barras CSS, streak, comparativo, hábitos"
```

---

## Task 12: Atalhos de teclado + highlight de bloco

**Files:**
- Modify: `index.html` (seção `// EVENTS`)

- [ ] **Step 1: Adicionar listener de teclado na seção EVENTS**

```js
// ─── ATALHOS DE TECLADO ───────────────
document.addEventListener('keydown', (e) => {
  // Ignorar quando usuário está digitando
  const tag = document.activeElement?.tagName?.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

  if (e.code === 'Space') {
    e.preventDefault();
    toggleTimer();
  }
  if (e.key === 'n' || e.key === 'N') {
    abrirModalNovaTarefa(blocoAtual() || 'manha');
  }
  if (e.key === '1') switchTab('hoje');
  if (e.key === '2') switchTab('frentes');
  if (e.key === '3') switchTab('tarefas');
  if (e.key === '4') switchTab('stats');
  if (e.key === 'Escape') fecharModal();
});
```

- [ ] **Step 2: Verificar atalhos no browser**

1. Na aba Hoje (sem foco em input): pressionar `Espaço` → timer inicia/pausa
2. `N` → modal nova tarefa abre
3. `2` → troca para aba Frentes, `1` volta para Hoje
4. `Esc` → fecha modal aberto
5. Quando cursor está dentro de um `<input>`, atalhos não devem disparar

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: atalhos de teclado — Espaço, N, 1-4, Esc"
```

---

## Task 13: Polish final + responsividade mobile

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Adicionar CSS responsivo faltante na `<style>`**

Adicione dentro do bloco `@media (max-width: 768px)` existente:

```css
  .stats-grid { grid-template-columns: 1fr; }
  .tabela-tarefas { font-size: 12px; }
  .tabela-tarefas td, .tabela-tarefas th { padding: 8px 6px; }
  .filtros-barra { gap: 6px; }
  .filtros-barra .input { font-size: 12px; }
  .fab { bottom: 16px; right: 16px; }
  .modal { margin: 8px; padding: 16px; }
```

- [ ] **Step 2: Verificar responsividade**

1. Abra DevTools → Device Toolbar → iPhone 12 (390px)
2. Aba Hoje: colunas empilhadas, timer legível, blocos funcionam
3. Aba Frentes: cards legíveis, FAB visível
4. Aba Tarefas: tabela com scroll horizontal
5. Aba Estatísticas: cards em 1 coluna

- [ ] **Step 3: Testar critérios de pronto**

Execute este checklist manualmente:

```
[ ] Abre no Chrome sem erros no console (F12)
[ ] Abre no Firefox sem erros
[ ] Funciona offline: abrir offline, desligar rede, recarregar — dados preservados
[ ] F5 não perde dados
[ ] Timer continua: iniciar, trocar aba, voltar após 30s — tempo diminuiu
[ ] Notificação: esperar fim de um pomodoro curto (alterar para 1 min em config no console)
[ ] Export: baixa JSON válido
[ ] Import: importar o JSON exportado, dados restaurados
[ ] Atalho Espaço, N, 1-4, Esc funcionando
[ ] Onboarding: localStorage.clear() + reload → onboarding aparece
[ ] Reset diário: STATE.config.ultima_data_aberta='2026-01-01'; salvar(); reload → tarefas movidas
```

Para testar pomodoro curto rapidamente:
```js
STATE.config.pomodoro_foco_min = 1;
STATE.config.auto_start_delay_s = 0;
salvar();
```

- [ ] **Step 4: Commit final**

```bash
git add index.html
git commit -m "feat: sistema produtividade pessoal — versão completa"
```

---

## Resumo de commits esperados

| Task | Commit |
|------|--------|
| 1 | `feat: shell HTML + CSS base + navegação entre abas` |
| 2 | `feat: STATE + PERSIST (load/save/export/import)` |
| 3 | `feat: UTILS — uuid, formatDate, capacidade, beep, notificações` |
| 4 | `feat: onboarding 3 telas + reset diário + boot` |
| 5 | `feat: POMODORO — Web Worker Blob, state machine, beep, modal conclusão` |
| 6 | `feat: timer UI — display, ciclos, controles, seleção de tarefa` |
| 7 | `feat: pipeline diário — blocos colapsáveis, tarefas, mover, criar` |
| 8 | `feat: metas diárias + hábitos + contador água + resumo do dia` |
| 9 | `feat: aba Frentes — cards, filtros, inline tasks, nova frente` |
| 10 | `feat: aba Tarefas — tabela filtrável, bulk actions, edição inline` |
| 11 | `feat: aba Estatísticas — barras CSS, streak, comparativo, hábitos` |
| 12 | `feat: atalhos de teclado — Espaço, N, 1-4, Esc` |
| 13 | `feat: sistema produtividade pessoal — versão completa` |
