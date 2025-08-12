import { openai } from '@/lib/openai';
import { calculateTextTokens } from '@/lib/tokens';
import type { AnalysisFile, GitHubRepoInfo } from './github-service';
import type { SystemComponentType } from '@/lib/levels/type';
import type { CustomEdgeData } from '@/types/system';

// Valid SystemComponent names from the schema
type ValidSystemComponentName = 
  | "Client"
  | "Server"
  | "Load Balancer"
  | "Cache"
  | "CDN"
  | "Database"
  | "Message Queue"
  | "Custom Component";

// Mapping from analysis node names to valid SystemComponent types
const COMPONENT_TYPE_MAPPING: Record<string, ValidSystemComponentName> = {
  // Direct matches
  "client": "Client",
  "server": "Server", 
  "database": "Database",
  "cache": "Cache",
  "cdn": "CDN",
  "load_balancer": "Load Balancer",
  "loadbalancer": "Load Balancer",
  "message_queue": "Message Queue",
  "messagequeue": "Message Queue",
  "queue": "Message Queue",
  
  // Common variations
  "api": "Server",
  "backend": "Server",
  "frontend": "Client",
  "web_server": "Server",
  "webserver": "Server",
  "app_server": "Server",
  "application_server": "Server",
  "db": "Database",
  "redis": "Cache",
  "memcached": "Cache",
  "nginx": "Load Balancer",
  "haproxy": "Load Balancer",
  "cloudfront": "CDN",
  "rabbitmq": "Message Queue",
  "kafka": "Message Queue",
  "sqs": "Message Queue",
  
  // Generic fallbacks
  "service": "Server",
  "microservice": "Server",
  "component": "Custom Component",
};

/**
 * Maps an analysis node name to a valid SystemComponent type
 */
function mapToComponentType(nodeName: string): ValidSystemComponentName {
  const lowerName = nodeName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  // Try exact match first
  if (COMPONENT_TYPE_MAPPING[lowerName]) {
    return COMPONENT_TYPE_MAPPING[lowerName];
  }
  
  // Try partial matches with deterministic ordering (longer/more specific keys first)
  const sortedMappings = Object.entries(COMPONENT_TYPE_MAPPING)
    .sort(([keyA], [keyB]) => {
      // First sort by length (longer = more specific)
      if (keyA.length !== keyB.length) {
        return keyB.length - keyA.length;
      }
      // Then sort alphabetically for complete determinism
      return keyA.localeCompare(keyB);
    });
  
  for (const [key, value] of sortedMappings) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      console.log(`[COMPONENT_MAPPING] "${nodeName}" → "${value}" (matched "${key}")`);
      return value;
    }
  }
  
  // Default fallback
  return "Custom Component";
}

/**
 * Creates a deterministic node ID from component name and type
 */
function generateDeterministicNodeId(name: string, componentType: ValidSystemComponentName): string {
  // Normalize the name by removing special characters and converting to lowercase
  const normalizedName = name.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Create a consistent mapping based on component type
  const typePrefix = componentType.toLowerCase().replace(/\s+/g, '-');
  
  // If name is already descriptive, use it. Otherwise, use the component type
  if (normalizedName && normalizedName !== typePrefix) {
    return `${typePrefix}-${normalizedName}`;
  }
  
  return typePrefix;
}

/**
 * Creates a semantic key for grouping similar nodes from different experts
 */
function createSemanticNodeKey(node: AnalysisNode): string {
  const componentType = mapToComponentType(node.name);
  const semanticName = node.displayName ?? node.title ?? node.name;
  return generateDeterministicNodeId(semanticName, componentType);
}

export interface AnalysisExpert {
  id: string;
  name: string;
  description: string;
  role: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  progress: number;
  findings?: string[];
  nodes?: AnalysisNode[];
  edges?: AnalysisEdge[];
  message?: string;
}

// Node format compatible with SystemComponentNodeDataProps
export interface AnalysisNode {
  id: string;
  name: SystemComponentType;
  configs: Record<string, unknown>;
  displayName?: string;
  subtitle?: string;
  title?: string;
  confidence: number; // 0-100
  evidence: string[];
  position?: { x: number; y: number };
}

// Edge format compatible with CustomEdgeData
export interface AnalysisEdge {
  id: string;
  source: string; // node id
  target: string; // node id
  data: CustomEdgeData;
  confidence: number; // 0-100
  evidence: string[];
}

export interface AnalysisResult {
  repositoryInfo: GitHubRepoInfo;
  experts: AnalysisExpert[];
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

interface LLMAnalysisResult {
  findings?: string[];
  nodes?: Array<{
    id: string;
    name: SystemComponentType;
    configs: Record<string, unknown>;
    displayName?: string;
    subtitle?: string;
    title?: string;
    confidence: number;
  }>;
  edges?: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    apiDefinition?: string;
    requestFlow?: string;
    confidence: number;
  }>;
  message?: string;
}

interface ExpertAnalysisResult {
  status: 'completed' | 'failed';
  progress: number;
  findings?: string[];
  nodes?: AnalysisNode[];
  edges?: AnalysisEdge[];
  message?: string;
  tokensUsed?: number;
}

// Global anti-hallucination instructions
const CRITICAL_INSTRUCTIONS_BASE = `CRITICAL INSTRUCTIONS:
- ONLY identify components that you can clearly see evidence for in the provided files
- DO NOT make assumptions or guess what might exist
- DO NOT invent components that are not explicitly configured or mentioned
- If you cannot find clear evidence of a component, DO NOT include it
- Be conservative - only include what you can prove exists
- If unsure about a component's existence, exclude it rather than guess
- Your confidence scores should reflect actual evidence, not assumptions`;

const EXPERT_SPECIFIC_INSTRUCTIONS = {
  repositoryScout: `CRITICAL NAMING RULES - Use these EXACT names:
- React/Next.js frontend → "Frontend Client" 
- Next.js server-side (SSR/pages) → "Next.js Server" (for web request handling and page serving)
- tRPC router/procedures → "tRPC API Server" (for type-safe API procedures)
- Express/generic API server → "API Server" (for general REST/HTTP APIs)
- Database files → "PostgreSQL Database" (or specific type found in code)
- Webhook files → service name + "Webhook Handler" (e.g., "Stripe Webhook Handler")

SERVER TYPE CLARIFICATION:
- "Next.js Server": Web framework handling pages, SSR, static files (src/app/, pages/, next.config.js)
- "tRPC API Server": Type-safe API procedures (src/server/api/routers/, .procedure, .query, .mutation)
- "API Server": Generic REST/HTTP APIs (express routes, generic endpoints, non-tRPC APIs)

EVIDENCE: Only identify components with clear file evidence. Don't assume components exist.`,

  infrastructure: `CRITICAL NAMING RULES - Use these EXACT names:
- Load balancer configs → "Load Balancer"
- Server files → "Server" (with framework like "Next.js Server")
- Container configs → "Container Service"
- Cache configs → specific type like "Redis Cache"

EVIDENCE: Must see actual configuration files. No assumptions without clear setup.`,

  api: `CRITICAL NAMING RULES - Use these EXACT names:
- tRPC routers/procedures → "tRPC API Server" (must see actual tRPC router files with .procedure, .query, .mutation)
- Express/generic routes → "API Server" (for REST/HTTP endpoints, express.Router, app.get/post/etc)
- Next.js API routes → "Next.js Server" (for /api/ routes in Next.js apps)
- Webhook endpoints → service + "Webhook Handler" (e.g., "Stripe Webhook Handler")

DISTINGUISH CAREFULLY:
- tRPC = type-safe procedures with .query/.mutation → "tRPC API Server"
- Express/generic = REST endpoints with app.get/post → "API Server" 
- Next.js = /api/ routes in Next.js → "Next.js Server"

EVIDENCE: Must see route definitions or server setup. No invented endpoints.`,

  data: `CRITICAL NAMING RULES - Use these EXACT names:
- Database schemas → specific type like "PostgreSQL Database", "MongoDB Database"
- Cache configs → specific type like "Redis Cache", "Memcached Cache"
- Data models → tie to specific database type

EVIDENCE: Must see connection strings, drivers, or clear database configuration.`,

  frontend: `CRITICAL NAMING RULES - Use these EXACT names:
- React components → "Frontend Client"
- Vue applications → "Frontend Client"
- UI applications → "Frontend Client"
- Web apps → "Frontend Client"

EVIDENCE: Must see actual component implementations, not just type definitions.`,

  devops: `CRITICAL NAMING RULES - Use these EXACT names:
- Deployment configs → "Deployment Service"
- Monitoring → "Monitoring Service"  
- CI/CD → "Build Pipeline"
- Reverse proxy → "Load Balancer"

EVIDENCE: Must see actual configuration files. Don't assume operational components exist.`
};

const REMINDER_MESSAGES = {
  repositoryScout: 'REMEMBER: If you cannot find clear evidence, return empty arrays rather than guessing.',
  infrastructure: 'REMEMBER: Better to return empty arrays than to make assumptions about infrastructure that might not exist.',
  api: 'REMEMBER: If no clear API or server code is found, return empty arrays. Don\'t assume servers exist.',
  data: 'REMEMBER: If no clear database configuration is found, return empty arrays. Models alone don\'t prove databases exist.',
  frontend: 'REMEMBER: Configuration files alone don\'t prove a frontend exists - look for actual implementation.',
  devops: 'REMEMBER: If no clear operational components are configured, return empty arrays. Don\'t assume standard DevOps components exist.'
};

export class AnalysisService {
  private experts: AnalysisExpert[] = [
    {
      id: 'repository-scout',
      name: 'Repository Scout',
      description: 'Analyzes repository structure and technologies',
      role: 'Identifies the main technology stack and project structure',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'infrastructure-expert',
      name: 'Infrastructure Expert',
      description: 'Identifies infrastructure patterns and deployment configs',
      role: 'Finds Docker, cloud configs, load balancers, and scaling patterns',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'api-analyst',
      name: 'API Analyst',
      description: 'Maps API endpoints and communication patterns',
      role: 'Discovers REST APIs, GraphQL, WebSocket connections',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'data-expert',
      name: 'Data Expert',
      description: 'Identifies databases and data storage patterns',
      role: 'Finds databases, caching layers, and data models',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'frontend-analyst',
      name: 'Frontend Analyst',
      description: 'Analyzes client-side applications and UI frameworks',
      role: 'Identifies React, Vue, Angular apps and their API calls',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'devops-specialist',
      name: 'DevOps Specialist',
      description: 'Finds CI/CD, monitoring, and operational patterns',
      role: 'Discovers deployment pipelines and monitoring setups',
      status: 'pending',
      progress: 0,
    },
  ];

  async analyzeRepository(
    files: AnalysisFile[],
    repoInfo: GitHubRepoInfo,
    onProgress?: (experts: AnalysisExpert[], logs: string[]) => void,
    architecturalContext?: string
  ): Promise<AnalysisResult> {
    const logs: string[] = [];
    const expertResults: AnalysisExpert[] = [...this.experts];
    let totalTokensUsed = 0;

    logs.push(`🚀 Starting analysis of ${repoInfo.fullName}`);
    logs.push(`📁 Found ${files.length} relevant files to analyze`);

    // Phase 1: Repository Scout (Quick overview)
    logs.push(`🔍 Repository Scout analyzing project structure...`);
    const scoutResult = await this.runRepositoryScout(files, repoInfo, architecturalContext);
    if (expertResults[0]) {
      expertResults[0].status = scoutResult.status;
      expertResults[0].progress = scoutResult.progress;
      expertResults[0].findings = scoutResult.findings;
      expertResults[0].nodes = scoutResult.nodes;
      expertResults[0].edges = scoutResult.edges;
      expertResults[0].message = scoutResult.message;
    }
    totalTokensUsed += scoutResult.tokensUsed ?? 0;
    onProgress?.(expertResults, logs);

    // Phase 2: Run specialized experts in parallel for core analysis
    logs.push(`🔧 Running specialized analysis with ${this.experts.length - 1} experts...`);
    
    const coreExperts = [
      () => this.runInfrastructureExpert(files, repoInfo),
      () => this.runApiAnalyst(files, repoInfo),
      () => this.runDataExpert(files, repoInfo),
      () => this.runFrontendAnalyst(files, repoInfo),
    ];

    for (let i = 0; i < coreExperts.length; i++) {
      const expertIndex = i + 1;
      const expert = this.experts[expertIndex];
      const currentExpert = expertResults[expertIndex];
      
      if (!expert || !currentExpert) continue;
      
      logs.push(`⚡ ${expert.name} starting analysis...`);
      
      currentExpert.status = 'analyzing';
      onProgress?.(expertResults, logs);

      try {
        const analysisFunction = coreExperts[i];
        if (!analysisFunction) continue;
        
        const result = await analysisFunction();
        currentExpert.status = result.status;
        currentExpert.progress = result.progress;
        currentExpert.findings = result.findings;
        currentExpert.nodes = result.nodes;
        currentExpert.edges = result.edges;
        currentExpert.message = result.message;
        totalTokensUsed += result.tokensUsed ?? 0;
        logs.push(`✅ ${expert.name} completed analysis`);
      } catch (error) {
        currentExpert.status = 'failed';
        currentExpert.message = error instanceof Error ? error.message : 'Analysis failed';
        logs.push(`❌ ${expert.name} failed: ${currentExpert.message}`);
      }
      
      onProgress?.(expertResults, logs);
    }

    // Phase 3: DevOps Specialist (Final analysis)
    logs.push(`🚀 DevOps Specialist performing final analysis...`);
    const devopsResult = await this.runDevOpsSpecialist(files, repoInfo);
    const devopsExpert = expertResults[5];
    if (devopsExpert) {
      devopsExpert.status = devopsResult.status;
      devopsExpert.progress = devopsResult.progress;
      devopsExpert.findings = devopsResult.findings;
      devopsExpert.nodes = devopsResult.nodes;
      devopsExpert.edges = devopsResult.edges;
      devopsExpert.message = devopsResult.message;
    }
    totalTokensUsed += devopsResult.tokensUsed ?? 0;

    // Aggregate and normalize results
    const rawNodes = this.aggregateNodes(expertResults);
    const rawEdges = this.aggregateEdges(expertResults);
    
    // Apply normalization to ensure consistency
    const nodes = this.normalizeComponents(rawNodes);
    const edges = this.normalizeConnections(rawEdges, nodes);
    const architecture = this.determineArchitecture(expertResults, files);
    
    // 🔍 LOG: Final aggregated results
    console.log(`[FINAL_AGGREGATION] Total components: ${nodes.length}, Total connections: ${edges.length}`);
    console.log(`[FINAL_AGGREGATION] Components:`);
    nodes.forEach((node, index) => {
      console.log(`[FINAL_AGGREGATION] ${index + 1}. ${node.displayName} (${node.name})`);
    });
    console.log(`[FINAL_AGGREGATION] Connections:`);
    edges.forEach((edge, index) => {
      console.log(`[FINAL_AGGREGATION] ${index + 1}. ${edge.source} → ${edge.target} (${edge.data?.label ?? 'No label'})`);
    });
    
    logs.push(`🎯 Analysis complete! Identified ${nodes.length} nodes and ${edges.length} connections`);
    onProgress?.(expertResults, logs);

    return {
      repositoryInfo: repoInfo,
      experts: expertResults,
      nodes,
      edges,
      architecture,
      summary: this.generateSummary(nodes, edges, architecture),
      recommendations: this.generateRecommendations(expertResults),
      estimatedCosts: {
        tokensUsed: totalTokensUsed,
        actualCost: totalTokensUsed * 0.0001, // Rough estimate
      },
    };
  }

  private async runRepositoryScout(files: AnalysisFile[], repoInfo: GitHubRepoInfo, architecturalContext?: string) {
    const configFiles = files.filter(f => f.type === 'config');
    const entryFiles = files.filter(f => f.type === 'entry');
    
    const prompt = `Analyze this ${repoInfo.language ?? 'unknown'} repository structure and identify system components:

Repository: ${repoInfo.fullName}
Main Language: ${repoInfo.language ?? 'Unknown'}

Configuration Files:
${configFiles.map(f => `- ${f.path} (${f.size} bytes)`).join('\n')}

Entry Point Files:
${entryFiles.map(f => `- ${f.path}`).join('\n')}

Key Config Contents:
${configFiles.slice(0, 3).map(f => `=== ${f.path} ===\n${f.content.slice(0, 1000)}`).join('\n\n')}

${architecturalContext ? `\n=== ARCHITECTURAL CONTEXT ===\n${architecturalContext}\n` : ''}

${CRITICAL_INSTRUCTIONS_BASE}
${EXPERT_SPECIFIC_INSTRUCTIONS.repositoryScout}

CRITICAL: You must respond with VALID JSON in this EXACT format:

IMPORTANT NAMING INSTRUCTIONS:
- For "name": Use the EXACT component type from this list: "Load Balancer", "Cache", "Message Queue", "CDN", "Database", "Server", "Client", "Custom Component"
- For "displayName": Provide a semantic, descriptive name (e.g., "Redis Cache", "Nginx Load Balancer", "PostgreSQL Database")
- For "title": Use the same as displayName for consistency
- IDs will be generated automatically from your semantic names - don't worry about ID uniqueness

{
  "findings": ["finding1", "finding2"],
  "nodes": [
    {
      "id": "temp-id",
      "name": "EXACT_COMPONENT_TYPE_FROM_LIST",
      "configs": {
        "title": "Semantic Component Name",
        "subtitle": "Brief description"
      },
      "displayName": "Semantic Component Name",
      "subtitle": "Brief description",
      "title": "Semantic Component Name",
      "confidence": 85
    }
  ],
  "edges": [
    {
      "id": "unique-edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "label": "Connection description",
      "confidence": 80
    }
  ],
  "message": "Brief summary"
}

VALID_COMPONENT_TYPE must be one of: "Client", "Server", "Database", "Cache", "CDN", "Message Queue", "Load Balancer", "Custom Component"

Connection Rules:
- Client → Server, Load Balancer, CDN, Message Queue
- Server → Server, Cache, Database, Message Queue, Load Balancer  
- Database → (no outgoing connections)
- Load Balancer → Server
- Cache → Database
- CDN → Load Balancer, Server
- Message Queue → Server

Only include connections that follow these rules. Set confidence 0-100 based on evidence strength.
${REMINDER_MESSAGES.repositoryScout}`;

    return this.callLLMExpert('repository-scout', prompt, files);
  }

  private async runInfrastructureExpert(files: AnalysisFile[], _repoInfo: GitHubRepoInfo) {
    const infraFiles = files.filter(f => 
      f.path.includes('docker') || 
      f.path.includes('kubernetes') || 
      f.path.includes('terraform') ||
      f.path.includes('config') ||
      f.path.includes('.yml') ||
      f.path.includes('.yaml')
    );

    const prompt = `Analyze infrastructure and deployment configuration:

Files to analyze:
${infraFiles.map(f => `=== ${f.path} ===\n${f.content.slice(0, 1500)}`).join('\n\n')}

${CRITICAL_INSTRUCTIONS_BASE}
${EXPERT_SPECIFIC_INSTRUCTIONS.infrastructure}

Identify infrastructure components that would appear in a system architecture diagram.

IMPORTANT NAMING INSTRUCTIONS:
- For "name": Use the EXACT component type from this list: "Load Balancer", "Cache", "Message Queue", "CDN", "Database", "Server", "Client", "Custom Component"
- For "displayName": Provide a semantic, descriptive name (e.g., "Redis Cache", "Nginx Load Balancer", "PostgreSQL Database")
- For "title": Use the same as displayName for consistency
- For edges: Use semantic node names in "source" and "target" that match your displayName values
- IDs will be generated automatically from your semantic names - don't worry about ID uniqueness

Respond with VALID JSON in this EXACT format:
{
  "findings": ["finding1", "finding2"],
  "nodes": [
    {
      "id": "temp-id",
      "name": "Load Balancer",
      "configs": {
        "title": "Nginx Load Balancer",
        "subtitle": "Distributes incoming requests"
      },
      "displayName": "Nginx Load Balancer",
      "subtitle": "Distributes incoming requests",
      "title": "Nginx Load Balancer",
      "confidence": 90
    }
  ],
  "edges": [
    {
      "id": "temp-edge-id",
      "source": "Nginx Load Balancer",
      "target": "API Server",
      "label": "HTTP requests",
      "confidence": 85
    }
  ],
  "message": "Infrastructure analysis complete"
}

Valid component types: "Load Balancer", "Cache", "Message Queue", "CDN", "Database", "Server", "Custom Component"
Only include components you can confidently identify with clear evidence from the configuration files.
${REMINDER_MESSAGES.infrastructure}`;

    return this.callLLMExpert('infrastructure-expert', prompt, infraFiles);
  }

  private async runApiAnalyst(files: AnalysisFile[], _repoInfo: GitHubRepoInfo) {
    const apiFiles = files.filter(f => 
      f.type === 'route' || 
      f.path.includes('api') ||
      f.path.includes('controller') ||
      f.path.includes('endpoint')
    );

    const prompt = `Analyze API structure and server endpoints:

API Files:
${apiFiles.map(f => `=== ${f.path} ===\n${f.content.slice(0, 1000)}`).join('\n\n')}

${CRITICAL_INSTRUCTIONS_BASE}
${EXPERT_SPECIFIC_INSTRUCTIONS.api}

Identify server components and API connections.

IMPORTANT NAMING INSTRUCTIONS:
- For "name": Use the EXACT component type from this list: "Load Balancer", "Cache", "Message Queue", "CDN", "Database", "Server", "Client", "Custom Component"
- For "displayName": Provide a semantic, descriptive name (e.g., "REST API Server", "GraphQL Server", "Authentication Service")
- For "title": Use the same as displayName for consistency
- For edges: Use semantic node names in "source" and "target" that match your displayName values
- IDs will be generated automatically from your semantic names - don't worry about ID uniqueness

Respond with VALID JSON in this EXACT format:
{
  "findings": ["REST API endpoints found", "GraphQL schema detected"],
  "nodes": [
    {
      "id": "temp-id",
      "name": "Server",
      "configs": {
        "title": "REST API Server",
        "subtitle": "Handles HTTP requests"
      },
      "displayName": "REST API Server",
      "subtitle": "Handles HTTP requests",
      "title": "REST API Server",
      "confidence": 95
    }
  ],
  "edges": [
    {
      "id": "temp-edge-id",
      "source": "REST API Server",
      "target": "PostgreSQL Database",
      "label": "Database queries",
      "apiDefinition": "GET /api/users, POST /api/users",
      "confidence": 90
    }
  ],
  "message": "API analysis complete"
}

Valid server types: "Server", "Custom Component"
Focus on actual server components that handle requests.
${REMINDER_MESSAGES.api}`;

    return this.callLLMExpert('api-analyst', prompt, apiFiles);
  }

  private async runDataExpert(files: AnalysisFile[], _repoInfo: GitHubRepoInfo) {
    const dataFiles = files.filter(f => 
      f.type === 'model' ||
      f.path.includes('database') ||
      f.path.includes('schema') ||
      f.path.includes('migration') ||
      f.path.includes('model')
    );

    const prompt = `Analyze data storage and database components:

Data Files:
${dataFiles.map(f => `=== ${f.path} ===\n${f.content.slice(0, 1000)}`).join('\n\n')}

${CRITICAL_INSTRUCTIONS_BASE}
${EXPERT_SPECIFIC_INSTRUCTIONS.data}

Identify database and storage components.

Respond with VALID JSON in this EXACT format:
{
  "findings": ["PostgreSQL database detected", "Redis cache configured"],
  "nodes": [
    {
      "id": "primary-db",
      "name": "Database",
      "configs": {
        "title": "PostgreSQL Database",
        "subtitle": "Primary data store",
        "dbType": "relational"
      },
      "displayName": "PostgreSQL Database",
      "subtitle": "Primary data store",
      "title": "PostgreSQL Database",
      "confidence": 95
    }
  ],
  "edges": [],
  "message": "Database analysis complete"
}

Valid database types: "Database", "Cache", "Custom Component"
Database nodes typically have no outgoing connections.
For Cache configs, use cacheType: "redis" | "memcached" | "inmemory"
For Database configs, use dbType: "relational" | "document" | "keyvalue" | "graph" | "search"
${REMINDER_MESSAGES.data}`;

    return this.callLLMExpert('data-expert', prompt, dataFiles);
  }

  private async runFrontendAnalyst(files: AnalysisFile[], _repoInfo: GitHubRepoInfo) {
    const frontendFiles = files.filter(f => 
      f.path.includes('src') ||
      f.path.includes('client') ||
      f.path.includes('frontend') ||
      f.path.includes('public') ||
      f.path.endsWith('.jsx') ||
      f.path.endsWith('.tsx') ||
      f.path.endsWith('.vue')
    );

    const prompt = `Analyze frontend/client application:

Frontend Files:
${frontendFiles.slice(0, 5).map(f => `=== ${f.path} ===\n${f.content.slice(0, 800)}`).join('\n\n')}

${CRITICAL_INSTRUCTIONS_BASE}
${EXPERT_SPECIFIC_INSTRUCTIONS.frontend}

If this is a frontend application, identify client components and their API connections.

🚨 CRITICAL: Only identify components with clear evidence in the code files. Do not assume or invent components.

Respond with VALID JSON in this EXACT format:
{
  "findings": ["List only what you actually found in code"],
  "nodes": [
    {
      "id": "web-client",
      "name": "Client",
      "configs": {
        "title": "Frontend component name from code",
        "subtitle": "Actual purpose from code"
      },
      "displayName": "Name based on code evidence",
      "subtitle": "Purpose based on code evidence",
      "title": "Name based on code evidence",
      "confidence": 90
    }
  ],
  "edges": [
    {
      "id": "client-to-api",
      "source": "web-client",
      "target": "api-server-1",
      "label": "HTTP requests",
      "apiDefinition": "Fetches user data via REST API",
      "confidence": 85
    }
  ],
  "message": "Frontend analysis complete"
}

Valid client types: "Client", "Custom Component"
Client nodes can connect to: Server, Load Balancer, CDN, Message Queue
If no frontend detected or no clear evidence of a client application, return empty nodes array.
${REMINDER_MESSAGES.frontend}`;

    return this.callLLMExpert('frontend-analyst', prompt, frontendFiles);
  }

  private async runDevOpsSpecialist(files: AnalysisFile[], _repoInfo: GitHubRepoInfo) {
    const devopsFiles = files.filter(f => 
      f.path.includes('ci') ||
      f.path.includes('cd') ||
      f.path.includes('deploy') ||
      f.path.includes('monitor') ||
      f.path.includes('.github') ||
      f.path.includes('docker')
    );

    const prompt = `Final DevOps analysis for operational components:

DevOps Files:
${devopsFiles.map(f => `=== ${f.path} ===\n${f.content.slice(0, 1000)}`).join('\n\n')}

${CRITICAL_INSTRUCTIONS_BASE}
${EXPERT_SPECIFIC_INSTRUCTIONS.devops}

Identify operational system components that would be part of the running architecture.

🚨 CRITICAL: Only analyze what EXISTS in the provided code. DO NOT make assumptions or invent components based on common patterns. If you cannot find evidence of a component in the actual code files, DO NOT include it.

Respond with VALID JSON in this EXACT format:
{
  "findings": ["List only what you actually found in the code files"],
  "nodes": [
    {
      "id": "component-id",
      "name": "Component Type from allowed list",
      "configs": {
        "title": "Exact name found in code",
        "subtitle": "Actual purpose from code"
      },
      "displayName": "Name based on actual code evidence",
      "subtitle": "Purpose based on actual code evidence", 
      "title": "Name based on actual code evidence",
      "confidence": 80
    }
  ],
  "edges": [
    {
      "id": "proxy-to-app",
      "source": "reverse-proxy",
      "target": "app-server",
      "label": "Proxied requests",
      "confidence": 75
    }
  ],
  "message": "DevOps analysis complete"
}

Valid operational types: "Load Balancer", "CDN", "Custom Component"
Focus on components that would be visible in a system architecture diagram.
${REMINDER_MESSAGES.devops}`;

    return this.callLLMExpert('devops-specialist', prompt, devopsFiles);
  }

  private async callLLMExpert(expertId: string, prompt: string, files: AnalysisFile[]): Promise<ExpertAnalysisResult> {
    const inputTokens = calculateTextTokens(prompt);
    
    // 🔍 LOG: Expert input for debugging non-determinism
    console.log(`[EXPERT_INPUT] ${expertId} analyzing ${files.length} files`);
    console.log(`[EXPERT_INPUT] ${expertId} prompt length: ${prompt.length} chars`);
    
    // Create deterministic prompt hash for consistency tracking
    const promptHash = this.createPromptHash(prompt, files);
    console.log(`[EXPERT_INPUT] ${expertId} prompt hash: ${promptHash}`);
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-5-nano',
        messages: [
          {
            role: 'system',
            content: 'You are an expert system architect. Analyze code and identify system components for architecture diagrams. You MUST respond with valid JSON in the exact format specified. Do not include any text outside the JSON response. BE CONSISTENT - always use the same component names for the same architectural patterns.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.0, // Absolutely deterministic
        max_tokens: 2000,
        seed: this.createDeterministicSeed(promptHash), // Add deterministic seed
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from LLM');

      // Clean the response to ensure it's valid JSON
      const cleanContent = content.trim();
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}') + 1;
      const jsonContent = cleanContent.slice(jsonStart, jsonEnd);

      const result = JSON.parse(jsonContent) as LLMAnalysisResult;
      
      const nodes: AnalysisNode[] = (result.nodes ?? []).map(node => ({
        id: node.id,
        name: node.name,
        configs: node.configs,
        displayName: node.displayName,
        subtitle: node.subtitle,
        title: node.title,
        confidence: node.confidence,
        evidence: [`Identified by ${expertId}`],
      }));

      const edges: AnalysisEdge[] = (result.edges ?? []).map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: {
          label: edge.label,
          apiDefinition: edge.apiDefinition,
          requestFlow: edge.requestFlow,
        },
        confidence: edge.confidence,
        evidence: [`Identified by ${expertId}`],
      }));

      // 🔍 LOG: Expert analysis results
      console.log(`[EXPERT_ANALYSIS] ${expertId} identified ${nodes.length} components and ${edges.length} connections`);
      nodes.forEach((node, index) => {
        console.log(`[EXPERT_ANALYSIS] ${expertId} Component ${index + 1}: ${node.displayName} (${node.name}, confidence: ${node.confidence}%)`);
      });
      edges.forEach((edge, index) => {
        console.log(`[EXPERT_ANALYSIS] ${expertId} Connection ${index + 1}: ${edge.source} → ${edge.target} (${edge.data.label}, confidence: ${edge.confidence}%)`);
      });

      return {
        status: 'completed' as const,
        progress: 100,
        findings: result.findings ?? [],
        nodes,
        edges,
        message: result.message ?? 'Analysis completed',
        tokensUsed: inputTokens + (response.usage?.total_tokens ?? 0),
      };
    } catch (error) {
      return {
        status: 'failed' as const,
        progress: 0,
        message: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        tokensUsed: inputTokens,
      };
    }
  }

  private aggregateNodes(experts: AnalysisExpert[]): AnalysisNode[] {
    const nodeMap = new Map<string, AnalysisNode>();

    for (const expert of experts) {
      if (expert.nodes) {
        for (const node of expert.nodes) {
          // Use semantic key instead of expert-provided ID for grouping
          const semanticKey = createSemanticNodeKey(node);
          const existing = nodeMap.get(semanticKey);
          
          if (existing) {
            // Merge nodes, increase confidence if multiple experts found it
            existing.confidence = Math.min(100, existing.confidence + 10);
            existing.evidence.push(...node.evidence);
            
            // Update display information if this expert provides better details
            if (!existing.displayName && node.displayName) {
              existing.displayName = node.displayName;
            }
            if (!existing.title && node.title) {
              existing.title = node.title;
            }
            if (!existing.subtitle && node.subtitle) {
              existing.subtitle = node.subtitle;
            }
          } else {
            // Create new node with deterministic ID
            const componentType = mapToComponentType(node.name);
            nodeMap.set(semanticKey, {
              ...node,
              id: semanticKey, // Use deterministic ID instead of expert-provided ID
              name: componentType, // Standardize the component type
              evidence: node.evidence ?? [`Identified by ${expert.name}`],
            });
          }
        }
      }
    }

    return Array.from(nodeMap.values()).sort((a, b) => b.confidence - a.confidence);
  }

  private aggregateEdges(experts: AnalysisExpert[]): AnalysisEdge[] {
    const edgeMap = new Map<string, AnalysisEdge>();
    
    // Create mappings: expert-provided ID → deterministic ID, and displayName → deterministic ID
    const nodeIdMapping = new Map<string, string>();
    const nodeNameMapping = new Map<string, string>();
    
    for (const expert of experts) {
      if (expert.nodes) {
        for (const node of expert.nodes) {
          const deterministicId = createSemanticNodeKey(node);
          
          // Map expert-provided ID to deterministic ID
          nodeIdMapping.set(node.id, deterministicId);
          
          // Map semantic names to deterministic ID (for edge references)
          if (node.displayName) {
            nodeNameMapping.set(node.displayName, deterministicId);
          }
          if (node.title) {
            nodeNameMapping.set(node.title, deterministicId);
          }
          nodeNameMapping.set(node.name, deterministicId);
        }
      }
    }

    for (const expert of experts) {
      if (expert.edges) {
        for (const edge of expert.edges) {
          // Try to map edge source and target using multiple strategies:
          // 1. Direct ID mapping, 2. Semantic name mapping, 3. Use as-is
          const mappedSource = nodeIdMapping.get(edge.source) ?? 
                               nodeNameMapping.get(edge.source) ?? 
                               edge.source;
          const mappedTarget = nodeIdMapping.get(edge.target) ?? 
                               nodeNameMapping.get(edge.target) ?? 
                               edge.target;
          
          // Create a semantic edge key based on source-target pair
          const edgeKey = `${mappedSource}-to-${mappedTarget}`;
          const existing = edgeMap.get(edgeKey);
          
          if (existing) {
            // Merge edges, increase confidence if multiple experts found it
            existing.confidence = Math.min(100, existing.confidence + 10);
            existing.evidence.push(...edge.evidence);
          } else {
            edgeMap.set(edgeKey, {
              ...edge,
              id: edgeKey, // Use deterministic edge ID
              source: mappedSource, // Use deterministic source ID
              target: mappedTarget, // Use deterministic target ID
              evidence: edge.evidence ?? [`Identified by ${expert.name}`],
            });
          }
        }
      }
    }

    return Array.from(edgeMap.values()).sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Create a deterministic hash of the prompt and file contents for consistency tracking
   */
  private createPromptHash(prompt: string, files: AnalysisFile[]): string {
    const fileSignatures = files
      .sort((a, b) => a.path.localeCompare(b.path)) // Deterministic ordering
      .map(f => `${f.path}:${f.size}:${f.type}:${f.importance}`)
      .join('|');
    
    const combined = `${prompt.length}:${fileSignatures}`;
    
    // Simple hash function for consistency tracking
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Create a deterministic seed from the prompt hash
   */
  private createDeterministicSeed(promptHash: string): number {
    // Convert hex hash to number for OpenAI seed
    return parseInt(promptHash.slice(0, 8), 16) % 1000000; // Keep within reasonable range
  }

  /**
   * Normalize component names to ensure consistency across runs
   */
  private normalizeComponents(nodes: AnalysisNode[]): AnalysisNode[] {
    const normalizedNodes: AnalysisNode[] = [];
    const mergeGroups = new Map<string, AnalysisNode[]>();

    // Group similar components together
    for (const node of nodes) {
      const normalizedKey = this.createNormalizedComponentKey(node);
      if (!mergeGroups.has(normalizedKey)) {
        mergeGroups.set(normalizedKey, []);
      }
      mergeGroups.get(normalizedKey)!.push(node);
    }

    // Merge grouped components
    for (const [normalizedKey, group] of mergeGroups) {
      if (group.length === 1) {
        // For single components, still update the ID to normalized key and track original ID
        const single = group[0]!;
        const originalId = single.id;
        const normalized = {
          ...single,
          id: normalizedKey,
          originalIds: [originalId]
        } as AnalysisNode & { originalIds: string[] };
        normalizedNodes.push(normalized);
      } else {
        // Merge multiple similar components
        const merged = this.mergeComponents(group, normalizedKey);
        normalizedNodes.push(merged);
        
        console.log(`[NORMALIZATION] Merged ${group.length} similar components into "${merged.displayName}"`);
        group.forEach(comp => {
          console.log(`[NORMALIZATION]   - ${comp.displayName} (confidence: ${comp.confidence})`);
        });
      }
    }

    return normalizedNodes.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Create a normalized key for grouping similar components
   */
  private createNormalizedComponentKey(node: AnalysisNode): string {
    const displayName = (node.displayName ?? node.title ?? node.name).toLowerCase();
    
    // Define normalized patterns for common component types
    const patterns = [
      { pattern: /^(react|frontend|client|ui|web app)/, normalized: 'frontend-client' },
      { pattern: /^(api|server|backend|node\.?js|express)/, normalized: 'api-server' },
      { pattern: /^(trpc|grpc).*?(api|server)/, normalized: 'trpc-api-server' },
      { pattern: /^(postgres|postgresql|database)/, normalized: 'postgresql-database' },
      { pattern: /^(mongo|mongodb)/, normalized: 'mongodb-database' },
      { pattern: /^(redis|cache)/, normalized: 'redis-cache' },
      { pattern: /^(stripe).*?(webhook|handler)/, normalized: 'stripe-webhook-handler' },
      { pattern: /^(clerk).*?(webhook|handler)/, normalized: 'clerk-webhook-handler' },
      { pattern: /^(load.?balancer|nginx|haproxy)/, normalized: 'load-balancer' },
      { pattern: /^(cdn|cloudfront)/, normalized: 'cdn' },
    ];
    
    for (const { pattern, normalized } of patterns) {
      if (pattern.test(displayName)) {
        return normalized;
      }
    }
    
    // Default: use the component type
    return node.name.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Merge multiple components into a single representative component
   */
  private mergeComponents(components: AnalysisNode[], normalizedKey: string): AnalysisNode {
    // Find the component with highest confidence as the base
    const base = components.reduce((prev, current) => 
      current.confidence > prev.confidence ? current : prev
    );
    
    // Merge evidence from all components
    const allEvidence = components.flatMap(comp => comp.evidence ?? []);
    const uniqueEvidence = Array.from(new Set(allEvidence));
    
    // Calculate merged confidence (cap at 100)
    const totalConfidence = components.reduce((sum, comp) => sum + comp.confidence, 0);
    const mergedConfidence = Math.min(100, Math.max(base.confidence, totalConfidence / components.length + 10));
    
    // Use the most descriptive display name
    const bestDisplayName = components
      .map(comp => comp.displayName ?? comp.title ?? comp.name)
      .sort((a, b) => b.length - a.length)[0] ?? base.displayName;
    
    // Store original IDs for edge mapping
    const originalIds = components.map(comp => comp.id);
    
    return {
      ...base,
      confidence: mergedConfidence,
      evidence: uniqueEvidence,
      displayName: bestDisplayName,
      title: bestDisplayName,
      id: normalizedKey, // Use normalized key as ID
      originalIds, // Keep track of original expert IDs for edge mapping
    } as AnalysisNode & { originalIds: string[] };
  }

  /**
   * Normalize connections to use consistent node references
   */
  private normalizeConnections(edges: AnalysisEdge[], normalizedNodes: AnalysisNode[]): AnalysisEdge[] {
    // Create comprehensive mapping from ALL possible old IDs to normalized IDs
    const nodeIdMapping = new Map<string, string>();
    
    // First, build mapping from normalized nodes
    for (const node of normalizedNodes) {
      nodeIdMapping.set(node.id, node.id);
      if (node.displayName) nodeIdMapping.set(node.displayName, node.id);
      if (node.title) nodeIdMapping.set(node.title, node.id);
      nodeIdMapping.set(node.name, node.id);
      
      // Map original expert IDs to normalized ID
      const nodeWithOriginals = node as AnalysisNode & { originalIds?: string[] };
      if (nodeWithOriginals.originalIds) {
        for (const originalId of nodeWithOriginals.originalIds) {
          nodeIdMapping.set(originalId, node.id);
        }
      }
    }
    
    // Second, create pattern-based mapping for common edge reference patterns
    const createPatternMapping = (edgeRef: string): string | null => {
      const lowerRef = edgeRef.toLowerCase();
      
      // Map common patterns to normalized node IDs
      for (const node of normalizedNodes) {
        const nodeKey = this.createNormalizedComponentKey(node);
        const nodeName = (node.displayName ?? node.title ?? node.name).toLowerCase();
        
        // Try direct pattern matching
        if (lowerRef.includes('frontend') || lowerRef.includes('client') || lowerRef.includes('react')) {
          if (nodeKey === 'frontend-client') return node.id;
        }
        
        if (lowerRef.includes('api') || lowerRef.includes('server') || lowerRef.includes('backend')) {
          if (nodeKey.includes('api-server') || nodeKey.includes('rest') || nodeKey.includes('trpc')) {
            return node.id;
          }
        }
        
        if (lowerRef.includes('database') || lowerRef.includes('postgres') || lowerRef.includes('db')) {
          if (nodeKey.includes('database')) return node.id;
        }
        
        if (lowerRef.includes('webhook')) {
          if (nodeName.includes('webhook')) return node.id;
        }
        
        if (lowerRef.includes('load') || lowerRef.includes('balancer') || lowerRef.includes('nginx')) {
          if (nodeKey.includes('load-balancer')) return node.id;
        }
      }
      
      return null;
    };
    
    const edgeMap = new Map<string, AnalysisEdge>();
    
    console.log(`[NORMALIZATION] Processing ${edges.length} edges with ${normalizedNodes.length} normalized nodes`);
    console.log(`[NORMALIZATION] Available node IDs: ${normalizedNodes.map(n => n.id).join(', ')}`);
    
    for (const edge of edges) {
      // Try multiple mapping strategies
      let normalizedSource = nodeIdMapping.get(edge.source);
      let normalizedTarget = nodeIdMapping.get(edge.target);
      
      // If direct mapping failed, try pattern matching
      if (!normalizedSource) {
        const patternMapped = createPatternMapping(edge.source);
        if (patternMapped) {
          normalizedSource = patternMapped;
          console.log(`[NORMALIZATION] Pattern mapped source ${edge.source} → ${normalizedSource}`);
        }
      }
      
      if (!normalizedTarget) {
        const patternMapped = createPatternMapping(edge.target);
        if (patternMapped) {
          normalizedTarget = patternMapped;
          console.log(`[NORMALIZATION] Pattern mapped target ${edge.target} → ${normalizedTarget}`);
        }
      }
      
      // Fall back to original if no mapping found
      normalizedSource = normalizedSource ?? edge.source;
      normalizedTarget = normalizedTarget ?? edge.target;
      
      // Verify both nodes exist in normalized set
      const sourceExists = normalizedNodes.some(n => n.id === normalizedSource);
      const targetExists = normalizedNodes.some(n => n.id === normalizedTarget);
      
      if (sourceExists && targetExists) {
        const edgeKey = `${normalizedSource}-to-${normalizedTarget}`;
        
        // Merge duplicate edges
        const existing = edgeMap.get(edgeKey);
        if (existing) {
          // Merge confidence and evidence
          existing.confidence = Math.min(100, existing.confidence + 5);
          if (edge.evidence) {
            existing.evidence = [...(existing.evidence ?? []), ...edge.evidence];
          }
          console.log(`[NORMALIZATION] ✅ Merged duplicate edge ${normalizedSource} → ${normalizedTarget}`);
        } else {
          edgeMap.set(edgeKey, {
            ...edge,
            source: normalizedSource,
            target: normalizedTarget,
            id: edgeKey,
          });
          console.log(`[NORMALIZATION] ✅ Preserved edge ${edge.source} → ${edge.target} as ${normalizedSource} → ${normalizedTarget}`);
        }
      } else {
        console.log(`[NORMALIZATION] ❌ Dropped edge ${edge.source} → ${edge.target}`);
        console.log(`[NORMALIZATION]   Source: ${edge.source} → ${normalizedSource} (exists: ${sourceExists})`);
        console.log(`[NORMALIZATION]   Target: ${edge.target} → ${normalizedTarget} (exists: ${targetExists})`);
      }
    }
    
    return Array.from(edgeMap.values());
  }

  private determineArchitecture(_experts: AnalysisExpert[], files: AnalysisFile[]) {
    // Simple heuristics for architecture detection
    const hasMultipleServices = files.some(f => f.path.includes('microservice') || f.path.includes('service'));
    const hasDockerCompose = files.some(f => f.path.includes('docker-compose'));
    const hasServerless = files.some(f => f.path.includes('lambda') || f.path.includes('serverless'));
    const hasReactApp = files.some(f => f.path.includes('react') || f.path.includes('jsx'));

    if (hasServerless) {
      return {
        type: 'serverless' as const,
        confidence: 80,
        description: 'Serverless architecture with function-based components',
      };
    }

    if (hasMultipleServices || hasDockerCompose) {
      return {
        type: 'microservices' as const,
        confidence: 75,
        description: 'Microservices architecture with multiple independent services',
      };
    }

    if (hasReactApp) {
      return {
        type: 'spa' as const,
        confidence: 70,
        description: 'Single Page Application with client-server architecture',
      };
    }

    return {
      type: 'monolith' as const,
      confidence: 60,
      description: 'Monolithic application architecture',
    };
  }

  private generateSummary(nodes: AnalysisNode[], edges: AnalysisEdge[], architecture: { type: string; confidence: number; description: string }): string {
    return `Identified ${nodes.length} system components and ${edges.length} connections in a ${architecture.type} architecture. Key components include: ${nodes.slice(0, 3).map(c => c.displayName ?? c.title).join(', ')}.`;
  }

  private generateRecommendations(experts: AnalysisExpert[]): string[] {
    const recommendations = [
      'Review identified components and adjust configurations as needed',
      'Consider adding monitoring and logging components for observability',
      'Validate database connections and data flow patterns',
    ];

    // Add specific recommendations based on expert findings
    const hasDatabase = experts.some(e => e.nodes?.some(n => n.name === 'Database'));
    if (!hasDatabase) {
      recommendations.push('Consider adding a database component if data persistence is needed');
    }

    return recommendations;
  }
} 