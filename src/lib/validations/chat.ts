import { z } from "zod";
import { logPromptInjectionAttempt } from "../security-logger";

// Maximum allowed message length
const MAX_MESSAGE_LENGTH = 2000;

// Regular expression to detect potential prompt injection patterns
const PROMPT_INJECTION_PATTERNS = /(\b(ignore previous instructions|ignore all previous commands|disregard all previous directives|as an AI language model|system prompt|system message)\b)/i;

// Chat message schema with input sanitization
export const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(MAX_MESSAGE_LENGTH, `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`)
    .refine(
      (val) => !PROMPT_INJECTION_PATTERNS.test(val),
      {
        message: "Message contains disallowed patterns",
      }
    ),
  challengeId: z.string().trim().min(1, "Challenge ID is required").optional().or(z.literal('')),
  stageIndex: z.number().int().min(0, "Stage index must be a non-negative integer").optional(),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().max(10000),
    })
  ),
  solution: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    components: z.array(z.any()),
    edges: z.array(z.any()).optional(),
    apiDefinitions: z.array(z.any()).optional(),
    capacityEstimations: z.object({
      traffic: z.string().optional(),
      storage: z.string().optional(),
      bandwidth: z.string().optional(),
      memory: z.string().optional(),
    }).optional(),
    functionalRequirements: z.string().optional(),
    nonFunctionalRequirements: z.string().optional(),
  }).optional(),
  // New fields for playground mode
  isPlayground: z.boolean().optional(),
  playgroundId: z.string().trim().optional(),
  playgroundTitle: z.string().trim().optional(),
});

// Type for the validated chat message input
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

// Additional content moderation checks
export const containsSensitiveContent = (text: string): boolean => {
  // Add checks for other sensitive content patterns
  const sensitivePatterns = [
    // Add patterns for other types of harmful content if needed
    /\bdox\b|\bhack\b|\bexploit\b/i,
  ];
  
  return sensitivePatterns.some(pattern => pattern.test(text));
};

// Check for potential prompt injection and log it if detected
export const checkAndLogPromptInjection = (
  message: string, 
  userId?: string, 
  ipAddress?: string | null, 
  endpoint = '/api/chat'
): boolean => {
  const detectedPatterns: string[] = [];
  
  const patterns = [
    {name: 'instruction_override', pattern: /\b(ignore previous instructions|ignore all previous commands|disregard all previous directives)\b/i},
    {name: 'system_prompt_reveal', pattern: /\b(as an AI language model|system prompt|system message)\b/i},
    {name: 'role_playing', pattern: /\b(you are now|pretend to be|act as if|simulate being)\b/i},
    {name: 'delimiter_injection', pattern: /\b(user:|assistant:|system:)\b/i},
    {name: 'encoding_tricks', pattern: /unicode|base64|hex|binary|octal|morse|ascii art/i},
  ];
  
  const hasInjection = patterns.some(({name, pattern}) => {
    if (pattern.test(message)) {
      detectedPatterns.push(name);
      return true;
    }
    return false;
  });
  
  if (hasInjection) {
    logPromptInjectionAttempt({
      message,
      userId,
      ipAddress,
      endpoint,
      detectedPatterns,
    });
    return true;
  }
  
  return false;
};

// Sanitize input to remove potential harmful characters
export const sanitizeInput = (input: string): string => {
  // Remove control characters and zero-width spaces that could be used to hide content
  return input
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202F\u205F-\u206F]/g, "")
    .trim();
}; 