import { z } from "zod";
import { sanitizeInput, checkAndLogPromptInjection } from "./chat";
import { logSecurityEvent } from "../security-logger";

// Maximum prompt length for challenge submissions
const MAX_PROMPT_LENGTH = 10000;

// Regular expression to detect potential prompt injection patterns
const PROMPT_INJECTION_PATTERNS = /(\b(ignore previous instructions|ignore all previous commands|disregard all previous directives|as an AI language model|system prompt|system message)\b)/i;

// Regular expression to detect markdown code blocks that might be used to hide instructions
const CODE_BLOCK_PATTERN = /```[a-zA-Z]*\n(.*?)\n```/gs;

// Safe criteria validation - ensures criteria are reasonable
export const challengeCriteriaSchema = z.array(
  z.string()
    .trim()
    .min(3, "Criteria must be at least 3 characters")
    .max(500, "Criteria too long")
);

// Challenge solution validation schema
export const challengeSolutionSchema = z.object({
  challengeSlug: z.string().trim().min(1, "Challenge slug is required"),
  criteria: challengeCriteriaSchema,
  challengeAndSolutionPrompt: z
    .string()
    .trim()
    .min(10, "Solution prompt too short")
    .max(MAX_PROMPT_LENGTH, `Solution prompt cannot exceed ${MAX_PROMPT_LENGTH} characters`)
    .refine(
      (val) => !PROMPT_INJECTION_PATTERNS.test(val),
      {
        message: "Solution contains disallowed patterns",
      }
    ),
  bypassInternalToken: z.string().optional(),
});

// Playground solution validation schema
export const playgroundSolutionSchema = z.object({
  systemDesign: z
    .string()
    .trim()
    .min(10, "System design too short")
    .max(MAX_PROMPT_LENGTH, `System design cannot exceed ${MAX_PROMPT_LENGTH} characters`)
    .refine(
      (val) => !PROMPT_INJECTION_PATTERNS.test(val),
      {
        message: "System design contains disallowed patterns",
      }
    ),
  systemDesignContext: z
    .string()
    .trim()
    .max(5000, "System design context too long")
    .optional(),
  playgroundId: z
    .string()
    .uuid("Invalid playground ID")
    .optional(),
});

// Type for the validated challenge solution
export type ChallengeSolutionInput = z.infer<typeof challengeSolutionSchema>;
export type PlaygroundSolutionInput = z.infer<typeof playgroundSolutionSchema>;

// Function to sanitize challenge and solution prompts
export const sanitizePrompt = (prompt: string, userId?: string, ipAddress?: string | null, endpoint = '/api/challenge'): string => {
  let sanitized = sanitizeInput(prompt);
  
  // Check for potential prompt injection in the main solution prompt
  checkAndLogPromptInjection(sanitized, userId, ipAddress, endpoint);
  
  // Remove any potential hidden instructions in code blocks
  sanitized = sanitized.replace(CODE_BLOCK_PATTERN, (match, codeContent: string) => {
    // Check code blocks for potential injection attempts
    if (PROMPT_INJECTION_PATTERNS.test(codeContent)) {
      // Log the attempt with the specific code block content
      logSecurityEvent({
        eventType: 'prompt-injection-attempt',
        message: 'Potential prompt injection in code block detected',
        userId,
        ipAddress: ipAddress ?? undefined,
        endpoint,
        metadata: {
          codeSnippet: codeContent.substring(0, 100) + (codeContent.length > 100 ? '...' : ''),
        },
      });
      
      return "```\n[Code block removed due to policy violation]\n```";
    }
    return match;
  });
  
  return sanitized;
}; 