import Anthropic from '@anthropic-ai/sdk';

export const MODELS = {
  classifier: 'claude-haiku-4-5-20251001',
  assistant:  'claude-sonnet-4-6',
} as const;

export type ModelKey = keyof typeof MODELS;

export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY não configurada. Verifique .env.local');
  }
  return new Anthropic({
    apiKey,
    timeout: 60_000,
    maxRetries: 0, // retry gerenciado por lib/ai/utils/retry.ts
  });
}
