/**
 * Security Logger Utility
 * 
 * This module provides functions for logging security-related events
 * in a standardized format to help identify potential attacks.
 */

type SecurityEventType = 
  | 'prompt-injection-attempt'
  | 'rate-limit-exceeded'
  | 'unauthorized-access'
  | 'input-validation-failure'
  | 'suspicious-activity'
  | 'insufficient-credits';

interface SecurityLogEvent {
  eventType: SecurityEventType;
  message: string;
  userId?: string;
  ipAddress?: string;
  endpoint?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Log a security event with standardized format
 */
export function logSecurityEvent({
  eventType,
  message,
  userId,
  ipAddress,
  endpoint,
  metadata = {},
}: Omit<SecurityLogEvent, 'timestamp'>) {
  const event: SecurityLogEvent = {
    eventType,
    message,
    userId,
    ipAddress,
    endpoint,
    metadata,
    timestamp: new Date().toISOString(),
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ SECURITY EVENT:', event);
    return;
  }
  
  // In production, we would log to a proper monitoring system
  // This could be replaced with actual monitoring service integration
  console.error(JSON.stringify(event));
  
  // Here you would integrate with your monitoring service:
  // Examples:
  // - Send to logging service (DataDog, New Relic, etc.)
  // - Store in database for security auditing
  // - Trigger alerts for specific event types
}

/**
 * Log a prompt injection attempt
 */
export function logPromptInjectionAttempt({
  message,
  userId,
  ipAddress,
  endpoint,
  detectedPatterns,
}: {
  message: string;
  userId?: string;
  ipAddress?: string | null;
  endpoint?: string;
  detectedPatterns: string[];
}) {
  logSecurityEvent({
    eventType: 'prompt-injection-attempt',
    message: 'Potential prompt injection attempt detected',
    userId,
    ipAddress: ipAddress ?? undefined,
    endpoint,
    metadata: {
      detectedPatterns,
      messageSnippet: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
    },
  });
}

/**
 * Log a rate limit exceeded event
 */
export function logRateLimitExceeded({
  userId,
  ipAddress,
  endpoint,
  limitType,
}: {
  userId?: string;
  ipAddress?: string | null;
  endpoint: string;
  limitType: string;
}) {
  logSecurityEvent({
    eventType: 'rate-limit-exceeded',
    message: `Rate limit exceeded for ${limitType}`,
    userId,
    ipAddress: ipAddress ?? undefined,
    endpoint,
    metadata: {
      limitType,
    },
  });
} 