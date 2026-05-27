import type { AILogEntry } from '../types/ai-types';

export async function logAICall(_entry: AILogEntry): Promise<void> {
  // Implementação completa em Semana 1 após configuração do Supabase.
  // Grava em tabela ai_logs com retenção e controle de custo.
  if (process.env.NODE_ENV === 'development') {
    console.log('[AI Log]', {
      agent: _entry.agent_type,
      model: _entry.model,
      tokens: _entry.tokens_input + _entry.tokens_output,
      cost: `$${_entry.cost_usd_estimated.toFixed(6)}`,
      latency: `${_entry.latency_ms}ms`,
      success: _entry.success,
    });
  }
}
