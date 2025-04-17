// Constants for credit purchase
export const TOKENS_PER_DOLLAR = 200; // Base tokens per dollar
export const MIN_AMOUNT = 5;
export const MAX_AMOUNT = 100;

export const BONUS_TIERS = [
  { threshold: 100, bonus: 1.2 }, // 20% bonus
  { threshold: 50, bonus: 1.15 }, // 15% bonus
  { threshold: 20, bonus: 1.1 }, // 10% bonus
  { threshold: 10, bonus: 1.05 }, // 5% bonus
] as const;

// GPT model costs per 1K tokens
export const GPT_TOKEN_COSTS = {
  "gpt-4": {
    input: 0.03,
    output: 0.06,
  },
  "gpt-4o-mini": {
    input: 0.01,
    output: 0.03,
  },
  "gpt-4.1-mini": {
    input: 0.015,
    output: 0.04,
  },
} as const;

// Types
export type TokenBreakdown = {
  baseTokens: number;
  bonusTokens: number;
  totalTokens: number;
  bonusPercentage: number;
};

// Functions for credit purchase calculations
export function calculatePurchaseTokens(dollars: number): TokenBreakdown {
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

// Functions for text token calculations
export function calculateTextTokens(text: string): number {
  // Split by whitespace and special characters
  const words = text.split(/[\s\n.,!?;:'"()\[\]{}/<>\\|=+\-*&^%$#@]+/);
  // Filter out empty strings
  const nonEmptyWords = words.filter(word => word.length > 0);
  // Add extra tokens for special characters and formatting
  const specialChars = text.match(/[.,!?;:'"()\[\]{}/<>\\|=+\-*&^%$#@\n]/g)?.length ?? 0;
  
  // Each word is roughly 1.3 tokens on average
  return Math.ceil(nonEmptyWords.length * 1.3 + specialChars);
}

// Utility functions
export function costToCredits(cost: number): number {
  return Math.ceil(cost * 100);
}

export function isValidAmount(amount: number): boolean {
  return !isNaN(amount) && amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
}

// Utility functions for token cost calculations
export function calculateTokenCost(tokens: number, costPer1K: number): number {
  return (tokens / 1000) * costPer1K;
}

export function calculateGPTCost(inputTokens: number, outputTokens: number, model: keyof typeof GPT_TOKEN_COSTS = 'gpt-4'): number {
  const costs = GPT_TOKEN_COSTS[model];
  const inputCost = calculateTokenCost(inputTokens, costs.input);
  const outputCost = calculateTokenCost(outputTokens, costs.output);
  return inputCost + outputCost;
}
