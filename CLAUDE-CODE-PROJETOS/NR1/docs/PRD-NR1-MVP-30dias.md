# PRD — Plataforma de Conformidade NR-1
## MVP Produtivo em 30 dias

**Versão:** 2.0
**Data:** 26 de maio de 2026
**Autor:** Flávio Mendes (com assistência Claude)
**Status:** Para execução

---

## 1. Sumário Executivo

### 1.1 Contexto

A NR-1, atualizada pela Portaria MTE 1.419/2024, incluiu formalmente os riscos psicossociais no PGR. A Portaria MTE 765/2025 confirmou o início da fiscalização punitiva em 26/05/2026 — a partir desta data, empresas sem PGR adequado estão expostas a autuação.

O cliente é uma empresa de varejo com até 500 colaboradores, 1 unidade, com documentação de SST espalhada. Precisa de plataforma produtiva para operar a conformidade NR-1, não apenas protótipo.

### 1.2 Solução

Plataforma híbrida composta por:
- **Sistema (núcleo):** fonte de verdade para inventário de riscos, plano de ação, documentos, com versionamento e trilha de auditoria
- **Agentes de IA (camada de produtividade):** classificação automática de documentos, atendimento interno, apoio à redação

**Stack:** Next.js + Supabase + Vercel + Anthropic Claude API

### 1.3 Entrega

Sistema deployado e operacional em 30 dias, com priorização que permite começar a trabalhar mesmo com módulos em estados diferentes de maturidade. Os 9 módulos descritos neste PRD compõem a visão completa; o que entra no MVP de 30 dias é definido na priorização (Seção 4).

---

## 2. Premissas, Restrições e Riscos

### 2.1 Premissas

- Cliente já contratou e está disponível para validações rápidas durante a execução
- Coordenação técnica do PGR (assinatura legal) será de profissional habilitado a definir com cliente nas primeiras semanas
- A plataforma é ferramenta de gestão; **não substitui responsabilidade legal do empregador nem do profissional habilitado**
- Cliente fornecerá amostra dos documentos atuais nas primeiras semanas

### 2.2 Restrições

- **Orçamento:** R$ 15.000 (passível de renegociação se escopo crescer)
- **Prazo:** 30 dias corridos para MVP produtivo
- **Stack:** Next.js + Supabase + Vercel + Anthropic Claude API
- **Compliance:** LGPD obrigatória; dados de saúde mental são dados sensíveis

### 2.3 Riscos do projeto

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Escopo de 9 módulos não cabe em 30 dias com R$ 15K | Alta | Alto | Priorização explícita; módulos secundários ficam como esqueleto funcional |
| Cliente sem responsável técnico definido | Alta | Alto | Levantamento na Semana 1; sistema funciona com qualquer modelo |
| Volume real de documentos espalhados é maior que estimado | Média | Médio | Importação assistida por IA absorve volume; ajustes incrementais |
| Cliente espera "conformidade automática" | Média | Alto | Comunicação contínua: IA apoia, profissional habilitado assina |
| Dados sensíveis vazando para API de IA | Baixa | Alto | Anonimização antes do envio ao Claude API; logs revisados |

---

## 3. Visão de Produto Completa (9 Módulos)

Esta seção descreve **o produto completo**. A Seção 4 define o que entra na primeira entrega de 30 dias.

### 3.1 Módulo 1 — Repositório Central de Documentos

**Propósito:** Eliminar a dispersão atual. Toda documentação de SST mora aqui.

**Funcionalidades:**
- Upload manual (drag-and-drop) e importação em lote
- Organização por setor, tipo, data, tags
- Busca textual em conteúdo
- Versionamento com diff
- Política de retenção de 20 anos
- Permissões granulares
- Trilha de auditoria por documento

**Estado MVP:** Versão simplificada — upload, listagem, anexar a entidades. Sem busca full-text avançada nem versionamento granular (fica pra Fase 2).

### 3.2 Módulo 2 — Inventário de Riscos Ocupacionais

**Propósito:** Mapear formalmente todos os riscos por cargo/setor.

**Funcionalidades:**
- Cadastro de setores e cargos com hierarquia
- Cadastro de riscos por tipo: físicos, químicos, biológicos, ergonômicos, mecânicos, psicossociais
- Para cada risco: fonte geradora, grupos expostos, probabilidade, severidade, classificação final (matriz de risco)
- Vinculação de evidências (documentos)
- Templates pré-configurados para varejo

**Estado MVP:** Completo. É o coração da conformidade — entrega total.

### 3.3 Módulo 3 — Plano de Ação

**Propósito:** Para cada risco classificado, gerir as medidas de controle.

**Funcionalidades:**
- Criação de ação vinculada a risco
- Tipo da medida (eliminação, substituição, controle de engenharia, administrativo, EPI)
- Responsável, prazo, status, evidências
- Cronograma visual
- Notificações de prazo por email
- Histórico de execução

**Estado MVP:** Completo, mas notificações simplificadas (email diário consolidado em vez de tempo real).

### 3.4 Módulo 4 — Riscos Psicossociais

**Propósito:** Cumprir a exigência da Portaria 1.419/2024.

**Funcionalidades:**
- Biblioteca de questionários (templates COPSOQ, JCQ, personalizado)
- Aplicação anônima aos colaboradores via link
- Coleta com criptografia e anonimização
- Consolidação por setor/cargo
- Geração de risco psicossocial classificado integrado ao inventário
- Histórico de aplicações

**Estado MVP:** Versão básica — 1 template padrão (COPSOQ simplificado), aplicação por link, consolidação manual confirmada por humano. Sem análise qualitativa profunda por IA.

### 3.5 Módulo 5 — Workflow de Aprovações

**Propósito:** Garantir cadeia formal de aprovação para itens do PGR.

**Funcionalidades:**
- Estados: rascunho → submetido → aprovado → publicado
- Atribuição de aprovadores por tipo
- Notificações de pendência
- Assinatura digital simples (registro de usuário, data, hash)
- Bloqueio de edição após aprovação (gera nova versão)

**Estado MVP:** Versão simplificada — status manual com campo de aprovador e data. Sem fluxo automatizado de notificações. Vira workflow completo na Fase 2.

### 3.6 Módulo 6 — Trilha de Auditoria

**Propósito:** Registro imutável de toda ação no sistema. Não-negociável para fiscalização.

**Funcionalidades:**
- Log imutável (quem, o quê, quando, IP, contexto)
- Filtro e busca por usuário, período, entidade
- Exportação CSV para fiscalização
- Retenção de 20 anos

**Estado MVP:** Versão básica — created_at, updated_at, created_by, updated_by em todas as tabelas + tabela de log de ações críticas (criação, edição, aprovação, exclusão). Sem interface de consulta avançada — entra na Fase 2.

### 3.7 Módulo 7 — Dashboard de Conformidade

**Propósito:** Visão executiva do estado de conformidade.

**Funcionalidades:**
- % de cargos com risco mapeado
- Ações vencidas / no prazo / concluídas
- Documentos vencendo nos próximos 30/60/90 dias
- Última atualização de cada bloco do PGR
- Indicador macro de prontidão

**Estado MVP:** Versão simples — contadores e tabelas. Sem gráficos avançados nem visualizações personalizáveis.

### 3.8 Módulo 8 — Geração do PGR (PDF)

**Propósito:** Exportar o documento oficial.

**Funcionalidades:**
- Template do PGR conforme estrutura recomendada
- Geração com um clique
- Assinatura digital (Fase 2: ICP-Brasil)
- Versionamento de gerações

**Estado MVP:** Template fixo gerando PDF a partir do Inventário + Plano de Ação. Assinatura simples (nome, data, ID gerado). Sem editor visual de template.

### 3.9 Módulo 9 — Agentes de IA

**9.1 Agente Classificador**
- Recebe documento → classifica tipo, sugere setor e tags, identifica risco relacionado
- Sempre apresenta sugestão para humano confirmar
- Modelo: Claude Haiku para classificação em massa

**9.2 Agente de Atendimento Interno**
- Interface de chat dentro do sistema
- Responde dúvidas sobre processos e localização de informações
- Acesso de leitura à base do cliente
- Modelo: Claude Sonnet

**Estado MVP:**
- Classificador: **completo** — é diferencial competitivo, vale o investimento
- Atendimento: **versão básica** — chat funcionando com prompt fixo, sem RAG completo da base do cliente (entra na Fase 2)

---

## 4. Priorização para os 30 dias

### 4.1 Princípio orientador

Em 30 dias com R$ 15K, é impossível entregar os 9 módulos no nível "completo". A estratégia é:

- **Núcleo de conformidade (Módulos 2, 3, 8):** entregar completo — sem isso não há PGR
- **Diferencial competitivo (Módulo 9.1 - Classificador):** entregar completo — é o "uau" da apresentação e resolve a dor real
- **Habilitadores (Módulos 1, 6, 7):** entregar em versão simplificada que funciona, evolui depois
- **Funcionalidades adicionais (Módulos 4, 5, 9.2):** entregar como esqueleto funcional usável

### 4.2 Distribuição sugerida das 4 semanas

**Semana 1 — Fundação técnica**
- Setup do projeto (Next.js, Supabase, Vercel, repositório, CI/CD)
- Modelagem de dados completa (schema dos 9 módulos)
- Autenticação e gestão de usuários
- Layout base + componentes do design system
- Página inicial e navegação

**Semana 2 — Núcleo de conformidade (parte 1)**
- Cadastro de setores e cargos
- Inventário de Riscos completo (todos os tipos, matriz de classificação)
- Templates pré-cadastrados para varejo
- Repositório de documentos (upload, listagem, anexo a entidades)

**Semana 3 — Núcleo de conformidade (parte 2) + IA**
- Plano de Ação completo
- Agente Classificador integrado (Claude API)
- Importação assistida com classificação automática
- Dashboard simples (contadores)

**Semana 4 — PGR + módulos complementares + polimento**
- Geração de PGR em PDF
- Riscos Psicossociais (questionário básico)
- Workflow simplificado (campos de status e aprovador)
- Agente de Atendimento (chat básico)
- Trilha de auditoria (logs nas tabelas)
- Polimento, ajustes, deploy final
- Onboarding com cliente

### 4.3 O que pode escorregar (e plano B)

Se o cronograma apertar, a ordem de **adiamento para Fase 2** é:

1. Agente de Atendimento Interno (chat) → adiar
2. Riscos Psicossociais (módulo de questionário) → adiar, fica como link externo temporário
3. Workflow de Aprovações → adiar, status fica apenas como campo manual
4. Dashboard → versão ultra-mínima (3 contadores no topo)

**O que NÃO pode escorregar de jeito nenhum:**
- Inventário de Riscos
- Plano de Ação
- Geração de PGR em PDF
- Agente Classificador
- Trilha de auditoria mínima nas tabelas

Sem esses, o cliente não tem produto que justifique a contratação.

---

## 5. Arquitetura Técnica

### 5.1 Stack confirmado

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes + Supabase Edge Functions
- **Banco de dados:** Supabase PostgreSQL com Row Level Security
- **Autenticação:** Supabase Auth (email + senha; SSO fica pra Fase 2)
- **Storage:** Supabase Storage para documentos
- **IA:** Anthropic Claude API (Haiku para classificação, Sonnet para chat)
- **Hospedagem:** Vercel + Supabase
- **Email transacional:** Resend
- **Monitoramento:** Sentry + PostHog
- **PDF:** react-pdf ou pdfme

### 5.2 Modelo de dados (alto nível)

Entidades principais:

- `organizacoes` — cliente (multi-tenant preparado para futuro)
- `usuarios` — RH operacional, gestores, responsável técnico
- `setores`, `cargos`, `cargo_setor`
- `colaboradores` (opcional na Fase 1; pode ser apenas cargo-baseado)
- `riscos` — tipo, descrição, fonte, probabilidade, severidade, classificação
- `risco_cargo` — vinculação muitos-para-muitos
- `acoes` — vinculadas a riscos, com responsável, prazo, status
- `documentos` — arquivos com metadados, anexáveis a riscos/ações
- `questionarios_psicossociais` — templates e aplicações
- `respostas_psicossociais` — anônimas, agregáveis
- `pgr_versoes` — cada geração de PDF arquivada
- `logs_auditoria` — eventos críticos
- `mensagens_chat` — histórico do agente de atendimento

### 5.3 Justificativa para Claude (não OpenAI)

- Familiaridade já estabelecida
- Política de retenção de dados favorável
- Performance em classificação contextual em português
- Custo competitivo: Haiku para volume, Sonnet para qualidade
- Padrão único de provider no projeto

### 5.4 LGPD e segurança

- Dados de saúde mental são dados sensíveis (Art. 5º, II da LGPD)
- Anonimização desde a coleta para riscos psicossociais
- Não enviar dados pessoais identificáveis para API de IA quando evitável
- Encarregado de dados (DPO) do cliente: a indicar
- Backup diário, criptografia em trânsito (TLS) e em repouso (Supabase nativo)
- Política de retenção de 20 anos para documentos do PGR

### 5.5 Versionamento e retenção

- Triggers PostgreSQL para audit log automático
- Soft delete em entidades críticas
- Exportação periódica em formato aberto (PDF/A, CSV) para portabilidade
- Backup em storage frio após 2 anos

---

## 6. Critérios de Aceite do MVP

Para o MVP ser considerado entregue, ao final dos 30 dias:

1. **Sistema deployado e acessível** via URL própria (subdomínio do cliente ou Vercel)
2. **Login funcionando** com pelo menos 3 perfis: RH operacional, Gestor, Responsável Técnico
3. **Inventário de Riscos funcional**: capaz de cadastrar setor, cargo, risco completo e classificar
4. **Plano de Ação funcional**: capaz de criar ação vinculada a risco, com responsável e prazo
5. **Agente Classificador**: pelo menos 80% de acerto em classificação de tipo de documento em amostra de teste do cliente
6. **PGR exportável em PDF**: gerado a partir dos dados, formato apresentável
7. **Trilha mínima de auditoria**: registro de quem criou/editou cada entidade
8. **Importação de pelo menos 1 lote real** dos documentos espalhados do cliente, classificados pela IA
9. **Onboarding executado**: RH operacional treinado, com acesso e capaz de operar
10. **Documentação básica**: README de operação, lista de funcionalidades, próximos passos

---

## 7. Roadmap Pós-MVP

### Fase 2 (60 a 90 dias após MVP) — Expansão

- Workflow de aprovação completo com notificações
- Agente de Atendimento com RAG da base
- Riscos Psicossociais com múltiplos templates e análise
- Dashboard com gráficos e visualizações
- Assinatura digital ICP-Brasil
- Trilha de auditoria com interface de consulta
- Integração eSocial (S-2240, S-2220)

### Fase 3 (continuação)

- Agente Redator (rascunhos de PGR, comunicados, atas)
- Agente de Conformidade ativo (monitoramento proativo)
- Canal de Denúncias
- Módulo Financeiro (notas, comprovantes de SST)
- App mobile para gestores
- Módulos de outras NRs (NR-5, NR-7, NR-17)

### Retainer mensal (recomendado)

- Manutenção e correção
- Atualizações regulatórias
- Pequenas evoluções
- Suporte a fiscalizações

---

## 8. Próximos Passos Imediatos

1. **Definição com cliente (Semana 1):**
   - Confirmar responsável técnico (interno ou consultoria)
   - Levantar amostra de documentos para importação
   - Mapear setores e cargos existentes
   - Identificar 3 a 5 riscos críticos para iniciar templates

2. **Setup técnico (Semana 1):**
   - Criar projeto Supabase
   - Criar projeto Vercel
   - Configurar conta Anthropic com limites
   - Criar repositório (recomendado: GitHub privado)
   - Configurar ambientes (dev / prod)

3. **Comunicação contínua:**
   - Reunião semanal de status (30 min)
   - Demos ao final de cada semana
   - Canal direto (WhatsApp ou Slack) para bloqueios

---

## 9. Glossário

- **NR-1:** Norma Regulamentadora nº 1 — Disposições Gerais e Gerenciamento de Riscos Ocupacionais
- **GRO:** Gerenciamento de Riscos Ocupacionais
- **PGR:** Programa de Gerenciamento de Riscos
- **PCMSO:** Programa de Controle Médico de Saúde Ocupacional (NR-7)
- **CIPA:** Comissão Interna de Prevenção de Acidentes (NR-5)
- **SESMT:** Serviços Especializados em Engenharia de Segurança e Medicina do Trabalho
- **eSocial:** Sistema de Escrituração Digital das Obrigações Trabalhistas
- **COPSOQ:** Copenhagen Psychosocial Questionnaire
- **MTE:** Ministério do Trabalho e Emprego
- **Portaria 1.419/2024:** Incluiu riscos psicossociais formalmente na NR-1
- **Portaria 765/2025:** Confirmou prazo de fiscalização punitiva para 26/05/2026
- **LGPD:** Lei Geral de Proteção de Dados Pessoais
- **RAG:** Retrieval-Augmented Generation (técnica para enriquecer respostas de IA com base própria)

---

*Documento para execução. Próxima ação: kickoff e início da Semana 1.*
