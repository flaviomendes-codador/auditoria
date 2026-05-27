# Escopo — Camada de Agentes de IA
## Plataforma de Conformidade NR-1

**Cliente:** [a preencher]
**Fornecedor:** Flávio Mendes
**Data:** 26 de maio de 2026
**Versão:** 1.0
**Documento complementar a:** Escopo-NR1.md
**Prazo:** Incluído nos 30 dias do projeto principal
**Investimento:** Incluído nos R$ 15.000 do projeto principal

---

## 1. Objetivo

Definir o que está dentro e fora do escopo da camada de Inteligência Artificial da Plataforma de Conformidade NR-1. Esta camada é composta por agentes que operam em cima do sistema núcleo, apoiando o RH operacional e os gestores com produtividade e automação inteligente.

---

## 2. Filosofia da Camada de IA

Três princípios orientam o desenho dos agentes:

1. **IA apoia, humano decide.** Nenhum agente toma decisão final que afete conformidade legal. Sempre apresenta sugestão para confirmação humana.
2. **Sistema é fonte de verdade.** Os agentes consultam e operam sobre os dados do sistema, mas não substituem o sistema como repositório oficial.
3. **Rastreabilidade total.** Toda interação com IA é registrada (input, output, modelo, custo, decisão humana subsequente).

---

## 3. Agentes do MVP (30 dias)

Dois agentes compõem a camada de IA do MVP:

### 3.1 Agente Classificador

**O que faz:** Recebe documento (PDF, imagem, planilha, texto) e produz classificação estruturada para apoiar a organização no sistema.

**Saídas:**
- Tipo do documento (ex: ASO, ficha de EPI, treinamento, ata de CIPA, laudo, NR aplicável)
- Setor sugerido (com base no conteúdo)
- Tags sugeridas
- Risco ocupacional relacionado (se identificável)
- Confiança da classificação (alta / média / baixa)

**Estado de entrega no MVP:** Versão completa, operacional.

### 3.2 Agente de Atendimento Interno

**O que faz:** Interface de chat dentro do sistema, responde dúvidas operacionais sobre a plataforma e sobre processos básicos de NR-1.

**Saídas:**
- Respostas em linguagem natural a perguntas como: "como cadastro um novo risco?", "onde está o documento X?", "qual o status da ação Y?"
- Indicação de link/tela quando aplicável
- Recusa explícita quando a pergunta sai do escopo (ex: parecer técnico de SST)

**Estado de entrega no MVP:** Versão básica, operacional, com prompt fixo e acesso limitado a metadados (sem RAG completo da base do cliente).

---

## 4. Está Dentro do Escopo

### 4.1 Agente Classificador

- Endpoint de classificação que recebe arquivo ou texto e retorna estrutura JSON
- Suporte a formatos: PDF (com OCR básico), imagens (JPG, PNG), texto puro, planilhas (CSV, XLSX em texto)
- Classificação em massa para importação assistida
- Interface de revisão humana antes de salvar (sempre)
- Tela de upload com classificação em tempo real
- Histórico de classificações e correções humanas
- Métrica de acurácia mensurável (taxa de confirmação humana)

### 4.2 Agente de Atendimento Interno

- Widget de chat acessível em todas as telas do sistema
- Histórico de conversa por usuário
- Prompt do sistema com escopo claro (NR-1, plataforma, processos básicos)
- Recusa estruturada para perguntas fora do escopo
- Botão "Foi útil?" para coleta de feedback
- Indicação de fonte/tela quando aplicável

### 4.3 Infraestrutura compartilhada

- Cliente Anthropic configurado (Haiku 4.5 para classificação, Sonnet 4.6 para chat)
- Sistema de logging de prompts e respostas (com retenção e custo controlado)
- Camada de anonimização para dados sensíveis antes de enviar ao Claude API
- Tratamento de erros e retry com backoff
- Limites de custo configuráveis (alerta em consumo elevado)
- Tabela de auditoria de uso de IA (quem usou, quando, qual agente, custo estimado)

### 4.4 Conformidade LGPD na camada de IA

- Política de não envio de dados pessoais identificáveis quando evitável
- Anonimização automática de CPF, RG, email, telefone antes de prompts
- Política de retenção de logs alinhada à LGPD
- Documentação de quais dados são processados pela IA (transparência para DPO do cliente)

---

## 5. Está Fora do Escopo

### 5.1 Funcionalidades de IA fora do MVP

- **Agente Redator** — geração de rascunhos de PGR, comunicados, atas (Fase 2)
- **Agente de Conformidade ativo** — monitoramento proativo e alertas inteligentes (Fase 2)
- **Agente de Riscos Psicossociais** — análise qualitativa profunda de respostas de questionário (Fase 2)
- **RAG completo do Agente de Atendimento** — busca semântica na base completa de documentos do cliente (Fase 2)
- **Fine-tuning** ou treinamento de modelo customizado
- **Multi-provider** (OpenAI, Gemini, etc.) — projeto usa apenas Anthropic
- **Voz** (text-to-speech ou speech-to-text)
- **OCR avançado** para documentos manuscritos ou de baixa qualidade
- **Análise de imagem complexa** (laudos com fotos, plantas baixas, etc.)
- **Geração automatizada de planos de ação** sem revisão humana
- **Tradução** de documentos para outros idiomas
- **Resumo automático** de documentos longos

### 5.2 Garantias fora do escopo

- Garantia de acurácia 100% da classificação (meta é 80% em amostra de teste)
- Garantia de respostas sempre corretas do Agente de Atendimento
- Substituição de profissional habilitado em decisões técnicas de SST
- Conformidade legal automática

---

## 6. Premissas Específicas da Camada de IA

1. Cliente entende que IA pode errar e o fluxo prevê confirmação humana sempre
2. Cliente arcará com o custo de uso da Anthropic API após o MVP (estimativa a ser apresentada)
3. Cliente concorda com o envio anonimizado de conteúdo de documentos para a API da Anthropic, conforme política de privacidade da plataforma
4. Cliente fornecerá amostra de pelo menos 30 documentos rotulados manualmente para validação de acurácia do Classificador

---

## 7. Estimativa de Custo Operacional de IA (pós-MVP)

A ser refinada com base no volume real do cliente, mas para dimensionamento inicial:

**Premissas de uso mensal estimado:**
- Classificação: 500 documentos/mês × ~2.000 tokens médios = ~1.000.000 tokens com Haiku
- Atendimento: 200 conversas/mês × ~5.000 tokens médios = ~1.000.000 tokens com Sonnet

**Estimativa de custo mensal:**
- Haiku 4.5: cerca de US$ 1 a US$ 3/mês
- Sonnet 4.6: cerca de US$ 10 a US$ 30/mês
- **Total estimado:** US$ 15 a US$ 35/mês de IA (não inclui infra Supabase/Vercel)

**Importante:** os valores são estimativas baseadas em volume hipotético. O custo real depende do uso e dos preços atuais da Anthropic, que devem ser confirmados antes de comprometer com o cliente.

---

## 8. Critérios de Aceite Específicos dos Agentes

Os agentes são considerados entregues quando:

1. **Classificador:** atinge ≥80% de taxa de confirmação humana em amostra de teste fornecida pelo cliente (mínimo 30 documentos)
2. **Classificador:** funciona em importação em lote de pelo menos 50 documentos sem falha de processamento
3. **Atendimento:** responde adequadamente (com utilidade ou recusa explícita) a 10 perguntas-teste definidas no kickoff
4. **Atendimento:** recusa corretamente perguntas fora do escopo (não inventa pareceres técnicos)
5. **Infraestrutura:** todos os logs de uso de IA são gravados e consultáveis
6. **LGPD:** anonimização de CPF/email funcionando em pipeline de classificação

---

## 9. Responsabilidades Específicas

### 9.1 Do fornecedor

- Desenvolver os dois agentes conforme especificação
- Configurar a infraestrutura de IA
- Implementar guardrails (anti-alucinação, recusas estruturadas)
- Documentar prompts utilizados
- Treinar o RH em como usar e quando questionar a IA

### 9.2 Do cliente

- Fornecer amostra rotulada de documentos para validação
- Definir as 10 perguntas-teste do Agente de Atendimento no kickoff
- Manter conta Anthropic ativa após o MVP (custo recorrente sob sua responsabilidade)
- Comunicar aos colaboradores sobre o uso de IA na plataforma (transparência LGPD)

### 9.3 Não é responsabilidade do fornecedor

- Garantir que a IA nunca cometa erros
- Cobrir custos de API Anthropic após o MVP
- Substituir profissional habilitado em decisões técnicas
- Responder por decisões tomadas pelo cliente baseadas em saídas de IA

---

## 10. Roadmap dos Agentes (pós-MVP)

| Agente | Estado MVP | Próxima evolução (Fase 2) |
|--------|-----------|---------------------------|
| Classificador | Completo | Suporte a documentos manuscritos, classificação por subcategorias |
| Atendimento Interno | Básico (prompt fixo) | RAG completo da base do cliente, citação de fontes |
| Redator | Fora do MVP | Versão básica: gerar comunicados e rascunhos de plano de ação |
| Conformidade | Fora do MVP | Monitoramento proativo, alertas inteligentes |
| Riscos Psicossociais | Fora do MVP | Análise qualitativa de respostas abertas |

---

*Documento complementar ao Escopo do Projeto. Lido em conjunto com o Escopo-NR1.md.*
