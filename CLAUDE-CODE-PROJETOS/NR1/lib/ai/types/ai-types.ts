export interface ClassificationResult {
  tipo_documento: string;
  setor_sugerido: string | null;
  tags: string[];
  risco_relacionado: string | null;
  nr_aplicavel: string[];
  confianca: 'alta' | 'media' | 'baixa';
  justificativa: string;
}

export type AgentType = 'classifier' | 'assistant';

export interface AILogEntry {
  user_id: string;
  agent_type: AgentType;
  model: string;
  tokens_input: number;
  tokens_output: number;
  cost_usd_estimated: number;
  latency_ms: number;
  success: boolean;
  error_message?: string;
  input_hash?: string;
}

export type ClassificationStatus = 'pendente' | 'aceita' | 'editada' | 'rejeitada';

export interface ClassificationFeedback {
  status: ClassificationStatus;
  edicao_humana?: Partial<ClassificationResult>;
  confirmada_por: string;
  confirmada_em: string;
}
