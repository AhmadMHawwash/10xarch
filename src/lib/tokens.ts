// Token pricing based on gpt-4-mini costs
// Input: $0.01/1K tokens, Output: $0.03/1K tokens
export const TOKENS_PER_DOLLAR = 200; // Base tokens per dollar
export const MIN_AMOUNT = 5;
export const MAX_AMOUNT = 100;

export const BONUS_TIERS = [
  { threshold: 100, bonus: 1.2 }, // 20% bonus
  { threshold: 50, bonus: 1.15 }, // 15% bonus
  { threshold: 20, bonus: 1.1 }, // 10% bonus
  { threshold: 10, bonus: 1.05 }, // 5% bonus
] as const;

export type TokenBreakdown = {
  baseTokens: number;
  bonusTokens: number;
  totalTokens: number;
  bonusPercentage: number;
};

export function calculateTokens(dollars: number): TokenBreakdown {
  const baseTokens = Math.floor(dollars * TOKENS_PER_DOLLAR);
  const tier = BONUS_TIERS.find((tier) => dollars >= tier.threshold);
  const bonusMultiplier = tier?.bonus ?? 1;
  const totalTokens = Math.floor(baseTokens * bonusMultiplier);
  const bonusTokens = totalTokens - baseTokens;
  const bonusPercentage = Math.round((bonusMultiplier - 1) * 100);

  return {
    baseTokens,
    bonusTokens,
    totalTokens,
    bonusPercentage,
  };
}

export function isValidAmount(amount: number): boolean {
  return !isNaN(amount) && amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
}
