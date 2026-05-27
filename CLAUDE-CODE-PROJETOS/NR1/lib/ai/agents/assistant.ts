// Implementação básica na Semana 4.
// Chat com prompt fixo, sem RAG. RAG completo fica para Fase 2.
export async function chat(
  _messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  _userProfile: 'rh_operacional' | 'gestor' | 'responsavel_tecnico'
): Promise<AsyncIterable<string>> {
  throw new Error('Agente de Atendimento não implementado. Implementar na Semana 4.');
}
