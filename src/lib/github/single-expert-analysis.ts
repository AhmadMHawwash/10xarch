/**
 * Single Expert Analysis Service
 * 
 * Replaces the multi-expert approach with one comprehensive, reliable expert
 * that analyzes the entire system architecture in a single pass.
 */

import { openai } from '@/lib/openai';
import type { AnalysisFile } from './github-service';
import type { EntryPointAnalysis } from './entry-point-analyzer';
import type { DependencyGraph as DependencyTrackerGraph } from './dependency-tracker';
import type { DependencyGraph } from './dependency-analyzer';

export interface SingleExpertResults {
  components: AnalysisComponent[];
  connections: AnalysisConnection[];
  analysis: {
    systemType: string;
    architecture: string;
    complexity: string;
    frameworks: string[];
    confidence: number;
  };
}

export interface AnalysisComponent {
  id: string;
  name: string;
  displayName: string;
  title: string;
  subtitle: string;
  confidence: number;
  evidence: string[];
  configs?: Record<string, any>;
}

export interface AnalysisConnection {
  id: string;
  source: string;
  target: string;
  label: string;
  description: string;
  confidence: number;
  evidence: string[];
  data?: Record<string, any>;
}

export class SingleExpertAnalysisService {
  
  /**
   * Analyze repository with single comprehensive expert
   */
  async analyzeRepository(
    files: AnalysisFile[],
    architecturalContext: string,
    entryPointAnalysis: EntryPointAnalysis,
    dependencyTrackerGraph: DependencyTrackerGraph,
    dependencyGraph: DependencyGraph
  ): Promise<SingleExpertResults> {
    console.log(`[SINGLE_EXPERT] Starting comprehensive analysis of ${files.length} files`);
    
    const prompt = this.buildSingleExpertPrompt(
      files,
      architecturalContext,
      entryPointAnalysis,
      dependencyTrackerGraph,
      dependencyGraph
    );
    
    // Create deterministic seed for consistent results
    const promptHash = this.createPromptHash(prompt, files);
    console.log(`[SINGLE_EXPERT] Prompt hash: ${promptHash}`);
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-5-nano',
        messages: [
          {
            role: 'system',
            content: 'You are a Senior Software Architect specializing in system analysis. Analyze code repositories to identify architectural components and their relationships.'
          },
          {
            role: 'user', 
            content: prompt
          }
        ],
        // Some models may not accept explicit temperature=0; rely on default deterministic behavior
        seed: parseInt(promptHash.slice(0, 8), 16), // Deterministic seed
        response_format: { type: 'json_object' }
      });
      
      const content = response.choices[0]?.message.content;
      if (!content) {
        throw new Error('No response content from LLM');
      }
      
      console.log(`[SINGLE_EXPERT] Response received, tokens: ${response.usage?.total_tokens ?? 'unknown'}`);
      
      const results = JSON.parse(content) as SingleExpertResults;
      
      console.log(`[SINGLE_EXPERT] Analysis complete: ${results.components.length} components, ${results.connections.length} connections`);
      results.components.forEach((comp, i) => {
        console.log(`[SINGLE_EXPERT] Component ${i + 1}: ${comp.displayName} (${comp.name}, confidence: ${comp.confidence}%)`);
      });
      results.connections.forEach((conn, i) => {
        console.log(`[SINGLE_EXPERT] Connection ${i + 1}: ${conn.source} → ${conn.target} (${conn.label}, confidence: ${conn.confidence}%)`);
      });
      
      return results;
      
    } catch (error) {
      console.error('[SINGLE_EXPERT] Analysis failed:', error);
      throw new Error(`Single expert analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Build comprehensive single expert prompt
   */
  private buildSingleExpertPrompt(
    files: AnalysisFile[],
    architecturalContext: string,
    entryPointAnalysis: EntryPointAnalysis,
    dependencyTrackerGraph: DependencyTrackerGraph,
    dependencyGraph: DependencyGraph
  ): string {
    const fileSignatures = files.map(f => `${f.path} (${f.size} bytes)`).join('\n');
    
    return `You are a Senior Software Architect analyzing a ${entryPointAnalysis.detectedFrameworks.join('/')} system.

🚨 CRITICAL ANTI-HALLUCINATION RULES:
- ONLY identify components with clear evidence in the provided files
- DO NOT assume or invent components based on common patterns  
- DO NOT include components if you cannot find explicit evidence
- If you cannot prove a component exists, DO NOT include it
- Base ALL findings on actual code analysis, not assumptions
- Your confidence scores must reflect actual evidence found

=== SYSTEM OVERVIEW ===
${architecturalContext}

=== ENTRY POINTS ANALYSIS ===
Application Entry Points: ${entryPointAnalysis.entryPoints.length}
${entryPointAnalysis.entryPoints.map(ep => `- ${ep.path} (${ep.type}, ${ep.importance}) - ${ep.source}`).join('\n')}

Detected Frameworks: ${entryPointAnalysis.detectedFrameworks.join(', ')}

=== DEPENDENCY GRAPH ===
Total Nodes: ${dependencyTrackerGraph.statistics.totalNodes}
Total Edges: ${dependencyTrackerGraph.statistics.totalEdges}
Max Depth: ${dependencyTrackerGraph.statistics.maxDepth}
Hub Nodes: ${dependencyTrackerGraph.statistics.hubNodes.join(', ')}

Dependency Levels:
${dependencyTrackerGraph.levels.map(level => 
  `Level ${level.level} (${level.description}): ${level.nodes.length} files`
).join('\n')}

=== FILES FOR ANALYSIS ===
${fileSignatures}

=== FILE CONTENTS ===
${files.map(file => `
--- FILE: ${file.path} ---
${file.content}
`).join('\n')}

=== ANALYSIS INSTRUCTIONS ===

Analyze this system as a Senior Software Architect and identify:

1. **SYSTEM COMPONENTS** - Only components with clear evidence:
   - Valid types: "Client", "Server", "Database", "Cache", "CDN", "Message Queue", "Load Balancer", "Custom Component"
   - For servers, distinguish carefully:
     * "Next.js Server": Web framework handling pages/SSR (src/app/, pages/, next.config.js)
     * "tRPC API Server": Type-safe API procedures (tRPC routers with .procedure, .query, .mutation)
     * "API Server": Generic REST/HTTP APIs (Express routes, app.get/post, non-tRPC APIs)
   - Use semantic names: "PostgreSQL Database", "Redis Cache", "React Frontend Client"
   - Only include what you can prove exists in the code

2. **SYSTEM CONNECTIONS** - Only connections with clear evidence:
   - Must see actual API calls, imports, or data flow in code
   - Common patterns: "HTTP requests", "Database queries", "API calls", "Data flow"
   - Include confidence based on evidence strength

3. **ARCHITECTURAL ANALYSIS**:
   - System type: Frontend App, Backend API, Full-Stack, etc.
   - Architecture pattern: Monolithic, Layered, Microservices, etc.
   - Complexity level: Low, Medium, High based on actual complexity
   - Confidence: Based on evidence quality

RESPOND WITH VALID JSON:
{
  "components": [
    {
      "id": "unique-component-id",
      "name": "Component Type from allowed list",
      "displayName": "Semantic component name based on evidence",
      "title": "Component title based on evidence", 
      "subtitle": "Component purpose based on evidence",
      "confidence": 85,
      "evidence": ["List of specific evidence from code"],
      "configs": {
        "title": "Component title",
        "subtitle": "Component purpose"
      }
    }
  ],
  "connections": [
    {
      "id": "unique-connection-id",
      "source": "source-component-id",
      "target": "target-component-id", 
      "label": "Connection type based on evidence",
      "description": "How they connect based on code evidence",
      "confidence": 80,
      "evidence": ["Specific code evidence for this connection"],
      "data": {
        "label": "Connection label"
      }
    }
  ],
  "analysis": {
    "systemType": "Full-Stack Web Application",
    "architecture": "Layered Architecture", 
    "complexity": "Medium",
    "frameworks": ["Next.js", "tRPC", "React"],
    "confidence": 90
  }
}`;
  }
  
  /**
   * Create deterministic hash for prompt consistency
   */
  private createPromptHash(prompt: string, files: AnalysisFile[]): string {
    const fileSignature = files.map(f => `${f.path}:${f.size}`).join(',');
    const combined = `${prompt.length}:${fileSignature}`;
    
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}