import type { ClassificationResult } from '../types/ai-types';

// Implementação completa na Semana 3.
// Pipeline: extração de texto → anonimização → Haiku → validação JSON → UI de revisão.
// Meta MVP: ≥80% de confirmação humana em amostra de ≥30 documentos.
export async function classifyDocument(
  _textContent: string
): Promise<ClassificationResult> {
  throw new Error('Classificador não implementado. Implementar na Semana 3.');
}
