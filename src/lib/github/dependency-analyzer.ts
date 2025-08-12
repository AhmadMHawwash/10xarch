/**
 * Dependency Analyzer
 * 
 * Analyzes code relationships and builds dependency graphs to understand
 * how different parts of the system connect and communicate.
 */

import type { AnalysisFile } from './github-service';

export interface CodeDependency {
  from: string; // file path that imports
  to: string;   // file path being imported
  type: DependencyType;
  importedItems: string[]; // what's being imported
  line?: number; // line number of import
}

export interface ServiceBoundary {
  name: string; // e.g., "Frontend Layer", "API Layer", "Database Layer"
  files: string[];
  purpose: string;
  dependencies: string[]; // other boundaries this depends on
}

export interface DataFlowConnection {
  from: ServiceBoundary;
  to: ServiceBoundary;
  via: string; // e.g., "HTTP API", "Database Query", "Function Call"
  confidence: number;
  evidence: string[];
}

export type DependencyType = 
  | 'import'        // ES6 import
  | 'require'       // CommonJS require
  | 'dynamic'       // dynamic import()
  | 'type_only'     // TypeScript type import
  | 'api_call'      // HTTP/API request
  | 'database'      // Database query/connection
  | 'config'        // Configuration reference
  | 'asset';        // Static asset

export interface DependencyGraph {
  dependencies: CodeDependency[];
  serviceBoundaries: ServiceBoundary[];
  dataFlow: DataFlowConnection[];
  entryPoints: string[];
  isolatedFiles: string[];
}

export class DependencyAnalyzer {
  
  /**
   * Analyze dependencies across all files to build a complete graph
   */
  analyzeDependencies(files: AnalysisFile[]): DependencyGraph {
    console.log(`[DEPENDENCY_ANALYSIS] Analyzing ${files.length} files for dependencies`);
    
    const dependencies = this.extractAllDependencies(files);
    const serviceBoundaries = this.identifyServiceBoundaries(files, dependencies);
    const dataFlow = this.mapDataFlow(serviceBoundaries, dependencies);
    const entryPoints = this.findEntryPoints(files, dependencies);
    const isolatedFiles = this.findIsolatedFiles(files, dependencies);
    
    console.log(`[DEPENDENCY_ANALYSIS] Found ${dependencies.length} dependencies across ${serviceBoundaries.length} service boundaries`);
    
    return {
      dependencies,
      serviceBoundaries,
      dataFlow,
      entryPoints,
      isolatedFiles
    };
  }

  /**
   * Extract dependencies from all files
   */
  private extractAllDependencies(files: AnalysisFile[]): CodeDependency[] {
    const allDependencies: CodeDependency[] = [];
    
    for (const file of files) {
      const fileDependencies = this.extractFileDependencies(file);
      allDependencies.push(...fileDependencies);
    }
    
    return allDependencies;
  }

  /**
   * Extract dependencies from a single file
   */
  private extractFileDependencies(file: AnalysisFile): CodeDependency[] {
    const dependencies: CodeDependency[] = [];
    const lines = file.content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() ?? '';
      const lineNumber = i + 1;
      
      // Parse different types of imports/dependencies
      const importDeps = this.parseImportStatements(line, file.path, lineNumber);
      const apiDeps = this.parseApiCalls(line, file.path, lineNumber);
      const dbDeps = this.parseDatabaseReferences(line, file.path, lineNumber);
      
      dependencies.push(...importDeps, ...apiDeps, ...dbDeps);
    }
    
    return dependencies;
  }

  /**
   * Parse ES6 imports, CommonJS requires, and dynamic imports
   */
  private parseImportStatements(line: string, fromFile: string, lineNumber: number): CodeDependency[] {
    const dependencies: CodeDependency[] = [];
    
    // ES6 import statements
    const es6ImportRegex = /import\s+(?:(?:\{([^}]+)\})|(?:(\w+))|(?:\*\s+as\s+(\w+)))\s+from\s+['"`]([^'"`]+)['"`]/;
    const es6Match = line.match(es6ImportRegex);
    if (es6Match) {
      const [, namedImports, defaultImport, namespaceImport, modulePath] = es6Match;
      const importedItems = [];
      
      if (namedImports) {
        importedItems.push(...namedImports.split(',').map(item => item.trim()));
      }
      if (defaultImport) importedItems.push(defaultImport);
      if (namespaceImport) importedItems.push(namespaceImport);
      
      if (!modulePath) {
        console.warn(`[DEPENDENCY_ANALYSIS] Missing module path in import at ${fromFile}:${lineNumber}: "${line}"`);
        return dependencies;
      }
      
      dependencies.push({
        from: fromFile,
        to: this.resolveModulePath(modulePath, fromFile),
        type: 'import',
        importedItems,
        line: lineNumber
      });
    }
    
    // TypeScript type-only imports
    const typeImportRegex = /import\s+type\s+(?:\{([^}]+)\}|(\w+))\s+from\s+['"`]([^'"`]+)['"`]/;
    const typeMatch = line.match(typeImportRegex);
    if (typeMatch) {
      const [, namedTypes, defaultType, modulePath] = typeMatch;
      const importedItems = namedTypes ? namedTypes.split(',').map(item => item.trim()) : [defaultType ?? ''];
      
      if (!modulePath) {
        console.warn(`[DEPENDENCY_ANALYSIS] Missing module path in type import at ${fromFile}:${lineNumber}: "${line}"`);
        return dependencies;
      }
      
      dependencies.push({
        from: fromFile,
        to: this.resolveModulePath(modulePath, fromFile),
        type: 'type_only',
        importedItems,
        line: lineNumber
      });
    }
    
    // CommonJS require
    const requireRegex = /(?:const|let|var)\s+(?:\{([^}]+)\}|(\w+))\s*=\s*require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/;
    const requireMatch = line.match(requireRegex);
    if (requireMatch) {
      const [, destructured, variable, modulePath] = requireMatch;
      const importedItems = destructured ? destructured.split(',').map(item => item.trim()) : [variable ?? ''];
      
      if (!modulePath) {
        console.warn(`[DEPENDENCY_ANALYSIS] Missing module path in require at ${fromFile}:${lineNumber}: "${line}"`);
        return dependencies;
      }
      
      dependencies.push({
        from: fromFile,
        to: this.resolveModulePath(modulePath, fromFile),
        type: 'require',
        importedItems,
        line: lineNumber
      });
    }
    
    // Dynamic imports
    const dynamicImportRegex = /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/;
    const dynamicMatch = line.match(dynamicImportRegex);
    if (dynamicMatch) {
      const [, modulePath] = dynamicMatch;
      
      if (!modulePath) {
        console.warn(`[DEPENDENCY_ANALYSIS] Missing module path in dynamic import at ${fromFile}:${lineNumber}: "${line}"`);
        return dependencies;
      }
      
      dependencies.push({
        from: fromFile,
        to: this.resolveModulePath(modulePath, fromFile),
        type: 'dynamic',
        importedItems: ['*'],
        line: lineNumber
      });
    }
    
    return dependencies;
  }

  /**
   * Parse API calls and HTTP requests
   */
  private parseApiCalls(line: string, fromFile: string, lineNumber: number): CodeDependency[] {
    const dependencies: CodeDependency[] = [];
    
    // Fetch calls
    const fetchRegex = /fetch\s*\(\s*['"`]([^'"`]+)['"`]/;
    const fetchMatch = line.match(fetchRegex);
    if (fetchMatch) {
      const [, apiPath] = fetchMatch;
      if (!apiPath) {
        console.warn(`[DEPENDENCY_ANALYSIS] Missing API path in fetch call at ${fromFile}:${lineNumber}: "${line}"`);
        return dependencies;
      }
      
      dependencies.push({
        from: fromFile,
        to: apiPath,
        type: 'api_call',
        importedItems: ['fetch'],
        line: lineNumber
      });
    }
    
    // Axios calls
    const axiosRegex = /axios\.\w+\s*\(\s*['"`]([^'"`]+)['"`]/;
    const axiosMatch = line.match(axiosRegex);
    if (axiosMatch) {
      const [, apiPath] = axiosMatch;
      if (!apiPath) {
        console.warn(`[DEPENDENCY_ANALYSIS] Missing API path in axios call at ${fromFile}:${lineNumber}: "${line}"`);
        return dependencies;
      }
      
      dependencies.push({
        from: fromFile,
        to: apiPath,
        type: 'api_call',
        importedItems: ['axios'],
        line: lineNumber
      });
    }
    
    // tRPC calls
    const trpcRegex = /api\.(\w+)\.(\w+)\.(?:query|mutate)/;
    const trpcMatch = line.match(trpcRegex);
    if (trpcMatch) {
      const [, router, procedure] = trpcMatch;
      if (!router || !procedure) {
        console.warn(`[DEPENDENCY_ANALYSIS] Missing router/procedure in tRPC call at ${fromFile}:${lineNumber}: "${line}"`);
        return dependencies;
      }
      
      dependencies.push({
        from: fromFile,
        to: `src/server/api/routers/${router}.ts`,
        type: 'api_call',
        importedItems: [procedure],
        line: lineNumber
      });
    }
    
    return dependencies;
  }

  /**
   * Parse database references and ORM usage
   */
  private parseDatabaseReferences(line: string, fromFile: string, lineNumber: number): CodeDependency[] {
    const dependencies: CodeDependency[] = [];
    
    // Drizzle database queries
    const drizzleRegex = /db\.(select|insert|update|delete|query)/;
    const drizzleMatch = line.match(drizzleRegex);
    if (drizzleMatch) {
      dependencies.push({
        from: fromFile,
        to: 'src/server/db/index.ts',
        type: 'database',
        importedItems: ['db'],
        line: lineNumber
      });
    }
    
    // Prisma client usage
    const prismaRegex = /prisma\.(\w+)\./;
    const prismaMatch = line.match(prismaRegex);
    if (prismaMatch) {
      const [, model] = prismaMatch;
      if (!model) {
        console.warn(`[DEPENDENCY_ANALYSIS] Missing model in Prisma call at ${fromFile}:${lineNumber}: "${line}"`);
        return dependencies;
      }
      
      dependencies.push({
        from: fromFile,
        to: 'prisma/schema.prisma',
        type: 'database',
        importedItems: [model],
        line: lineNumber
      });
    }
    
    return dependencies;
  }

  /**
   * Resolve module path to actual file path
   */
  private resolveModulePath(modulePath: string, fromFile: string): string {
    // Skip external packages
    if (!modulePath.startsWith('.') && !modulePath.startsWith('/') && !modulePath.startsWith('src/')) {
      return modulePath; // External package
    }
    
    // Handle relative imports
    if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
      // Simple resolution - in a real implementation, you'd do proper path resolution
      const fromDir = fromFile.split('/').slice(0, -1).join('/');
      const resolved = modulePath.startsWith('./') 
        ? `${fromDir}/${modulePath.slice(2)}`
        : modulePath; // Simplified - would need proper ../handling
      
      // Add common extensions if missing
      if (!resolved.endsWith('.ts') && !resolved.endsWith('.tsx') && !resolved.endsWith('.js') && !resolved.endsWith('.jsx')) {
        return `${resolved}.ts`; // Default to .ts
      }
      return resolved;
    }
    
    // Handle absolute imports from src/
    if (modulePath.startsWith('src/') || modulePath.startsWith('@/')) {
      const cleanPath = modulePath.replace('@/', 'src/');
      if (!cleanPath.endsWith('.ts') && !cleanPath.endsWith('.tsx')) {
        return `${cleanPath}.ts`;
      }
      return cleanPath;
    }
    
    return modulePath;
  }

  /**
   * Identify service boundaries based on file structure and dependencies
   */
  private identifyServiceBoundaries(files: AnalysisFile[], dependencies: CodeDependency[]): ServiceBoundary[] {
    const boundaries: ServiceBoundary[] = [];
    
    // Group files by architectural layers
    const frontendFiles = files.filter(f => 
      f.path.includes('components/') || 
      f.path.includes('pages/') || 
      f.path.includes('app/') && f.path.endsWith('.tsx')
    );
    
    const apiFiles = files.filter(f => 
      f.path.includes('api/') || 
      f.path.includes('routers/') ||
      f.path.includes('routes/')
    );
    
    const databaseFiles = files.filter(f => 
      f.path.includes('db/') || 
      f.path.includes('database/') ||
      f.path.includes('schema') ||
      f.path.includes('models/')
    );
    
    const middlewareFiles = files.filter(f => 
      f.path.includes('middleware') ||
      f.type === 'middleware'
    );
    
    const integrationFiles = files.filter(f => 
      f.path.includes('webhook') ||
      f.path.includes('stripe') ||
      f.path.includes('clerk')
    );
    
    // Create service boundaries
    if (frontendFiles.length > 0) {
      boundaries.push({
        name: 'Frontend Layer',
        files: frontendFiles.map(f => f.path),
        purpose: 'User interface and client-side logic',
        dependencies: apiFiles.length > 0 ? ['API Layer'] : []
      });
    }
    
    if (apiFiles.length > 0) {
      boundaries.push({
        name: 'API Layer',
        files: apiFiles.map(f => f.path),
        purpose: 'Business logic and API endpoints',
        dependencies: databaseFiles.length > 0 ? ['Database Layer'] : []
      });
    }
    
    if (databaseFiles.length > 0) {
      boundaries.push({
        name: 'Database Layer',
        files: databaseFiles.map(f => f.path),
        purpose: 'Data persistence and models',
        dependencies: []
      });
    }
    
    if (middlewareFiles.length > 0) {
      boundaries.push({
        name: 'Middleware Layer',
        files: middlewareFiles.map(f => f.path),
        purpose: 'Request processing and cross-cutting concerns',
        dependencies: apiFiles.length > 0 ? ['API Layer'] : []
      });
    }
    
    if (integrationFiles.length > 0) {
      boundaries.push({
        name: 'External Integrations',
        files: integrationFiles.map(f => f.path),
        purpose: 'Third-party service integrations',
        dependencies: apiFiles.length > 0 ? ['API Layer'] : []
      });
    }
    
    return boundaries;
  }

  /**
   * Map data flow between service boundaries
   */
  private mapDataFlow(boundaries: ServiceBoundary[], dependencies: CodeDependency[]): DataFlowConnection[] {
    const connections: DataFlowConnection[] = [];
    
    for (const boundary of boundaries) {
      for (const depBoundaryName of boundary.dependencies) {
        const targetBoundary = boundaries.find(b => b.name === depBoundaryName);
        if (targetBoundary) {
          // Find evidence of connections between these boundaries
          const evidence = dependencies.filter(dep => 
            boundary.files.includes(dep.from) && 
            targetBoundary.files.some(file => dep.to.includes(file.replace('.ts', '').replace('.tsx', '')))
          );
          
          if (evidence.length > 0) {
            const connectionType = this.determineConnectionType(boundary, targetBoundary, evidence);
            
            connections.push({
              from: boundary,
              to: targetBoundary,
              via: connectionType,
              confidence: Math.min(95, evidence.length * 20), // Higher confidence with more evidence
              evidence: evidence.map(e => `${e.from} → ${e.to} (${e.type})`)
            });
          }
        }
      }
    }
    
    return connections;
  }

  /**
   * Determine the type of connection between boundaries
   */
  private determineConnectionType(from: ServiceBoundary, to: ServiceBoundary, evidence: CodeDependency[]): string {
    const hasApiCalls = evidence.some(e => e.type === 'api_call');
    const hasDatabaseCalls = evidence.some(e => e.type === 'database');
    const hasImports = evidence.some(e => e.type === 'import' || e.type === 'require');
    
    if (from.name === 'Frontend Layer' && to.name === 'API Layer') {
      return hasApiCalls ? 'HTTP API Requests' : 'Function Imports';
    }
    
    if (from.name === 'API Layer' && to.name === 'Database Layer') {
      return hasDatabaseCalls ? 'Database Queries' : 'ORM Integration';
    }
    
    if (from.name === 'Middleware Layer') {
      return 'Request Pipeline';
    }
    
    if (to.name === 'External Integrations') {
      return 'External API Calls';
    }
    
    return hasImports ? 'Module Dependencies' : 'Direct Calls';
  }

  /**
   * Find entry points to the system
   */
  private findEntryPoints(files: AnalysisFile[], dependencies: CodeDependency[]): string[] {
    const entryPoints: string[] = [];
    const importedFiles = new Set(dependencies.map(d => d.to));
    
    // Files that aren't imported by others are potential entry points
    for (const file of files) {
      if (!importedFiles.has(file.path) && 
          (file.type === 'entry' || 
           file.path.includes('layout.tsx') || 
           file.path.includes('page.tsx') ||
           file.path.includes('main.') ||
           file.path.includes('index.'))) {
        entryPoints.push(file.path);
      }
    }
    
    return entryPoints;
  }

  /**
   * Find files with no dependencies (isolated)
   */
  private findIsolatedFiles(files: AnalysisFile[], dependencies: CodeDependency[]): string[] {
    const filesWithDeps = new Set([
      ...dependencies.map(d => d.from),
      ...dependencies.map(d => d.to)
    ]);
    
    return files
      .filter(f => !filesWithDeps.has(f.path))
      .map(f => f.path);
  }

  /**
   * Generate a summary of the dependency analysis for LLM context
   */
  generateDependencyContext(graph: DependencyGraph): string {
    const { serviceBoundaries, dataFlow, entryPoints, dependencies } = graph;
    
    let context = `=== SYSTEM ARCHITECTURE ANALYSIS ===\n\n`;
    
    // Service boundaries
    context += `SERVICE BOUNDARIES (${serviceBoundaries.length}):\n`;
    for (const boundary of serviceBoundaries) {
      context += `- ${boundary.name}: ${boundary.purpose}\n`;
      context += `  Files: ${boundary.files.length} files\n`;
      if (boundary.dependencies.length > 0) {
        context += `  Depends on: ${boundary.dependencies.join(', ')}\n`;
      }
    }
    context += '\n';
    
    // Data flow
    context += `DATA FLOW CONNECTIONS (${dataFlow.length}):\n`;
    for (const connection of dataFlow) {
      context += `- ${connection.from.name} → ${connection.to.name}\n`;
      context += `  Via: ${connection.via}\n`;
      context += `  Confidence: ${connection.confidence}%\n`;
      context += `  Evidence: ${connection.evidence.slice(0, 3).join(', ')}\n\n`;
    }
    
    // Entry points
    if (entryPoints.length > 0) {
      context += `ENTRY POINTS (${entryPoints.length}):\n`;
      entryPoints.forEach(entry => {
        context += `- ${entry}\n`;
      });
      context += '\n';
    }
    
    // Key dependencies summary
    const externalDeps = dependencies.filter(d => !d.to.startsWith('src/') && !d.to.startsWith('./'));
    if (externalDeps.length > 0) {
      const topExternalDeps = externalDeps
        .reduce((acc, dep) => {
          acc[dep.to] = (acc[dep.to] ?? 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      
      context += `EXTERNAL DEPENDENCIES:\n`;
      Object.entries(topExternalDeps)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([dep, count]) => {
          context += `- ${dep} (used ${count} times)\n`;
        });
    }
    
    return context;
  }
}