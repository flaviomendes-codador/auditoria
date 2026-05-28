-- =============================================================================
-- NR-1 Compliance Platform — Schema Inicial
-- Migration: 0001_initial_schema.sql
-- =============================================================================

-- Extensions necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- FUNÇÃO: updated_at automático
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABELA: organizacoes
-- Fundação multi-tenant — cada cliente é uma organização isolada
-- =============================================================================

CREATE TABLE organizacoes (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                      TEXT NOT NULL,
  cnpj                      TEXT UNIQUE,
  setor_atividade           TEXT,
  num_colaboradores         INTEGER,
  responsavel_tecnico_nome  TEXT,
  responsavel_tecnico_email TEXT,
  plano                     TEXT NOT NULL DEFAULT 'mvp'
                              CHECK (plano IN ('mvp', 'standard', 'enterprise')),
  ativo                     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_organizacoes
  BEFORE UPDATE ON organizacoes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- TABELA: usuarios
-- Perfil de negócio vinculado ao auth.users do Supabase
-- =============================================================================

CREATE TABLE usuarios (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organizacao_id  UUID NOT NULL REFERENCES organizacoes(id) ON DELETE RESTRICT,
  nome            TEXT NOT NULL,
  email           TEXT NOT NULL,
  perfil          TEXT NOT NULL
                    CHECK (perfil IN ('rh_operacional', 'gestor', 'responsavel_tecnico', 'admin')),
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_acesso_em TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuarios_organizacao ON usuarios(organizacao_id);
CREATE INDEX idx_usuarios_perfil      ON usuarios(perfil);
CREATE INDEX idx_usuarios_email       ON usuarios(email);

CREATE TRIGGER set_updated_at_usuarios
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- TABELA: setores
-- Áreas/departamentos da empresa
-- =============================================================================

CREATE TABLE setores (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  nome           TEXT NOT NULL,
  descricao      TEXT,
  ativo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_by     UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  updated_by     UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organizacao_id, nome)
);

CREATE INDEX idx_setores_organizacao ON setores(organizacao_id);

CREATE TRIGGER set_updated_at_setores
  BEFORE UPDATE ON setores
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- TABELA: cargos
-- Funções/cargos existentes na empresa
-- =============================================================================

CREATE TABLE cargos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id   UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  nome             TEXT NOT NULL,
  descricao        TEXT,
  num_colaboradores INTEGER DEFAULT 0,
  ativo            BOOLEAN NOT NULL DEFAULT TRUE,
  created_by       UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  updated_by       UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organizacao_id, nome)
);

CREATE INDEX idx_cargos_organizacao ON cargos(organizacao_id);

CREATE TRIGGER set_updated_at_cargos
  BEFORE UPDATE ON cargos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- TABELA: cargo_setor
-- Vínculo M:N entre cargos e setores
-- =============================================================================

CREATE TABLE cargo_setor (
  cargo_id   UUID NOT NULL REFERENCES cargos(id)  ON DELETE CASCADE,
  setor_id   UUID NOT NULL REFERENCES setores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (cargo_id, setor_id)
);

CREATE INDEX idx_cargo_setor_setor ON cargo_setor(setor_id);

-- =============================================================================
-- TABELA: riscos
-- Inventário central de riscos ocupacionais (coração da NR-1)
-- Classificação calculada = probabilidade × severidade
--   Crítico ≥15 | Alto 9-14 | Médio 4-8 | Baixo <4
-- =============================================================================

CREATE TABLE riscos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  nome           TEXT NOT NULL,
  descricao      TEXT,
  tipo           TEXT NOT NULL
                   CHECK (tipo IN ('fisico', 'quimico', 'biologico', 'ergonomico',
                                   'mecanico', 'psicossocial', 'outro')),
  fonte_geradora TEXT,
  probabilidade  INTEGER CHECK (probabilidade BETWEEN 1 AND 5),
  severidade     INTEGER CHECK (severidade BETWEEN 1 AND 5),
  classificacao  TEXT GENERATED ALWAYS AS (
    CASE
      WHEN probabilidade IS NULL OR severidade IS NULL THEN 'nao_avaliado'
      WHEN probabilidade * severidade >= 15 THEN 'critico'
      WHEN probabilidade * severidade >= 9  THEN 'alto'
      WHEN probabilidade * severidade >= 4  THEN 'medio'
      ELSE 'baixo'
    END
  ) STORED,
  nr_aplicavel   TEXT[],
  status         TEXT NOT NULL DEFAULT 'ativo'
                   CHECK (status IN ('ativo', 'controlado', 'eliminado', 'arquivado')),
  is_template    BOOLEAN NOT NULL DEFAULT FALSE,
  created_by     UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  updated_by     UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_riscos_organizacao  ON riscos(organizacao_id);
CREATE INDEX idx_riscos_tipo         ON riscos(tipo);
CREATE INDEX idx_riscos_classificacao ON riscos(classificacao);
CREATE INDEX idx_riscos_status       ON riscos(status);

CREATE TRIGGER set_updated_at_riscos
  BEFORE UPDATE ON riscos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- TABELA: risco_cargo
-- Vínculo M:N entre riscos e cargos expostos
-- =============================================================================

CREATE TABLE risco_cargo (
  risco_id                    UUID NOT NULL REFERENCES riscos(id)  ON DELETE CASCADE,
  cargo_id                    UUID NOT NULL REFERENCES cargos(id)  ON DELETE CASCADE,
  grupos_expostos             TEXT,
  medidas_controle_existentes TEXT,
  created_by                  UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (risco_id, cargo_id)
);

CREATE INDEX idx_risco_cargo_cargo ON risco_cargo(cargo_id);

-- =============================================================================
-- TABELA: acoes
-- Plano de Ação — medidas de controle vinculadas a riscos
-- =============================================================================

CREATE TABLE acoes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id  UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  risco_id        UUID REFERENCES riscos(id) ON DELETE SET NULL,
  titulo          TEXT NOT NULL,
  descricao       TEXT,
  tipo_medida     TEXT NOT NULL
                    CHECK (tipo_medida IN (
                      'eliminacao', 'substituicao', 'controle_engenharia',
                      'administrativo', 'epi'
                    )),
  responsavel_id   UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  responsavel_nome TEXT,
  prazo           DATE,
  status          TEXT NOT NULL DEFAULT 'pendente'
                    CHECK (status IN (
                      'pendente', 'em_andamento', 'concluida', 'cancelada', 'atrasada'
                    )),
  prioridade      TEXT NOT NULL DEFAULT 'media'
                    CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  observacoes     TEXT,
  concluida_em    TIMESTAMPTZ,
  concluida_por   UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_acoes_organizacao ON acoes(organizacao_id);
CREATE INDEX idx_acoes_risco       ON acoes(risco_id);
CREATE INDEX idx_acoes_responsavel ON acoes(responsavel_id);
CREATE INDEX idx_acoes_status      ON acoes(status);
CREATE INDEX idx_acoes_prazo       ON acoes(prazo);
CREATE INDEX idx_acoes_prioridade  ON acoes(prioridade);

CREATE TRIGGER set_updated_at_acoes
  BEFORE UPDATE ON acoes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- TABELA: documentos
-- Repositório central de documentos SST com soft delete
-- =============================================================================

CREATE TABLE documentos (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id        UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  nome                  TEXT NOT NULL,
  tipo_documento        TEXT,
  descricao             TEXT,
  storage_path          TEXT NOT NULL,
  storage_bucket        TEXT NOT NULL DEFAULT 'documentos',
  mime_type             TEXT,
  tamanho_bytes         BIGINT,
  setor_id              UUID REFERENCES setores(id) ON DELETE SET NULL,
  tags                  TEXT[],
  validade              DATE,
  status_classificacao  TEXT NOT NULL DEFAULT 'pendente'
                          CHECK (status_classificacao IN (
                            'pendente', 'classificado', 'revisao_manual'
                          )),
  -- Vínculos opcionais a entidades do sistema
  risco_id              UUID REFERENCES riscos(id) ON DELETE SET NULL,
  acao_id               UUID REFERENCES acoes(id)  ON DELETE SET NULL,
  -- Soft delete
  deleted_at            TIMESTAMPTZ,
  deleted_by            UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_by            UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  updated_by            UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documentos_organizacao          ON documentos(organizacao_id);
CREATE INDEX idx_documentos_setor                ON documentos(setor_id);
CREATE INDEX idx_documentos_tipo                 ON documentos(tipo_documento);
CREATE INDEX idx_documentos_status_classificacao ON documentos(status_classificacao);
CREATE INDEX idx_documentos_validade             ON documentos(validade);
CREATE INDEX idx_documentos_risco                ON documentos(risco_id);
CREATE INDEX idx_documentos_acao                 ON documentos(acao_id);
-- Índice parcial: operações normais filtram por deleted_at IS NULL
CREATE INDEX idx_documentos_ativos               ON documentos(organizacao_id) WHERE deleted_at IS NULL;

CREATE TRIGGER set_updated_at_documentos
  BEFORE UPDATE ON documentos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- TABELA: questionarios_psicossociais
-- Templates de questionários e suas aplicações
-- =============================================================================

CREATE TABLE questionarios_psicossociais (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  nome           TEXT NOT NULL,
  descricao      TEXT,
  template       TEXT NOT NULL DEFAULT 'copsoq_simplificado'
                   CHECK (template IN ('copsoq_simplificado', 'jcq', 'personalizado')),
  perguntas      JSONB NOT NULL DEFAULT '[]',
  status         TEXT NOT NULL DEFAULT 'rascunho'
                   CHECK (status IN ('rascunho', 'ativo', 'encerrado', 'arquivado')),
  -- Token único para link público de resposta anônima
  link_token     TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  setor_id       UUID REFERENCES setores(id) ON DELETE SET NULL,
  anonimo        BOOLEAN NOT NULL DEFAULT TRUE,
  data_inicio    DATE,
  data_fim       DATE,
  num_respostas  INTEGER NOT NULL DEFAULT 0,
  created_by     UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  updated_by     UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questionarios_organizacao ON questionarios_psicossociais(organizacao_id);
CREATE INDEX idx_questionarios_status      ON questionarios_psicossociais(status);
CREATE INDEX idx_questionarios_link_token  ON questionarios_psicossociais(link_token);

CREATE TRIGGER set_updated_at_questionarios
  BEFORE UPDATE ON questionarios_psicossociais
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- TABELA: respostas_psicossociais
-- Respostas anônimas (LGPD: sem user_id; imutáveis após envio)
-- =============================================================================

CREATE TABLE respostas_psicossociais (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionario_id  UUID NOT NULL REFERENCES questionarios_psicossociais(id) ON DELETE CASCADE,
  -- Segmentação anônima (sem identificação pessoal)
  setor_informado  TEXT,
  cargo_informado  TEXT,
  respostas        JSONB NOT NULL,
  concluida        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- Sem user_id: anonimidade por design (LGPD)
  -- Sem updated_at: respostas imutáveis após envio
);

CREATE INDEX idx_respostas_questionario ON respostas_psicossociais(questionario_id);
CREATE INDEX idx_respostas_setor        ON respostas_psicossociais(setor_informado);

-- =============================================================================
-- TABELA: pgr_versoes
-- Histórico de gerações do PGR em PDF
-- =============================================================================

CREATE TABLE pgr_versoes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id  UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  versao          TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'rascunho'
                    CHECK (status IN ('rascunho', 'aprovado', 'publicado', 'arquivado')),
  storage_path    TEXT,
  storage_bucket  TEXT DEFAULT 'pgr-versoes',
  num_riscos      INTEGER,
  num_acoes       INTEGER,
  num_documentos  INTEGER,
  aprovado_por    UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  aprovado_em     TIMESTAMPTZ,
  assinatura_nome TEXT,
  assinatura_cargo TEXT,
  assinatura_hash TEXT,
  gerado_por      UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pgr_versoes_organizacao ON pgr_versoes(organizacao_id);
CREATE INDEX idx_pgr_versoes_status      ON pgr_versoes(status);

CREATE TRIGGER set_updated_at_pgr_versoes
  BEFORE UPDATE ON pgr_versoes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- TABELA: logs_auditoria
-- Trilha imutável de eventos críticos (retenção legal: 20 anos)
-- =============================================================================

CREATE TABLE logs_auditoria (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id   UUID REFERENCES organizacoes(id) ON DELETE SET NULL,
  usuario_id       UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  usuario_email    TEXT NOT NULL,
  acao             TEXT NOT NULL,
  entidade         TEXT NOT NULL,
  entidade_id      UUID,
  dados_anteriores JSONB,
  dados_novos      JSONB,
  ip_address       INET,
  user_agent       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- Sem updated_at: logs são imutáveis por design
);

CREATE INDEX idx_logs_organizacao ON logs_auditoria(organizacao_id);
CREATE INDEX idx_logs_usuario     ON logs_auditoria(usuario_id);
CREATE INDEX idx_logs_entidade    ON logs_auditoria(entidade, entidade_id);
CREATE INDEX idx_logs_created_at  ON logs_auditoria(created_at DESC);

-- =============================================================================
-- TABELA: ai_logs
-- Registro de todas as chamadas à API de IA (custo + rastreabilidade)
-- =============================================================================

CREATE TABLE ai_logs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id       UUID REFERENCES organizacoes(id) ON DELETE SET NULL,
  user_id              UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  agent_type           TEXT NOT NULL CHECK (agent_type IN ('classifier', 'assistant')),
  model                TEXT NOT NULL,
  tokens_input         INTEGER NOT NULL,
  tokens_output        INTEGER NOT NULL,
  cost_usd_estimated   NUMERIC(10, 6) NOT NULL DEFAULT 0,
  latency_ms           INTEGER NOT NULL,
  success              BOOLEAN NOT NULL,
  error_message        TEXT,
  input_hash           TEXT,
  prompt_version       TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_organizacao ON ai_logs(organizacao_id);
CREATE INDEX idx_ai_logs_user        ON ai_logs(user_id);
CREATE INDEX idx_ai_logs_agent_type  ON ai_logs(agent_type);
CREATE INDEX idx_ai_logs_created_at  ON ai_logs(created_at DESC);
CREATE INDEX idx_ai_logs_success     ON ai_logs(success);

-- =============================================================================
-- TABELA: classifications
-- Sugestões do Agente Classificador aguardando confirmação humana
-- =============================================================================

CREATE TABLE classifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id  UUID REFERENCES organizacoes(id) ON DELETE SET NULL,
  documento_id    UUID REFERENCES documentos(id) ON DELETE CASCADE,
  tipo_documento  TEXT NOT NULL,
  setor_sugerido  TEXT,
  tags            TEXT[],
  risco_relacionado TEXT,
  nr_aplicavel    TEXT[],
  confianca       TEXT NOT NULL CHECK (confianca IN ('alta', 'media', 'baixa')),
  justificativa   TEXT,
  ai_log_id       UUID REFERENCES ai_logs(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'pendente'
                    CHECK (status IN ('pendente', 'aceita', 'editada', 'rejeitada')),
  confirmada_por  UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  confirmada_em   TIMESTAMPTZ,
  edicao_humana   JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_classifications_organizacao ON classifications(organizacao_id);
CREATE INDEX idx_classifications_documento   ON classifications(documento_id);
CREATE INDEX idx_classifications_status      ON classifications(status);
CREATE INDEX idx_classifications_confianca   ON classifications(confianca);

CREATE TRIGGER set_updated_at_classifications
  BEFORE UPDATE ON classifications
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- TABELA: chat_conversations
-- Sessões de conversa com o Agente de Atendimento
-- =============================================================================

CREATE TABLE chat_conversations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID REFERENCES organizacoes(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo         TEXT,
  num_mensagens  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_conversations_user        ON chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_organizacao ON chat_conversations(organizacao_id);

CREATE TRIGGER set_updated_at_chat_conversations
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- TABELA: chat_messages
-- Mensagens individuais das conversas
-- =============================================================================

CREATE TABLE chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  ai_log_id       UUID REFERENCES ai_logs(id) ON DELETE SET NULL,
  feedback        TEXT CHECK (feedback IN ('positivo', 'negativo')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at   ON chat_messages(created_at);

-- =============================================================================
-- TABELA: ai_config
-- Limites de custo e toggles de agentes por organização
-- =============================================================================

CREATE TABLE ai_config (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id           UUID UNIQUE REFERENCES organizacoes(id) ON DELETE CASCADE,
  cost_limit_monthly_usd   NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  cost_alert_threshold_pct INTEGER NOT NULL DEFAULT 80
                             CHECK (cost_alert_threshold_pct BETWEEN 1 AND 100),
  classifier_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  assistant_enabled        BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_ai_config
  BEFORE UPDATE ON ai_config
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- TABELA: prompt_versions
-- Versionamento de prompts dos agentes de IA
-- =============================================================================

CREATE TABLE prompt_versions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL CHECK (agent_type IN ('classifier', 'assistant')),
  version    TEXT NOT NULL,
  content    TEXT NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_type, version)
);

CREATE INDEX idx_prompt_versions_agent_active ON prompt_versions(agent_type, active);

-- =============================================================================
-- ROW LEVEL SECURITY
-- Isolamento completo por organização
-- =============================================================================

ALTER TABLE organizacoes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios                ENABLE ROW LEVEL SECURITY;
ALTER TABLE setores                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargos                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargo_setor             ENABLE ROW LEVEL SECURITY;
ALTER TABLE riscos                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE risco_cargo             ENABLE ROW LEVEL SECURITY;
ALTER TABLE acoes                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionarios_psicossociais ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_psicossociais ENABLE ROW LEVEL SECURITY;
ALTER TABLE pgr_versoes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_auditoria          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_logs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE classifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_config               ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions         ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Funções helper para RLS (SECURITY DEFINER evita recursão em usuarios)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION auth_organizacao_id()
RETURNS UUID AS $$
  SELECT organizacao_id FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_perfil()
RETURNS TEXT AS $$
  SELECT perfil FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- organizacoes: cada usuário vê apenas a própria
-- ----------------------------------------------------------------------------
CREATE POLICY "ver_propria_organizacao"
  ON organizacoes FOR SELECT
  TO authenticated
  USING (id = auth_organizacao_id());

-- ----------------------------------------------------------------------------
-- usuarios: ver da mesma organização; editar apenas o próprio perfil
-- ----------------------------------------------------------------------------
CREATE POLICY "ver_usuarios_mesma_organizacao"
  ON usuarios FOR SELECT
  TO authenticated
  USING (organizacao_id = auth_organizacao_id());

CREATE POLICY "editar_proprio_perfil"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ----------------------------------------------------------------------------
-- Macro para tabelas operacionais: acesso total dentro da organização
-- ----------------------------------------------------------------------------

-- setores
CREATE POLICY "org_acesso_setores"
  ON setores FOR ALL
  TO authenticated
  USING (organizacao_id = auth_organizacao_id())
  WITH CHECK (organizacao_id = auth_organizacao_id());

-- cargos
CREATE POLICY "org_acesso_cargos"
  ON cargos FOR ALL
  TO authenticated
  USING (organizacao_id = auth_organizacao_id())
  WITH CHECK (organizacao_id = auth_organizacao_id());

-- cargo_setor (controle via cargo da org)
CREATE POLICY "org_acesso_cargo_setor"
  ON cargo_setor FOR ALL
  TO authenticated
  USING (
    cargo_id IN (SELECT id FROM cargos WHERE organizacao_id = auth_organizacao_id())
  );

-- riscos
CREATE POLICY "org_acesso_riscos"
  ON riscos FOR ALL
  TO authenticated
  USING (organizacao_id = auth_organizacao_id())
  WITH CHECK (organizacao_id = auth_organizacao_id());

-- risco_cargo (controle via risco da org)
CREATE POLICY "org_acesso_risco_cargo"
  ON risco_cargo FOR ALL
  TO authenticated
  USING (
    risco_id IN (SELECT id FROM riscos WHERE organizacao_id = auth_organizacao_id())
  );

-- acoes
CREATE POLICY "org_acesso_acoes"
  ON acoes FOR ALL
  TO authenticated
  USING (organizacao_id = auth_organizacao_id())
  WITH CHECK (organizacao_id = auth_organizacao_id());

-- pgr_versoes
CREATE POLICY "org_acesso_pgr_versoes"
  ON pgr_versoes FOR ALL
  TO authenticated
  USING (organizacao_id = auth_organizacao_id())
  WITH CHECK (organizacao_id = auth_organizacao_id());

-- classifications
CREATE POLICY "org_acesso_classifications"
  ON classifications FOR ALL
  TO authenticated
  USING (organizacao_id = auth_organizacao_id())
  WITH CHECK (organizacao_id = auth_organizacao_id());

-- ----------------------------------------------------------------------------
-- documentos: excluir soft-deleted nas leituras padrão
-- ----------------------------------------------------------------------------
CREATE POLICY "org_ver_documentos_ativos"
  ON documentos FOR SELECT
  TO authenticated
  USING (organizacao_id = auth_organizacao_id() AND deleted_at IS NULL);

CREATE POLICY "org_inserir_documentos"
  ON documentos FOR INSERT
  TO authenticated
  WITH CHECK (organizacao_id = auth_organizacao_id());

CREATE POLICY "org_editar_documentos"
  ON documentos FOR UPDATE
  TO authenticated
  USING (organizacao_id = auth_organizacao_id() AND deleted_at IS NULL)
  WITH CHECK (organizacao_id = auth_organizacao_id());

-- ----------------------------------------------------------------------------
-- questionarios_psicossociais
-- ----------------------------------------------------------------------------
CREATE POLICY "org_acesso_questionarios"
  ON questionarios_psicossociais FOR ALL
  TO authenticated
  USING (organizacao_id = auth_organizacao_id())
  WITH CHECK (organizacao_id = auth_organizacao_id());

-- ----------------------------------------------------------------------------
-- respostas_psicossociais
-- INSERT: anon e authenticated (link público; validação do link_token na API Route)
-- SELECT: apenas usuários autenticados da organização (leitura agregada)
-- ----------------------------------------------------------------------------
CREATE POLICY "qualquer_um_insere_resposta"
  ON respostas_psicossociais FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

CREATE POLICY "org_le_respostas_agregadas"
  ON respostas_psicossociais FOR SELECT
  TO authenticated
  USING (
    questionario_id IN (
      SELECT id FROM questionarios_psicossociais
      WHERE organizacao_id = auth_organizacao_id()
    )
  );

-- ----------------------------------------------------------------------------
-- logs_auditoria: somente leitura para usuários; escrita via service role
-- ----------------------------------------------------------------------------
CREATE POLICY "org_le_logs_auditoria"
  ON logs_auditoria FOR SELECT
  TO authenticated
  USING (organizacao_id = auth_organizacao_id());

-- ----------------------------------------------------------------------------
-- ai_logs: leitura apenas para admin e responsável técnico
-- ----------------------------------------------------------------------------
CREATE POLICY "org_le_ai_logs"
  ON ai_logs FOR SELECT
  TO authenticated
  USING (
    organizacao_id = auth_organizacao_id()
    AND auth_perfil() IN ('admin', 'responsavel_tecnico')
  );

-- ----------------------------------------------------------------------------
-- chat_conversations e chat_messages: apenas as próprias conversas
-- ----------------------------------------------------------------------------
CREATE POLICY "usuario_acesso_proprio_chat"
  ON chat_conversations FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "usuario_acesso_proprias_mensagens"
  ON chat_messages FOR ALL
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM chat_conversations WHERE user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- ai_config: apenas admin e responsável técnico
-- ----------------------------------------------------------------------------
CREATE POLICY "admin_acesso_ai_config"
  ON ai_config FOR ALL
  TO authenticated
  USING (
    organizacao_id = auth_organizacao_id()
    AND auth_perfil() IN ('admin', 'responsavel_tecnico')
  )
  WITH CHECK (
    organizacao_id = auth_organizacao_id()
    AND auth_perfil() IN ('admin', 'responsavel_tecnico')
  );

-- ----------------------------------------------------------------------------
-- prompt_versions: leitura para usuários autenticados; escrita via service role
-- ----------------------------------------------------------------------------
CREATE POLICY "autenticados_leem_prompt_versions"
  ON prompt_versions FOR SELECT
  TO authenticated
  USING (TRUE);
