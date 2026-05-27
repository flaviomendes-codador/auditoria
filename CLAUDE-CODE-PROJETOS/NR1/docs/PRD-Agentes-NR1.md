# PRD — Camada de Agentes de IA
## Plataforma de Conformidade NR-1

**Versão:** 1.0
**Data:** 26 de maio de 2026
**Autor:** Flávio Mendes (com assistência Claude)
**Status:** Para execução
**Documento complementar a:** PRD-NR1-MVP-30dias.md

---

## 1. Visão Geral

### 1.1 Propósito da camada de IA

A camada de IA da plataforma tem três objetivos práticos:

1. **Reduzir o trabalho manual do RH operacional** na organização de documentos espalhados
2. **Acelerar a curva de aprendizado** dos usuários (qualquer dúvida, perguntam dentro do sistema)
3. **Demonstrar valor concreto da plataforma** já nas primeiras semanas de uso

A camada de IA **não é** um substituto do sistema núcleo. É um acelerador.

### 1.2 Princípios de design

| Princípio | Tradução prática |
|-----------|------------------|
| IA apoia, humano decide | Toda saída do Classificador precisa de confirmação humana antes de virar dado oficial |
| Falhas são esperadas | Sistema mede e mostra taxa de acerto; humano pode corrigir e a correção é registrada |
| Recusa é melhor que invenção | Atendimento prefere dizer "não sei" a chutar informação técnica |
| Transparência sobre IA | Toda saída da IA é claramente sinalizada na interface |
| Custo controlado | Limites de gasto configuráveis com alertas; cache quando possível |

---

## 2. Arquitetura da Camada de IA

### 2.1 Stack

- **Provider:** Anthropic (único)
- **Modelos:**
  - Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) para classificação em massa
  - Claude Sonnet 4.6 (`claude-sonnet-4-6`) para conversação e tarefas complexas
- **Cliente:** SDK oficial da Anthropic em Node.js (`@anthropic-ai/sdk`)
- **Onde roda:** Next.js API Routes (chamadas síncronas) + Supabase Edge Functions (jobs assíncronos para processamento em lote)

> **Atenção:** os identificadores de modelo acima devem ser confirmados no início do projeto consultando a documentação oficial da Anthropic, pois nomes e versões evoluem.

### 2.2 Estrutura de pastas sugerida

```
/lib
  /ai
    /clients
      anthropic.ts          # cliente Anthropic configurado
    /agents
      classifier.ts         # lógica do Agente Classificador
      assistant.ts          # lógica do Agente de Atendimento
    /prompts
      classifier.md         # prompt do Classificador (versionado)
      assistant.md          # prompt do Atendimento (versionado)
    /utils
      anonymizer.ts         # remove CPF, email, telefone antes do prompt
      logger.ts             # log de chamadas
      cost-tracker.ts       # rastreamento de custo
      retry.ts              # retry com backoff
    /types
      ai-types.ts           # types compartilhados
```

### 2.3 Componentes compartilhados

#### 2.3.1 Cliente Anthropic
- Singleton com configuração de API key (variável de ambiente)
- Timeout configurável (default 60s para classificação, 30s para chat)
- Headers de tracking (project_id, user_id) para rastreabilidade

#### 2.3.2 Anonimizador
Antes de enviar qualquer conteúdo para a Claude API, passa por anonimização:
- Regex de CPF → `[CPF]`
- Regex de email → `[EMAIL]`
- Regex de telefone → `[TELEFONE]`
- Regex de RG → `[RG]`
- Datas de nascimento → preserva ano, anonimiza dia/mês

Exceções permitidas (com flag explícita):
- Nomes próprios (preserva, pois IA precisa do contexto)
- CNPJ (preserva, é dado público)
- Endereços corporativos (preserva)

#### 2.3.3 Logger
Toda chamada à API gera registro em tabela `ai_logs` com:
- `user_id`, `agent_type` (classifier|assistant), `model`, `tokens_input`, `tokens_output`, `cost_usd_estimated`, `latency_ms`, `success`, `error_message` (se houver), `created_at`
- Não armazena conteúdo completo do prompt/resposta por padrão (LGPD); armazena hash do input e amostra dos primeiros 200 caracteres apenas em modo debug

#### 2.3.4 Cost Tracker
- Calcula custo estimado por chamada baseado em tabela local de preços (atualizada manualmente)
- Acumula custo por dia/mês
- Dispara alerta (email para Flávio + log no Sentry) quando ultrapassa limite configurado
- Limite default: US$ 50/mês durante MVP

#### 2.3.5 Retry com backoff
- Tentativas: 3
- Backoff: exponencial (1s, 3s, 9s)
- Erros que disparam retry: 429 (rate limit), 500, 502, 503, 504
- Erros que não disparam retry: 400 (input inválido), 401 (auth), 403

---

## 3. Agente Classificador

### 3.1 Função

Recebe um documento (PDF, imagem, planilha, texto) e retorna classificação estruturada para apoiar organização no sistema.

### 3.2 Pipeline de execução

```
Documento upload
    ↓
Extração de texto (parser específico por tipo)
    ↓
Anonimização
    ↓
Truncamento se necessário (limite: 8.000 tokens de input)
    ↓
Prompt Classificador (Haiku 4.5)
    ↓
Parsing da resposta JSON
    ↓
Validação contra schema esperado
    ↓
Apresentação ao humano com sugestões
    ↓
Confirmação ou correção humana
    ↓
Salvamento no banco + registro de feedback
```

### 3.3 Extração de texto por tipo

- **PDF com texto:** `pdf-parse` ou similar
- **PDF escaneado/imagem:** OCR via Tesseract (versão MVP) — qualidade limitada, será refinado em Fase 2
- **JPG/PNG:** OCR Tesseract
- **CSV/XLSX:** parsing direto, primeiras 100 linhas
- **TXT:** leitura direta
- **Outros:** rejeita com mensagem clara

### 3.4 Schema de saída

```typescript
interface ClassificationResult {
  tipo_documento: string;           // ex: "ASO", "Ficha de EPI", "Ata CIPA", "Laudo Ergonômico"
  setor_sugerido: string | null;    // ex: "Vendas", "Estoque"
  tags: string[];                   // ex: ["EPI", "treinamento", "NR-6"]
  risco_relacionado: string | null; // ex: "Risco ergonômico - postura"
  nr_aplicavel: string[];           // ex: ["NR-1", "NR-6"]
  confianca: "alta" | "media" | "baixa";
  justificativa: string;            // 1-2 frases explicando a classificação
}
```

### 3.5 Prompt do Classificador (estrutura)

```
Você é um classificador de documentos de Segurança e Saúde no Trabalho (SST) em conformidade com a NR-1 brasileira.

ENTRADA: texto extraído de um documento.

TAREFA: classificar o documento e retornar JSON estritamente no schema fornecido.

REGRAS:
- Use APENAS as categorias listadas
- Se não tiver certeza, marque confianca: "baixa"
- Nunca invente NRs que não existem
- Se o texto não parecer SST, retorne tipo_documento: "outro" com confianca: "baixa"

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

NRs CONHECIDAS: NR-1, NR-5, NR-6, NR-7, NR-9, NR-17, NR-23, NR-24, [outras relevantes para varejo]

SCHEMA DE SAÍDA:
{schema JSON}

DOCUMENTO:
{conteudo_documento}
```

O prompt fica em `prompts/classifier.md`, versionado no repositório.

### 3.6 Interface do usuário

**Tela de upload:**
- Drag-and-drop ou seleção de múltiplos arquivos
- Barra de progresso por arquivo
- Para cada arquivo classificado: card com sugestões da IA e botões "Aceitar", "Editar", "Rejeitar"

**Estado de confiança:**
- Alta: card verde, botão "Aceitar" em destaque
- Média: card amarelo, sugere revisão
- Baixa: card vermelho, pede revisão obrigatória

**Lote:**
- Quando upload é em massa, tabela com todos os documentos e suas classificações
- Filtro por confiança
- Ação em lote: "Aceitar todos com confiança alta"

### 3.7 Métrica de acurácia

- Cada confirmação humana atualiza contador
- Dashboard interno mostra: taxa de aceitação total (sugestão aceita sem edição), taxa de edição (sugestão aceita com correção), taxa de rejeição
- Meta MVP: ≥80% de aceitação ou edição leve em amostra de teste

### 3.8 Tratamento de erros

- Documento muito grande (>50MB): rejeita upload
- Extração de texto falha: salva documento mas marca para revisão manual sem classificação
- Claude API falha após retries: salva como "pendente de classificação"
- Resposta JSON malformada: salva log e marca para revisão

---

## 4. Agente de Atendimento Interno

### 4.1 Função

Chat dentro do sistema que responde dúvidas operacionais sobre a plataforma e processos básicos de NR-1.

### 4.2 Pipeline de execução

```
Usuário envia mensagem
    ↓
Recuperação de histórico da conversa (últimas 10 mensagens)
    ↓
Recuperação de contexto leve (metadados do usuário: perfil, último acesso)
    ↓
Anonimização (se houver dados pessoais na pergunta)
    ↓
Prompt Atendimento (Sonnet 4.6)
    ↓
Streaming da resposta para a UI
    ↓
Registro da conversa no banco
    ↓
Botão "Foi útil?" exibido para coleta de feedback
```

### 4.3 Escopo de respostas

**O agente RESPONDE sobre:**
- Como usar a plataforma (cadastros, navegação, ações comuns)
- O que é NR-1 e seus conceitos básicos (PGR, GRO, riscos psicossociais, etc.)
- Estado atual de informações dentro do sistema (com metadados disponíveis)
- Próximos passos sugeridos em fluxos comuns

**O agente RECUSA explicitamente:**
- Parecer técnico sobre riscos específicos da empresa
- Cálculos de adicional de insalubridade ou periculosidade
- Recomendações médicas
- Interpretação jurídica
- Decisões que exigem profissional habilitado

**Recusa padrão:** "Essa pergunta envolve [parecer técnico / decisão legal / etc.] e precisa ser respondida pelo profissional habilitado responsável pelo PGR da empresa. Posso te ajudar a localizar contatos ou explicar conceitos gerais, se quiser."

### 4.4 Prompt do Atendimento (estrutura)

```
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
- SEMPRE preserve a privacidade: não revele dados pessoais identificáveis.

CONTEXTO DA PLATAFORMA:
{descrição dos módulos disponíveis}

CONTEXTO DO USUÁRIO:
- Perfil: {rh_operacional | gestor | responsavel_tecnico}
- Permissões: {lista}

HISTÓRICO RECENTE:
{últimas mensagens}

PERGUNTA:
{pergunta_do_usuario}
```

### 4.5 Interface do usuário

**Widget:**
- Botão flutuante no canto inferior direito em todas as telas
- Clica e abre painel lateral (não modal — usuário continua vendo a tela)
- Histórico persiste entre sessões
- Streaming visível (texto aparece conforme gerado)

**Mensagens:**
- Avatar diferente para usuário e IA
- Indicador "está digitando" enquanto gera resposta
- Botão "👍 / 👎" em cada resposta da IA
- Botão "Copiar" e "Limpar conversa"

**Indicação de fonte:**
- Quando resposta refere-se a uma tela do sistema, mostra link clicável
- Quando refere-se a NR-1, indica "fonte: NR-1, item X.Y" (apenas quando o agente cita itens conhecidos no prompt)

### 4.6 Limites

- Máximo 50 mensagens por conversa antes de criar nova (controle de contexto)
- Máximo 20 conversas/dia por usuário (controle de custo)
- Janela de contexto: últimas 10 mensagens enviadas no prompt
- Timeout de geração: 30 segundos

### 4.7 Métricas de qualidade

- Taxa de "Foi útil?" positivo
- Taxa de recusas estruturadas vs respostas dadas
- Tempo médio de conversa
- Conversas abandonadas (usuário não responde)

---

## 5. Schema de Banco para a Camada de IA

```sql
-- Logs de chamadas à API de IA
CREATE TABLE ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES usuarios(id),
  agent_type TEXT NOT NULL,                    -- 'classifier' | 'assistant'
  model TEXT NOT NULL,                          -- ex: 'claude-haiku-4-5-20251001'
  tokens_input INTEGER NOT NULL,
  tokens_output INTEGER NOT NULL,
  cost_usd_estimated NUMERIC(10, 6),
  latency_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  input_hash TEXT,                              -- hash do input para detectar duplicatas
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classificações geradas pelo Agente Classificador
CREATE TABLE classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID REFERENCES documentos(id) ON DELETE CASCADE,
  tipo_documento TEXT NOT NULL,
  setor_sugerido TEXT,
  tags TEXT[],
  risco_relacionado TEXT,
  nr_aplicavel TEXT[],
  confianca TEXT NOT NULL,                      -- 'alta' | 'media' | 'baixa'
  justificativa TEXT,
  ai_log_id UUID REFERENCES ai_logs(id),
  status TEXT NOT NULL DEFAULT 'pendente',      -- 'pendente' | 'aceita' | 'editada' | 'rejeitada'
  confirmada_por UUID REFERENCES usuarios(id),
  confirmada_em TIMESTAMPTZ,
  edicao_humana JSONB,                          -- registra correção feita pelo humano
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversas do Agente de Atendimento
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES usuarios(id) NOT NULL,
  titulo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,                           -- 'user' | 'assistant'
  content TEXT NOT NULL,
  ai_log_id UUID REFERENCES ai_logs(id),        -- apenas para mensagens 'assistant'
  feedback TEXT,                                -- 'positivo' | 'negativo' | null
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuração de limites e alertas
CREATE TABLE ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_limit_monthly_usd NUMERIC(10, 2) DEFAULT 50.00,
  cost_alert_threshold_pct INTEGER DEFAULT 80,  -- alerta quando atingir 80% do limite
  classifier_enabled BOOLEAN DEFAULT TRUE,
  assistant_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Fluxos de Erro e Degradação

### 6.1 Falha do Classificador
- Documento é salvo com classificação `pendente`
- Aparece em fila de "revisão manual"
- RH pode classificar manualmente

### 6.2 Falha do Atendimento
- Mensagem de erro amigável: "Tive um problema técnico. Tenta de novo em alguns segundos."
- Log do erro para análise
- Se 3 falhas seguidas: sugere abrir ticket de suporte

### 6.3 Estouro de custo
- Quando atinge 80% do limite: alerta para Flávio
- Quando atinge 100%: agentes param de responder (modo degradado)
- Tela mostra: "IA temporariamente desativada. Sistema funciona normalmente."

### 6.4 LGPD: solicitação de exclusão
- Endpoint para excluir todos os registros de IA de um usuário
- Mantém logs anônimos (sem `user_id`) para auditoria agregada

---

## 7. Versionamento de Prompts

Prompts ficam em arquivos `.md` no repositório, versionados via Git. Toda mudança de prompt em produção segue o fluxo:

1. Edita arquivo `.md`
2. Roda bateria de 20 testes (perguntas/documentos conhecidos com respostas esperadas)
3. Compara saídas com versão anterior
4. Se aprovado, faz deploy
5. Registra versão do prompt em `ai_logs` para cada chamada

Tabela auxiliar:
```sql
CREATE TABLE prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  version TEXT NOT NULL,                        -- ex: 'classifier-v1.2'
  content TEXT NOT NULL,
  active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Roadmap dos Agentes

### Fase 2 (60 a 90 dias após MVP)

**Atendimento Interno com RAG**
- Embeddings dos documentos do cliente
- Busca semântica antes da geração
- Citação de fontes (qual documento, qual trecho)
- Tabela `document_embeddings` no Supabase com pgvector

**Agente Redator**
- Gera rascunhos de comunicados, atas, planos de ação a partir de evidências
- Sempre como rascunho, humano edita e aprova
- Template específico por tipo de saída

**Agente de Conformidade**
- Monitora periodicamente o estado do sistema (via job assíncrono)
- Identifica: ações vencidas, documentos vencendo, lacunas no inventário
- Gera relatório semanal automático

**Agente de Riscos Psicossociais**
- Análise qualitativa de respostas abertas de questionários
- Identificação de padrões e tópicos recorrentes
- Sugestão de áreas de atenção (sempre validada por humano)

### Fase 3+

- Multi-modal (análise de imagens de incidentes, plantas baixas)
- Voz (transcrição de atas, geração de comunicados em áudio)
- Integração com canais externos (WhatsApp Business para denúncias)

---

## 9. Critérios de Aceite (resumo)

Os agentes são considerados entregues quando:

| # | Critério | Como medir |
|---|----------|-----------|
| 1 | Classificador atinge ≥80% de aceitação humana | Métrica em dashboard, sobre amostra de 30+ docs |
| 2 | Classificador processa lote de 50+ docs sem falha | Teste de carga no kickoff |
| 3 | Atendimento responde adequadamente 10 perguntas-teste | Roteiro definido no kickoff |
| 4 | Atendimento recusa corretamente perguntas fora do escopo | 5 perguntas-armadilha no roteiro |
| 5 | Logs de IA gravados e consultáveis | Verificação no banco |
| 6 | Anonimização de CPF/email funcionando | Teste unitário automatizado |
| 7 | Limite de custo configurado e alerta funcionando | Simular consumo elevado |
| 8 | Documentação de prompts e fluxos | Arquivos no repositório |

---

## 10. Notas para Implementação no Claude Code

Quando trabalhar nesta camada com Claude Code:

1. **Sempre carregar este documento como contexto** no início da sessão
2. **Trabalhar uma feature por vez** (classificador OU atendimento, não ambos simultaneamente)
3. **Testar com dados reais** desde o início — use uma amostra de 5 docs reais do cliente como base de teste local
4. **Versionar prompts** desde o primeiro commit
5. **Implementar a anonimização ANTES** da primeira chamada real à API
6. **Configurar limites de custo** antes de qualquer teste em volume
7. **Não confiar em estimativas de preço** sem consultar a documentação oficial da Anthropic no início do projeto

---

*Documento técnico-funcional para execução. Lido em conjunto com o PRD do projeto principal.*
