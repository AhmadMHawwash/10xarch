/**
 * SINGLE EXPERT Analysis Service
 * 
 * Simplified architecture analysis using one comprehensive expert instead of 
 * multiple conflicting experts that cause normalization chaos.
 */

import { OpenAI } from 'openai';
import type { AnalysisFile, GitHubRepoInfo } from './github-service';

// Re-export shared types
export type { AnalysisFile, GitHubRepoInfo } from './github-service';

export interface AnalysisNode {
  id: string;
  name: string;
  displayName?: string;
  title?: string;
  subtitle?: string;
  confidence: number;
  configs?: Record<string, unknown>;
}

export interface AnalysisEdge {
  id: string;
    source: string;
    target: string;
    label?: string;
    apiDefinition?: string;
    confidence: number;
  type?: string;
  data?: {
    label?: string;
    description?: string;
  };
}

export interface ExpertResult {
  status: 'completed' | 'failed';
  progress: number;
  findings: string[];
  nodes: AnalysisNode[];
  edges: AnalysisEdge[];
  message: string;
  tokensUsed?: number;
}

export interface AnalysisResult {
  repositoryInfo: GitHubRepoInfo;
  experts: any[];
  nodes: AnalysisNode[];
  edges: AnalysisEdge[];
  architecture: {
    type: 'monolith' | 'microservices' | 'serverless' | 'spa' | 'unknown';
    confidence: number;
    description: string;
  };
  summary: string;
  recommendations: string[];
  estimatedCosts: {
    tokensUsed: number;
    actualCost: number;
  };
}

// Valid component types for the system designer (for reference in prompts)

export class AnalysisService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

    /**
   * Analyze repository with single comprehensive expert
   */
  async analyzeRepository(
    files: AnalysisFile[],
    repoInfo: GitHubRepoInfo,
    onProgress?: (experts: any[], logs: string[]) => void,
    architecturalContext?: string
  ): Promise<AnalysisResult> {
    const logs: string[] = [];
    let totalTokensUsed = 0;

    logs.push(`🚀 Starting SINGLE EXPERT analysis of ${repoInfo.fullName}`);
    logs.push(`📁 Found ${files.length} relevant files to analyze`);

    // Single comprehensive analysis
    logs.push(`🔧 Running comprehensive architectural analysis...`);
    
    const result = await this.runComprehensiveAnalysis(files, repoInfo, architecturalContext);
        totalTokensUsed += result.tokensUsed ?? 0;
    
    logs.push(`✅ Analysis complete: ${result.nodes.length} components, ${result.edges.length} connections`);
    
    // Create expert for UI compatibility
    const expert = {
      id: 'comprehensive-architect',
      name: 'Senior Architect',
      description: 'Complete architectural analysis',
      role: 'Analyzes entire system architecture',
      status: result.status,
      progress: 100,
      findings: result.findings,
      nodes: result.nodes,
      edges: result.edges,
      message: result.message
    };
    
    // Report progress for UI compatibility
    onProgress?.([expert], logs);

    // Determine architecture type based on analysis
    const architectureType = this.determineArchitectureType(result.nodes, result.edges);
    const avgConfidence = result.nodes.length > 0 
      ? Math.round(result.nodes.reduce((sum, node) => sum + node.confidence, 0) / result.nodes.length)
      : 0;

    return {
      repositoryInfo: repoInfo,
      experts: [expert],
      nodes: result.nodes,
      edges: result.edges,
      architecture: {
        type: architectureType,
        confidence: avgConfidence,
        description: result.message
      },
      summary: result.message,
      recommendations: result.findings,
      estimatedCosts: {
        tokensUsed: totalTokensUsed,
        actualCost: totalTokensUsed * 0.00001 // Rough estimate
      }
    };
  }

  /**
   * Single comprehensive expert that analyzes everything
   */
  private async runComprehensiveAnalysis(
    files: AnalysisFile[], 
    repoInfo: GitHubRepoInfo, 
    architecturalContext?: string
  ): Promise<ExpertResult> {
    try {
      const fileSignatures = files
        .sort((a, b) => a.path.localeCompare(b.path)) // ENSURE DETERMINISTIC ORDER
        .map(f => `${f.path} (${f.type}, ${Math.round(f.size / 1024)}KB)`)
        .join('\n');

      const prompt = this.buildComprehensivePrompt(files, repoInfo, fileSignatures, architecturalContext);
      
      console.log(`[EXPERT_INPUT] comprehensive-architect prompt length: ${prompt.length} chars`);
      
      const promptHash = this.createPromptHash(prompt, fileSignatures);
      console.log(`[EXPERT_INPUT] comprehensive-architect prompt hash: ${promptHash}`);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-5-nano',
        messages: [{ role: 'user', content: prompt }],
        seed: this.createDeterministicSeed(prompt, fileSignatures), // Deterministic seed
        response_format: { type: 'json_object' }
      });

      const rawResult = JSON.parse(response.choices[0]?.message?.content ?? '{}') as {
        nodes?: unknown;
        edges?: unknown;
        findings?: unknown;
        message?: unknown;
      };
      const tokensUsed = response.usage?.total_tokens ?? 0;

      const nodes = Array.isArray(rawResult.nodes) ? rawResult.nodes as AnalysisNode[] : [];
      const edges = Array.isArray(rawResult.edges) ? rawResult.edges as AnalysisEdge[] : [];
      const findings = Array.isArray(rawResult.findings) ? rawResult.findings as string[] : [];
      const message = typeof rawResult.message === 'string' ? rawResult.message : 'Comprehensive analysis complete';

      console.log(`[EXPERT_ANALYSIS] comprehensive-architect identified ${nodes.length} components and ${edges.length} connections`);

      // Log components and connections found
      nodes.forEach((node, index) => {
        console.log(`[EXPERT_ANALYSIS] comprehensive-architect Component ${index + 1}: ${node.displayName ?? node.title ?? node.name} (${node.name}, confidence: ${node.confidence}%)`);
      });

      edges.forEach((edge, index) => {
        const label = edge.data?.label ?? edge.label ?? 'No label';
        console.log(`[EXPERT_ANALYSIS] comprehensive-architect Connection ${index + 1}: ${edge.source} → ${edge.target} (${label}, confidence: ${edge.confidence}%)`);
      });

      return {
        status: 'completed',
        progress: 100,
        findings,
        nodes,
        edges,
        message,
        tokensUsed
      };

    } catch (error) {
      console.error('[EXPERT_ERROR] comprehensive-architect failed:', error);
      return {
        status: 'failed',
        progress: 0,
        findings: [],
        nodes: [],
        edges: [],
        message: error instanceof Error ? error.message : 'Analysis failed',
        tokensUsed: 0
      };
    }
  }

  /**
   * Build comprehensive prompt that combines all expert knowledge
   */
  private buildComprehensivePrompt(
    files: AnalysisFile[], 
    repoInfo: GitHubRepoInfo, 
    fileSignatures: string,
    architecturalContext?: string
  ): string {
    const hasFiles = files.length > 0;
    return `You are a Senior Software Architect analyzing a ${repoInfo.language ?? 'software'} repository for system design.

🚨 CRITICAL ANTI-HALLUCINATION RULES:
${hasFiles ? `- ONLY identify components that exist in the provided code files or are explicitly evidenced in the architectural context
- DO NOT make assumptions or guess what might exist
- DO NOT invent components based on common patterns
- If you cannot find clear evidence, DO NOT include it
- Base ALL findings on actual file content and the architectural context
- Be conservative - only include what you can prove exists` : `- ONLY identify components and connections that have explicit evidence in the ARCHITECTURAL CONTEXT below (derived from dependency graphs, entry points, and static analysis)
- DO NOT make assumptions beyond this context
- If evidence is weak, return fewer components with lower confidence rather than fabricating details
- Be conservative - include only what you can support from the context`}

REPOSITORY: ${repoInfo.fullName}
PRIMARY LANGUAGE: ${repoInfo.language ?? 'Unknown'}

${architecturalContext ? `ARCHITECTURAL CONTEXT:\n${architecturalContext}\n` : ''}

${hasFiles ? `FILES TO ANALYZE (${files.length} files):\n${fileSignatures}` : ''}

🏗️ FOCUS ON SYSTEM ARCHITECTURE - NOT UI DETAILS:
INCLUDE: Servers, databases, external APIs, caches, message queues, load balancers
EXCLUDE: Individual pages, UI components, presentational elements

SYSTEM COMPONENT DEFINITIONS - Use EXACTLY these names:
- Frontend applications → "Client" (overall frontend app, not individual pages)
- Web application servers → "Server" with framework-specific displayName (e.g., "Next.js Server", "Express Server", "Fastify Server")
- API servers/endpoints → "Server" with displayName "API Server" or framework-specific (e.g., "tRPC API Server", "NestJS API Server")
- External service integrations → "Server" with displayName like "Stripe Payment Service" or "OpenAI Service"
- Database schemas/connections → "Database" with specific type (e.g., "PostgreSQL Database")
- Cache systems → "Cache" with specific type (e.g., "Redis Cache")
- Message queues → "Message Queue" with specific type
- Load balancers → "Load Balancer"
- CDNs → "CDN"

🚨 FRAMEWORK-SPECIFIC SERVER IDENTIFICATION:
🎯 **Next.js Server**: 
- Evidence: src/app/, pages/, next.config.js, Next.js routing, src/app/api/ routes
- Purpose: Web application server (SSR, API routes, static files)

🎯 **Express/Fastify Server**:
- Evidence: app.js, server.js, express imports, app.get/post, fastify imports
- Purpose: Web/API server framework

🎯 **NestJS Server**:
- Evidence: @nestjs imports, *.controller.ts, *.service.ts, main.ts with NestFactory
- Purpose: Enterprise Node.js framework server

🎯 **tRPC API Server**:  
- Evidence: src/server/api/routers/, .procedure, .query, .mutation, appRouter
- Purpose: Internal type-safe API layer

🎯 **Generic API Server**:
- Evidence: routes/, api/, endpoints/, controllers/ directories with HTTP handlers
- Purpose: REST/HTTP API endpoints

🎯 External Service Integrations (e.g., "Stripe Payment Service", "OpenAI Service"):
- Evidence: API calls to external domains, webhooks, third-party imports, environment variables
- Purpose: External third-party service integrations

🚨 DO NOT CREATE COMPONENTS FOR:
- Individual pages (HomePage, LoginPage, etc.) → These are UI/presentation layer
- Individual UI components (Button, Card, etc.) → These are presentation layer  
- Route handlers that are just endpoints → Group them as API servers instead

CONNECTION IDENTIFICATION:
- Frontend Client → API calls, HTTP requests → Server components
- Server → Database queries → Database components  
- API Server → External service calls → External APIs
- Client → Asset requests → CDN (if configured)
- Server → Cache operations → Cache components

ANALYSIS INSTRUCTIONS:
1. **Identify System Architecture Components**:
   - Look for web/API servers (Next.js, Express, Fastify, NestJS, tRPC)
   - Find databases (schema files, connection configs, ORMs)
   - Detect external service integrations (API calls, webhooks, env vars)

2. **Detect API Endpoints & External Services**:
   - **Next.js**: src/app/api/*/route.ts, src/pages/api/*.ts
   - **Express/Fastify**: routes/, api/, app.get/post, server.js
   - **NestJS**: *.controller.ts, @nestjs imports, main.ts
   - **tRPC**: src/server/api/routers/, .procedure, .query, .mutation
   - **Generic**: any routes/, api/, endpoints/, controllers/, services/, handlers/
   - **External Services**: stripe, openai, external API calls, webhooks, env vars

3. **Map System-Level Connections**:
   - Frontend → API servers (fetch calls, tRPC calls)
   - API servers → Database (db queries, schema refs)  
   - API servers → External services (stripe, openai, etc.)
   - Webhook endpoints ← External services

4. **IGNORE Presentation Layer**:
   - Skip individual pages, forms, UI components
   - Focus on architectural boundaries, not code organization
   - Group related API endpoints together (don't create separate components per endpoint)

RESPONSE FORMAT - Return valid JSON:
{
  "findings": ["List specific evidence found in files"],
  "nodes": [
    {
      "id": "unique-component-id",
      "name": "Exact component type from list above",
      "configs": {
        "title": "Descriptive name based on code evidence",
        "subtitle": "Purpose based on actual file analysis"
      },
      "displayName": "Clear component name from evidence",
      "subtitle": "Purpose from evidence",
      "title": "Component name from evidence",
      "confidence": 90
    }
  ],
  "edges": [
    {
      "id": "connection-id",
      "source": "source-component-id",
      "target": "target-component-id",
      "label": "Connection type based on code",
      "apiDefinition": "Actual API/connection details found",
      "confidence": 85,
      "data": {
        "label": "Connection description from evidence"
      }
    }
  ],
  "message": "Summary of architectural analysis"
}

${hasFiles
  ? `FILE CONTENTS:\n${files
      .sort((a, b) => a.path.localeCompare(b.path)) // ENSURE DETERMINISTIC FILE ORDER IN PROMPT
      .map(f => `=== ${f.path} ===\n${f.content.slice(0, 2000)}${f.content.length > 2000 ? '\n... (truncated)' : ''}`)
      .join('\n\n')}`
  : `// No file contents provided. Use the ARCHITECTURAL CONTEXT above to conservatively infer components and connections.`
}`;
  }

  /**
   * Determine architecture type based on identified components
   */
  private determineArchitectureType(
    nodes: AnalysisNode[], 
    _edges: AnalysisEdge[]
  ): 'monolith' | 'microservices' | 'serverless' | 'spa' | 'unknown' {
    if (nodes.length === 0) return 'unknown';
    
    const componentTypes = nodes.map(n => n.name.toLowerCase());
    const hasServer = componentTypes.some(t => t.includes('server'));
    const hasDatabase = componentTypes.some(t => t.includes('database'));
    const hasFrontend = componentTypes.some(t => t.includes('client') || t.includes('frontend'));
    const serverCount = componentTypes.filter(t => t.includes('server')).length;
    
    // Single Page Application
    if (hasFrontend && !hasServer && !hasDatabase) {
      return 'spa';
    }
    
    // Microservices (multiple servers/services)
    if (serverCount > 2 || componentTypes.some(t => t.includes('microservice'))) {
      return 'microservices';
    }
    
    // Serverless indicators
    if (componentTypes.some(t => t.includes('lambda') || t.includes('function') || t.includes('serverless'))) {
      return 'serverless';
    }
    
    // Monolith (single server with database)
    if (hasServer && hasDatabase && serverCount <= 2) {
      return 'monolith';
    }
    
    return 'unknown';
  }

  /**
   * Create deterministic hash for prompt consistency
   */
  private createPromptHash(prompt: string, fileSignatures: string): string {
    let hash = 0;
    const input = prompt + fileSignatures;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Create deterministic seed for LLM consistency
   */
  private createDeterministicSeed(prompt: string, fileSignatures: string): number {
    const input = prompt + fileSignatures;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % 1000000; // Ensure it's within valid range
  }
} 