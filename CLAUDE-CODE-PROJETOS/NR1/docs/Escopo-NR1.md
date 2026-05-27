# Escopo do Projeto — Plataforma de Conformidade NR-1

**Cliente:** [a preencher]
**Fornecedor:** Flávio Mendes
**Data:** 26 de maio de 2026
**Versão:** 1.0
**Prazo:** 30 dias corridos a partir do kickoff
**Investimento:** R$ 15.000,00

---

## 1. Objetivo

Entregar plataforma web produtiva (sistema + agente de IA) para gestão da conformidade com a Norma Regulamentadora nº 1 (NR-1), atualizada pela Portaria MTE 1.419/2024, com fiscalização punitiva ativa desde 26/05/2026.

A plataforma centraliza a documentação de SST hoje espalhada, gerencia o Inventário de Riscos e o Plano de Ação exigidos pelo PGR, e usa IA para classificar documentos importados.

---

## 2. Está Dentro do Escopo

### 2.1 Sistema (núcleo)

**Inventário de Riscos Ocupacionais**
- Cadastro de setores e cargos
- Cadastro de riscos por tipo: físicos, químicos, biológicos, ergonômicos, mecânicos, psicossociais
- Classificação por matriz de probabilidade × severidade
- Vinculação risco ↔ cargo ↔ documento
- Templates pré-cadastrados para riscos típicos de varejo

**Plano de Ação**
- Criação de ações vinculadas a riscos
- Tipo da medida (eliminação, substituição, engenharia, administrativo, EPI)
- Responsável, prazo, status, evidências
- Cronograma visual
- Notificações de prazo via email (consolidado diário)

**Repositório de Documentos (versão simplificada)**
- Upload manual (drag-and-drop)
- Importação em lote
- Listagem com filtros básicos
- Anexar documento a risco ou ação

**Geração do PGR em PDF**
- Template fixo conforme estrutura recomendada
- Geração com um clique a partir do Inventário + Plano de Ação
- Versionamento de gerações (cada exportação fica arquivada)
- Assinatura simples (nome do responsável, data, hash)

**Riscos Psicossociais (versão básica)**
- 1 template de questionário pré-configurado (COPSOQ simplificado)
- Aplicação anônima via link
- Coleta com anonimização
- Consolidação por setor/cargo
- Geração de risco psicossocial integrado ao inventário

**Workflow de Aprovações (versão simplificada)**
- Campos de status (rascunho, submetido, aprovado, publicado)
- Registro de aprovador e data
- Bloqueio de edição após aprovação

**Dashboard de Conformidade (versão simples)**
- Contadores: total de riscos, ações em atraso, documentos
- Tabela de pendências
- Indicador macro de prontidão

**Trilha de Auditoria (versão mínima)**
- Registro automático de quem criou/editou cada entidade
- Log de ações críticas (criação, edição, aprovação, exclusão)
- Retenção dos dados conforme exigência regulatória (20 anos)

### 2.2 Agentes de IA

**Agente Classificador (versão completa)**
- Recebe documento → classifica tipo, sugere setor e tags, identifica risco relacionado
- Sempre apresenta sugestão para humano confirmar
- Importação assistida com classificação automática em lote

**Agente de Atendimento Interno (versão básica)**
- Interface de chat dentro do sistema
- Responde dúvidas operacionais sobre a plataforma e processos
- Prompt fixo (sem RAG completo da base do cliente)

### 2.3 Infraestrutura e operação

- Stack: Next.js + Supabase + Vercel + Anthropic Claude API
- Deploy em ambiente de produção próprio
- Autenticação com pelo menos 3 perfis: RH Operacional, Gestor, Responsável Técnico
- Domínio próprio (subdomínio do cliente ou Vercel)
- Backup diário automático
- Criptografia em trânsito (TLS) e em repouso
- Conformidade LGPD para dados sensíveis

### 2.4 Entrega e capacitação

- Sistema deployado em produção
- Importação inicial de pelo menos 1 lote real de documentos do cliente
- Sessão de onboarding com RH operacional
- Documentação básica: README de operação, lista de funcionalidades

---

## 3. Está Fora do Escopo

Os itens abaixo **não fazem parte deste projeto** e ficam para fases futuras (contratação separada).

### 3.1 Funcionalidades fora

- Integração com eSocial (eventos S-2240 e S-2220)
- Assinatura digital com certificado ICP-Brasil
- Workflow de aprovação automatizado com múltiplos níveis
- Múltiplos templates de questionário psicossocial (COPSOQ completo, JCQ, customizados)
- Análise qualitativa profunda de respostas psicossociais por IA
- Agente Redator (geração de rascunhos de PGR, comunicados, atas)
- Agente de Conformidade ativo (monitoramento proativo)
- RAG completo do Agente de Atendimento sobre a base do cliente
- Canal de Denúncias integrado
- Módulo Financeiro (notas, comprovantes de SST)
- Interface de consulta avançada da trilha de auditoria
- Dashboard com gráficos e visualizações customizáveis
- Editor visual de template do PGR
- App mobile nativo
- Módulos de outras NRs (NR-5 CIPA, NR-7 PCMSO, NR-17, etc.)
- Single Sign-On (SSO) com provedores externos
- Integração com outros sistemas do cliente (ERP, folha, ponto)

### 3.2 Serviços fora

- Elaboração técnica do conteúdo do PGR (riscos específicos, medidas)
- Aplicação prática de questionário psicossocial (interpretação de resultados)
- Consultoria em segurança do trabalho
- Treinamento de colaboradores em NR-1 ou SST
- Assinatura legal do PGR (responsabilidade do profissional habilitado do cliente)
- Defesa em fiscalização ou processos trabalhistas
- Suporte 24/7

---

## 4. Premissas

Estas condições são consideradas verdadeiras para o cumprimento do prazo e escopo. Caso alguma não se confirme, o projeto pode requerer ajuste de prazo, escopo ou valor.

1. Cliente disponibilizará pelo menos um representante do RH para validações semanais
2. Cliente fornecerá, na Semana 1, amostra dos documentos atuais de SST para importação
3. Cliente fornecerá lista de setores e cargos existentes na Semana 1
4. Cliente indicará, até a Semana 2, quem será o responsável técnico (interno, consultoria ou a contratar) que assinará o PGR
5. Cliente indicará o encarregado de dados pessoais (DPO) para questões de LGPD
6. Cliente arcará com custos próprios de: domínio, certificado digital (se optar por usar), conta de email transacional para notificações em volume além do plano gratuito
7. Decisões de validação serão dadas em até 2 dias úteis após solicitação
8. Não haverá mudanças regulatórias adicionais à NR-1 durante o prazo de execução

---

## 5. Responsabilidades

### 5.1 Do fornecedor (Flávio Mendes)

- Desenvolvimento de todo o software descrito no escopo dentro
- Deploy em ambiente de produção
- Configuração de integrações (Anthropic, Supabase, Vercel, Resend)
- Importação assistida da amostra de documentos
- Onboarding e documentação básica
- Comunicação semanal de status
- Correção de bugs identificados durante o projeto

### 5.2 Do cliente

- Disponibilidade para validações conforme premissas
- Fornecimento de dados e documentos necessários
- Indicação de usuários para os perfis do sistema
- Indicação do responsável técnico para o PGR
- Indicação do DPO
- Aprovação ou pedido de ajuste em até 2 dias úteis
- Pagamento conforme acordado

### 5.3 Não é responsabilidade do fornecedor

- Conformidade legal real da empresa com a NR-1 — esta é responsabilidade do empregador
- Conteúdo técnico do PGR (quais riscos existem, quais medidas adotar) — responsabilidade do profissional habilitado contratado pelo cliente
- Decisões organizacionais e processuais do cliente
- Suporte a fiscalização presencial ou litígios

---

## 6. Cronograma

| Semana | Marco |
|--------|-------|
| 1 | Setup técnico, modelagem de dados, autenticação, layout base, kickoff e descoberta |
| 2 | Inventário de Riscos completo, cadastro de setores/cargos, repositório básico, templates de varejo |
| 3 | Plano de Ação completo, Agente Classificador integrado, importação assistida, dashboard simples |
| 4 | Geração de PGR em PDF, Riscos Psicossociais, workflow simplificado, Agente de Atendimento básico, polimento, deploy final, onboarding |

**Marco final:** Sistema em produção, com importação real concluída, RH operacional treinado e capaz de operar.

---

## 7. Critérios de Aceite

O projeto é considerado entregue quando os 10 critérios abaixo forem cumpridos:

1. Sistema deployado e acessível via URL própria
2. Login funcionando com pelo menos 3 perfis (RH Operacional, Gestor, Responsável Técnico)
3. Inventário de Riscos funcional: cadastro completo de setor, cargo, risco e classificação
4. Plano de Ação funcional: criação de ação vinculada a risco com responsável e prazo
5. Agente Classificador com pelo menos 80% de acerto em classificação de tipo de documento em amostra de teste
6. PGR exportável em PDF a partir dos dados, em formato apresentável
7. Trilha mínima de auditoria registrando criação e edição de entidades
8. Importação de pelo menos 1 lote real de documentos do cliente, classificados pela IA
9. Onboarding executado com o RH operacional, com acesso ativo e capaz de operar
10. Documentação básica entregue (README, lista de funcionalidades, próximos passos)

---

## 8. Investimento e Pagamento

**Valor total:** R$ 15.000,00

**Sugestão de parcelamento** (a negociar com cliente):
- 50% (R$ 7.500,00) na assinatura do contrato / kickoff
- 50% (R$ 7.500,00) na entrega do MVP (cumprimento dos critérios de aceite)

**Não incluso no valor:**
- Custos de infraestrutura recorrente após a entrega (Supabase, Vercel, Anthropic, Resend) — passam a ser de responsabilidade do cliente
- Estimativa mensal de custo de infraestrutura para o porte do cliente: a apresentar antes do término do projeto

---

## 9. Mudanças de Escopo

Qualquer pedido de inclusão de funcionalidade listada como "fora do escopo" ou expansão significativa de funcionalidade do escopo dentro é considerada mudança de escopo e pode requerer:

- Aditivo de prazo
- Aditivo de valor
- Aditivo de ambos

Mudanças serão documentadas por escrito antes da execução.

---

## 10. Próximos Passos

1. Revisão deste documento por ambas as partes
2. Ajustes finais e versão definitiva
3. Assinatura do contrato
4. Kickoff (Semana 1, Dia 1)

---

*Documento elaborado para servir como anexo de contrato e referência operacional do projeto.*
