const PRICE_PER_1K_INPUT_USD: Record<string, number> = {
  'claude-haiku-4-5-20251001': 0.00025,
  'claude-sonnet-4-6':         0.003,
};

const PRICE_PER_1K_OUTPUT_USD: Record<string, number> = {
  'claude-haiku-4-5-20251001': 0.00125,
  'claude-sonnet-4-6':         0.015,
};

export function estimateCostUSD(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const inputRate = PRICE_PER_1K_INPUT_USD[model] ?? 0;
  const outputRate = PRICE_PER_1K_OUTPUT_USD[model] ?? 0;
  return (inputTokens / 1000) * inputRate + (outputTokens / 1000) * outputRate;
}
