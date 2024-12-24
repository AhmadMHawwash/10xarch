// A simple token estimation function based on word count and special characters
export function calculateTokens(text: string): number {
  // Split by whitespace and special characters
  const words = text.split(/[\s\n.,!?;:'"()\[\]{}/<>\\|=+\-*&^%$#@]+/);
  // Filter out empty strings
  const nonEmptyWords = words.filter(word => word.length > 0);
  // Add extra tokens for special characters and formatting
  const specialChars = text.match(/[.,!?;:'"()\[\]{}/<>\\|=+\-*&^%$#@\n]/g)?.length ?? 0;
  
  // Each word is roughly 1.3 tokens on average
  return Math.ceil(nonEmptyWords.length * 1.3 + specialChars);
}

// Cost per 1K tokens
export const TOKEN_COSTS = {
  "gpt-4": {
    input: 0.03,
    output: 0.06,
  },
  "gpt-4o-mini": {
    input: 0.01,
    output: 0.03,
  },
} as const;

// Convert cost to credits (1 credit = $0.01)
export function costToCredits(cost: number): number {
  return Math.ceil(cost * 100);
}
