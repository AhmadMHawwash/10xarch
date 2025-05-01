/**
 * Content Security Policy configuration
 * 
 * This file provides a central location for CSP configuration
 * which can be imported and used in various parts of the application.
 */

// Base CSP directives that can be reused
export const cspDirectives = {
  // Default to only allowing content from same origin
  'default-src': ["'self'"],
  
  // Script sources - same origin, inline scripts, and trusted providers
  'script-src': [
    "'self'", 
    "'unsafe-inline'",
    "'unsafe-eval'", 
    "https://clerk.10xarch.com", 
    "https://*.clerk.accounts.dev",
    "https://*.clerk.com",
    "https://clerk.browser.com",
    "https://*.vercel-insights.com", 
    "https://*.stripe.com", 
    "https://va.vercel-scripts.com",
    "https://*.cloudflare.com",
  ],
  
  // Worker sources - allow blob URLs for web workers
  'worker-src': ["'self'", "blob:"],
  
  // Style sources - same origin and inline styles
  'style-src': ["'self'", "'unsafe-inline'"],
  
  // Image sources - same origin, data URLs, and trusted providers
  'img-src': [
    "'self'", 
    "data:", 
    "https://*.clerk.accounts.dev", 
    "https://*.clerk.com",
    "https://*.stripe.com", 
    "https://*.10xarch.com"
  ],
  
  // Font sources - same origin and data URLs
  'font-src': ["'self'", "data:"],
  
  // Connection sources - same origin and trusted APIs
  'connect-src': [
    "'self'", 
    "https://*.clerk.accounts.dev", 
    "https://clerk.10xarch.com", 
    "https://*.clerk.com",
    "https://clerk.browser.com",
    "https://*.stripe.com", 
    "https://*.10xarch.com", 
    "https://*.vercel-insights.com", 
    "wss://ws.pusherapp.com",
    "https://clerk-telemetry.com"
  ],
  
  // Frame sources - same origin and trusted providers
  'frame-src': [
    "'self'", 
    "https://*.stripe.com", 
    "https://clerk.10xarch.com",
    "https://*.clerk.accounts.dev",
    "https://*.clerk.com",
    "https://*.cloudflare.com"
  ],
  
  // Block all plugins
  'object-src': ["'none'"],
  
  // Only allow form submissions to same origin
  'form-action': ["'self'"],
  
  // Only allow loading from same origin
  'base-uri': ["'self'"],
  
  // Block embedding the site in iframes from other origins
  'frame-ancestors': ["'self'"]
};

// Build CSP policy string from directives
export function buildCspPolicy(directives = cspDirectives, reportOnly = false): string {
  const policy = Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`);
    
  // Only add upgrade-insecure-requests in enforce mode, not in report-only
  if (!reportOnly) {
    policy.push("upgrade-insecure-requests");
  }

  // Add reporting endpoint if in report-only mode
  if (reportOnly && process.env.CSP_REPORT_URI) {
    policy.push(`report-uri ${process.env.CSP_REPORT_URI}`);
  }

  return policy.join('; ');
}

// Get CSP header based on environment
export function getCspHeader(reportOnly = false): Record<string, string> {
  const headerName = reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
  return {
    [headerName]: buildCspPolicy(cspDirectives, reportOnly)
  };
}

// Other security headers
export const securityHeaders = {
  // X-Content-Type-Options - prevents MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // X-XSS-Protection - legacy header for older browsers
  'X-XSS-Protection': '1; mode=block',
  
  // X-Frame-Options - prevents clickjacking
  'X-Frame-Options': 'SAMEORIGIN',
  
  // Referrer-Policy - controls referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions-Policy - controls browser features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
};

// Get all security headers including CSP
export function getAllSecurityHeaders(cspReportOnly = false): Record<string, string> {
  return {
    ...securityHeaders,
    ...getCspHeader(cspReportOnly)
  };
} 