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

// Credit packages for one-time purchases
export const CREDIT_PACKAGES = {
  small: { 
    name: "Starter Pack",
    description: "Perfect for trying out the platform",
    tokens: 1000, 
    bonusTokens: 0,
    price: 5,
    totalTokens: 1000,
  },
  medium: { 
    name: "Creator Bundle",
    description: "Great for regular users and small projects",
    tokens: 2000, 
    bonusTokens: 100,
    price: 10,
    totalTokens: 2100,
  },
  large: { 
    name: "Power User",
    description: "Ideal for heavy usage and larger projects",
    tokens: 5000, 
    bonusTokens: 500,
    price: 25,
    totalTokens: 5500,
  },
  extra_large: { 
    name: "Professional",
    description: "Maximum value for teams and power users",
    tokens: 10000, 
    bonusTokens: 1500,
    price: 50,
    totalTokens: 11500,
  },
} as const;

// Subscription tier constants
export const SUBSCRIPTION_TIERS = {
  pro: {
    name: "Team Start", 
    monthlyTokens: 15000,
    priceId: "price_1RUB5RLNbPmrufVhctyMl2w9",
  },
  premium: {
    name: "Team Pro",
    monthlyTokens: 25000,
    priceId: "price_1RUB7BLNbPmrufVh7fW5R2Cg",
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// Helper function to get subscription token amount by tier
export function getSubscriptionTokens(tier: string): number {
  const subscriptionTier = SUBSCRIPTION_TIERS[tier as SubscriptionTier];
  return subscriptionTier?.monthlyTokens ?? 0;
}

// Helper function to get tier by Stripe price ID
export function getTierByPriceId(priceId: string): SubscriptionTier | null {
  for (const [tierKey, tierData] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (tierData.priceId === priceId) {
      return tierKey as SubscriptionTier;
    }
  }
  return null;
}

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
