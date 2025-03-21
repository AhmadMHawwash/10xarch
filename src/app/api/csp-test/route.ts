import { type NextRequest, NextResponse } from 'next/server';
import { getAllSecurityHeaders } from '@/lib/csp';

// This route is only for testing CSP headers
export async function GET(_request: NextRequest) {
  // Get all security headers
  const headers = getAllSecurityHeaders();
  
  // Add headers to response
  const response = NextResponse.json({
    message: 'CSP test endpoint',
    csp: headers['Content-Security-Policy'],
    allHeaders: headers
  });
  
  // Apply all security headers to the response
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// This route can be used to test CSP violation reporting
export async function POST(request: NextRequest) {
  try {
    // Parse CSP violation report with proper type assertion
    const report = await request.json() as {
      'csp-report'?: {
        'document-uri'?: string;
        'blocked-uri'?: string;
        'violated-directive'?: string;
        'effective-directive'?: string;
        'original-policy'?: string;
        'disposition'?: string;
        'status-code'?: number;
      }
    };
    
    // In production, you would log this to your security monitoring system
    console.warn('⚠️ CSP VIOLATION:', report);
    
    return NextResponse.json({ message: 'CSP violation report received' });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid CSP report' }, { status: 400 });
  }
} 