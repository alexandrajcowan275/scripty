// Standard processing USD per million tokens. Official model pages checked
// 2026-10-17. These are usage-derived estimates, never a provider invoice.
export function usageCost(model: string, usage: Record<string, unknown>): number | null {
  const input = Number(usage.input_tokens), output = Number(usage.output_tokens);
  if (![input, output].every(n => Number.isFinite(n) && n >= 0)) return null;
  let cost: number;
  if (/^gpt-image-(?:1\.5|2(?:\.5-sunburst)?)(?:-|$)/.test(model)) {
    const details = usage.input_tokens_details as { text_tokens?: number; image_tokens?: number } | undefined;
    const text = details?.text_tokens, image = details?.image_tokens;
    // Unknown modality split is charged at the higher input rate. Ignore cache
    // discounts rather than undercounting when modality/cached detail is absent.
    const inputCost = typeof text === "number" && typeof image === "number" && text + image === input ? text * 5 + image * 8 : input * 8;
    cost = (inputCost + output * (model.startsWith("gpt-image-1.5") ? 32 : 30)) / 1e6;
  } else {
    const rate = model.startsWith("gpt-5.4-mini") ? [0.75, 4.5] : model.startsWith("gpt-4.1-mini") ? [0.4, 1.6] : model.startsWith("gpt-4o-mini") ? [0.15, 0.6] : null;
    if (!rate) return null;
    cost = (input * rate[0] + output * rate[1]) / 1e6;
  }
  return Math.ceil(cost * 1e6) / 1e6;
}
