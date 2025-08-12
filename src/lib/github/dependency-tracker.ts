/**
 * Dependency Tracker
 * 
 * Follows actual code references from entry points to build accurate dependency graphs.
 * Tracks imports, API calls, database queries, and other relationships.
 */

import type { AnalysisFile } from './github-service';
import type { EntryPoint } from './entry-point-analyzer';

export interface CodeReference {
  from: string; // Source file path
  to: string;   // Target file/resource path
  type: ReferenceType;
  weight: number; // Importance weight (1-10)
  line?: number;
  context?: string; // Additional context about the reference
}

export type ReferenceType = 
  | 'import'        // ES6 import / CommonJS require
  | 'dynamic_import' // Dynamic import()
  | 'api_call'      // HTTP API request
  | 'database'      // Database query/connection
  | 'component'     // JSX component usage
  | 'env_var'       // Environment variable reference
  | 'config'        // Configuration reference
  | 'asset';        // Static asset reference

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  levels: GraphLevel[]; // Files organized by dependency depth
  statistics: GraphStatistics;
}

export interface GraphNode {
  path: string;
  type: 'entry_point' | 'dependency' | 'external';
  level: number; // Depth from entry points (0 = entry point)
  importance: number; // Calculated importance score
  inDegree: number; // How many files depend on this
  outDegree: number; // How many files this depends on
  references: CodeReference[];
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  types: ReferenceType[]; // Multiple reference types between same files
}

export interface GraphLevel {
  level: number;
  nodes: string[];
  description: string;
}

export interface GraphStatistics {
  totalNodes: number;
  totalEdges: number;
  maxDepth: number;
  entryPoints: number;
  hubNodes: string[]; // High centrality nodes
}

export class DependencyTracker {
  private contentLoader?: (path: string) => Promise<string | null>;
  private workspacePackages: Record<string, { name: string; dir: string; main?: string; module?: string; types?: string; exports?: Record<string, unknown> } > = {};
  private tsconfigAliases: Array<{ dir: string; baseUrl?: string; paths: Record<string, string[]> }> = [];

  setContentLoader(loader: (path: string) => Promise<string | null>): void {
    this.contentLoader = loader;
  }

  setWorkspacePackages(map: Record<string, { name: string; dir: string; main?: string; module?: string; types?: string; exports?: Record<string, unknown> }>): void {
    console.log(`[DEPENDENCY_TRACKER] Setting workspace packages:`, Object.keys(map).map(key => `${key} → ${map[key]!.dir} (name: ${map[key]!.name})`));
    this.workspacePackages = map;
  }

  setTsconfigPathAliases(records: Array<{ dir: string; baseUrl?: string; paths: Record<string, string[]> }>): void {
    this.tsconfigAliases = records;
  }
  
  /**
   * Build dependency graph from entry points with specified depth
   */
  async buildDependencyGraph(
    entryPoints: EntryPoint[], 
    allFiles: AnalysisFile[], 
    maxDepth: number
  ): Promise<DependencyGraph> {
    console.log(`[DEPENDENCY_TRACKER] Building graph from ${entryPoints.length} entry points, max depth: ${maxDepth}`);
    
    const nodes = new Map<string, GraphNode>();
    const references: CodeReference[] = [];
    const visited = new Set<string>();
    const levels: GraphLevel[] = [];
    
    // Initialize entry points as level 0 - EXCLUDE TEST FILES
    for (const entryPoint of entryPoints) {
      if (this.fileExists(entryPoint.path, allFiles) && !this.isTestFile(entryPoint.path)) {
        nodes.set(entryPoint.path, {
          path: entryPoint.path,
          type: 'entry_point',
          level: 0,
          importance: this.getImportanceScore(entryPoint.importance),
          inDegree: 0,
          outDegree: 0,
          references: []
        });
      }
    }
    
    // Build graph level by level with circuit breakers
    for (let currentDepth = 0; currentDepth < maxDepth; currentDepth++) {
      const currentLevelNodes = Array.from(nodes.values()).filter(n => n.level === currentDepth);
      
      if (currentLevelNodes.length === 0) break;
      
      console.log(`[DEPENDENCY_TRACKER] Processing level ${currentDepth}: ${currentLevelNodes.length} nodes`);
      
      const nextLevelPaths = new Set<string>();
      
      // Process each node at current level
      for (const node of currentLevelNodes) {
        if (visited.has(node.path)) continue;
        visited.add(node.path);
        
        const file = allFiles.find(f => f.path === node.path);
        if (!file) continue;
        // Lazily load content if missing
        if ((!file.content || file.content.length === 0) && this.contentLoader) {
          const content = await this.contentLoader(file.path);
          file.content = content ?? '';
        }
        
        // Extract all references from this file
        const fileReferences = this.extractReferences(file, allFiles);
        references.push(...fileReferences);
        node.references = fileReferences;
        node.outDegree = fileReferences.length;
        
        // Debug logging for reference extraction
        if (fileReferences.length > 0) {
          console.log(`[DEPENDENCY_TRACKER] ${file.path} has ${fileReferences.length} references`);
          fileReferences.slice(0, 3).forEach(ref => {
            console.log(`[DEPENDENCY_TRACKER]   → ${ref.to} (${ref.type}, weight: ${ref.weight})`);
          });
        }
        
        // Add referenced files to next level - EXCLUDE TEST FILES
        for (const ref of fileReferences) {
          if (this.fileExists(ref.to, allFiles) && !nodes.has(ref.to) && !this.isTestFile(ref.to)) {
            nextLevelPaths.add(ref.to);
          }
        }
      }
      
      // Debug logging for dependency tracking
      console.log(`[DEPENDENCY_TRACKER] Level ${currentDepth} found ${nextLevelPaths.size} new dependencies`);
      if (nextLevelPaths.size > 0) {
        const paths = Array.from(nextLevelPaths).slice(0, 5);
        console.log(`[DEPENDENCY_TRACKER] Next level paths (first 5): ${paths.join(', ')}`);
      }
      
      // Create nodes for next level
      for (const path of nextLevelPaths) {
        if (!nodes.has(path)) {
          nodes.set(path, {
            path,
            type: 'dependency',
            level: currentDepth + 1,
            importance: 1,
            inDegree: 0,
            outDegree: 0,
            references: []
          });
        }
      }
      
      // Record level info
      levels.push({
        level: currentDepth,
        nodes: currentLevelNodes.map(n => n.path),
        description: currentDepth === 0 ? 'Entry Points' : 
                    currentDepth === 1 ? 'Direct Dependencies' :
                    `Level ${currentDepth} Dependencies`
      });

      // Circuit breaker: stop early if graph growth is low-yield or too large
      const totalNodes = nodes.size;
      if (currentDepth + 1 >= maxDepth) break;
      if (currentDepth >= 3 && nextLevelPaths.size < 2) {
        console.warn(`[DEPENDENCY_TRACKER] Early stop: low yield at depth ${currentDepth} (new deps: ${nextLevelPaths.size})`);
        break;
      }
      if (totalNodes > 500) {
        console.warn(`[DEPENDENCY_TRACKER] Early stop: node limit exceeded (${totalNodes})`);
        break;
      }
    }
    
    // Calculate in-degrees and create edges
    const edges = this.buildEdges(references, nodes);
    this.calculateInDegrees(nodes, references);
    this.calculateImportanceScores(nodes);
    
    const statistics = this.calculateStatistics(nodes, edges, levels);
    
    console.log(`[DEPENDENCY_TRACKER] Graph complete: ${statistics.totalNodes} nodes, ${statistics.totalEdges} edges, ${statistics.maxDepth} levels`);
    
    return {
      nodes: Array.from(nodes.values()),
      edges,
      levels,
      statistics
    };
  }
  
  /**
   * Extract all types of references from a file
   */
  private extractReferences(file: AnalysisFile, allFiles: AnalysisFile[]): CodeReference[] {
    const references: CodeReference[] = [];
    const lines = file.content.split('\n');
    // Build symbol → module map once per file for use in resolvers (e.g., db/prisma sources)
    const symbolToModule = this.buildImportSymbolMap(lines);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() ?? '';
      const lineNumber = i + 1;
      
      // Extract different types of references
      references.push(...this.extractImports(line, file.path, lineNumber, allFiles));
      references.push(...this.extractApiCalls(line, file.path, lineNumber));
      references.push(...this.extractDatabaseReferences(line, file.path, lineNumber, file.path, allFiles, symbolToModule));
      references.push(...this.extractComponentUsage(line, file.path, lineNumber));
      references.push(...this.extractEnvVariables(line, file.path, lineNumber));
      references.push(...this.extractConfigReferences(line, file.path, lineNumber));
    }
    
    // Filter and normalize references to use actual file paths
    const filteredReferences: CodeReference[] = [];
    
    for (const ref of references) {
      // Skip references to test files completely
      if (this.isTestFile(ref.to)) {
        console.log(`[DEPENDENCY_TRACKER] Skipping test file reference: ${ref.to}`);
        continue;
      }
      
      // Check if it's a valid external reference
      if (this.isValidExternalReference(ref.to)) {
        filteredReferences.push(ref);
        continue;
      }
      
      // Try to find the actual file path
      const actualPath = this.findActualFilePath(ref.to, allFiles);
      if (actualPath) {
        // Use the actual resolved path
        filteredReferences.push({
          ...ref,
          to: actualPath
        });
        if (actualPath !== ref.to) {
          console.log(`[DEPENDENCY_TRACKER] ✅ Resolved: ${ref.from} → ${ref.to} → ${actualPath}`);
        }
      } else {
        // Check if ref.to appears to be a folder (has files inside it)
        const folderPath = this.normalizePath(ref.to);
        const filesInFolder = allFiles.filter(f => f.path.startsWith(`${folderPath}/`) && !f.path.slice(folderPath.length + 1).includes('/'));
        const hasIndexFile = allFiles.find(f => {
          const relativePath = f.path.startsWith(`${folderPath}/`) ? f.path.slice(folderPath.length + 1) : '';
          return /^index\.(ts|tsx|js|jsx)$/.test(relativePath);
        });
        
        if (filesInFolder.length > 0 && hasIndexFile) {
          console.log(`[DEPENDENCY_TRACKER] 📁 ${ref.to} appears to be a folder with ${filesInFolder.length} files, using index: ${hasIndexFile.path}`);
          filteredReferences.push({
            ...ref,
            to: hasIndexFile.path
          });
        } else if (filesInFolder.length > 0) {
          console.log(`[DEPENDENCY_TRACKER] 📁 ${ref.to} appears to be a folder with ${filesInFolder.length} files but no index file`);
          const firstFile = filesInFolder[0];
          if (firstFile) {
            console.log(`[DEPENDENCY_TRACKER] Using first file in folder: ${firstFile.path}`);
            filteredReferences.push({
              ...ref,
              to: firstFile.path
            });
          }
        } else {
          console.log(`[DEPENDENCY_TRACKER] ❌ Reference not found: ${ref.from} → ${ref.to} (${ref.type})`);
          const fileName = ref.to.split('/').pop() ?? '';
          const similarFiles = allFiles.filter(f => f.path.includes(fileName)).map(f => f.path).slice(0, 3);
          console.log(`[DEPENDENCY_TRACKER] Available files matching pattern: ${similarFiles.join(', ')}`);
        }
      }
    }
    
    console.log(`[DEPENDENCY_TRACKER] ${file.path}: Found ${references.length} total references, ${filteredReferences.length} valid after filtering`);
    return filteredReferences;
  }
  
  /**
   * Extract import/require statements
   */
  private extractImports(line: string, fromFile: string, lineNumber: number, allFiles: AnalysisFile[]): CodeReference[] {
    const references: CodeReference[] = [];
    
    // ES6 imports
    const importRegex = /import\s+(?:.*\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = importRegex.exec(line)) !== null) {
      const modulePath = this.resolveModulePath(match[1]!, fromFile, allFiles);
      references.push({
        from: fromFile,
        to: modulePath,
        type: 'import',
        weight: 3,
        line: lineNumber
      });
    }
    
    // CommonJS require
    const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    while ((match = requireRegex.exec(line)) !== null) {
      const modulePath = this.resolveModulePath(match[1]!, fromFile, allFiles);
      references.push({
        from: fromFile,
        to: modulePath,
        type: 'import',
        weight: 3,
        line: lineNumber
      });
    }
    
    // Dynamic imports
    const dynamicImportRegex = /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    while ((match = dynamicImportRegex.exec(line)) !== null) {
      const modulePath = this.resolveModulePath(match[1]!, fromFile, allFiles);
      references.push({
        from: fromFile,
        to: modulePath,
        type: 'dynamic_import',
        weight: 2,
        line: lineNumber
      });
    }
    
    return references;
  }
  
  /**
   * Extract API calls (high weight)
   */
  private extractApiCalls(line: string, fromFile: string, lineNumber: number): CodeReference[] {
    const references: CodeReference[] = [];
    
    // Fetch calls
    const fetchRegex = /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = fetchRegex.exec(line)) !== null) {
      references.push({
        from: fromFile,
        to: match[1]!,
        type: 'api_call',
        weight: 8, // High weight for API calls
        line: lineNumber,
        context: 'fetch'
      });
    }
    
    // Axios calls
    const axiosRegex = /axios\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    while ((match = axiosRegex.exec(line)) !== null) {
      references.push({
        from: fromFile,
        to: match[2]!,
        type: 'api_call',
        weight: 8,
        line: lineNumber,
        context: `axios.${match[1]}`
      });
    }
    
    // tRPC calls
    const trpcRegex = /api\.(\w+)\.(\w+)\.(?:query|mutate|useQuery|useMutation)/g;
    while ((match = trpcRegex.exec(line)) !== null) {
      const routerPath = `src/server/api/routers/${match[1]}.ts`;
      references.push({
        from: fromFile,
        to: routerPath,
        type: 'api_call',
        weight: 9, // Very high for tRPC
        line: lineNumber,
        context: `tRPC ${match[1]}.${match[2]}`
      });
    }
    
    return references;
  }
  
  /**
   * Extract database references
   */
  private extractDatabaseReferences(
    line: string,
    fromFile: string,
    lineNumber: number,
    filePath: string,
    allFiles: AnalysisFile[],
    symbolToModule: Map<string, string>
  ): CodeReference[] {
    const references: CodeReference[] = [];
    
    // Drizzle database calls
    const drizzleRegex = /db\.(select|insert|update|delete|query)/g;
    let match;
    while ((match = drizzleRegex.exec(line)) !== null) {
      // If 'db' is imported from somewhere, resolve that module path; else fallback
      const dbModule = symbolToModule.get('db');
      const resolved = dbModule ? this.resolveModulePath(dbModule, filePath, allFiles) : 'src/server/db/index.ts';
      references.push({
        from: fromFile,
        to: resolved,
        type: 'database',
        weight: 6,
        line: lineNumber,
        context: `drizzle ${match[1]}`
      });
    }
    
    // Prisma calls
    const prismaRegex = /prisma\.(\w+)\./g;
    while ((match = prismaRegex.exec(line)) !== null) {
      // If 'prisma' symbol is imported (e.g. from '@dub/prisma' or '@prisma/client'), resolve to module
      const prismaModule = symbolToModule.get('prisma');
      // If not imported, assume external '@prisma/client'
      const targetModule = prismaModule ?? '@prisma/client';
      const resolved = targetModule.startsWith('.') || targetModule.startsWith('@') || targetModule.includes('/')
        ? this.resolveModulePath(targetModule, filePath, allFiles)
        : `npm:${targetModule}`;
      references.push({
        from: fromFile,
        to: resolved,
        type: 'database',
        weight: 6,
        line: lineNumber,
        context: `prisma ${match[1]}`
      });
    }
    
    return references;
  }

  /**
   * Build a map of imported symbol → module for a file
   */
  private buildImportSymbolMap(lines: string[]): Map<string, string> {
    const map = new Map<string, string>();
    const importWithBindings = /import\s+([^'";]+?)\s+from\s+['"`]([^'"`]+)['"`]/g;
    const importAllAs = /import\s+\*\s+as\s+(\w+)\s+from\s+['"`]([^'"`]+)['"`]/g;
    // const importOnlyModule = /import\s+['"`]([^'"`]+)['"`]/g; // side-effect only, no symbols
    const requireDefault = /const\s+(\w+)\s*=\s*require\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    const requireDestruct = /const\s*\{\s*([^}]+)\s*\}\s*=\s*require\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

    for (const raw of lines) {
      const line = raw.trim();
      let m: RegExpExecArray | null;

      while ((m = importAllAs.exec(line)) !== null) {
        const ns = m?.[1] ?? '';
        const mod = m?.[2] ?? '';
        if (ns && mod) map.set(ns, mod);
      }
      while ((m = importWithBindings.exec(line)) !== null) {
        const bindings = (m?.[1] ?? '').trim();
        const mod = m?.[2] ?? '';
        // default import
        const defaultMatch = bindings.match(/^(\w+)(?:\s*,)?/);
        if (defaultMatch?.[1] && mod) map.set(defaultMatch[1], mod);
        // named imports { a, b as c }
        const named = bindings.match(/\{([^}]+)\}/);
        if (named?.[1]) {
          const parts = named[1].split(',');
          for (const p of parts) {
            const seg = p.trim();
            if (!seg) continue;
            const asMatch = seg.match(/^(\w+)\s+as\s+(\w+)$/);
            if (asMatch?.[2] && mod) {
              map.set(asMatch[2], mod);
            } else {
              const simple = seg.match(/^(\w+)$/);
              if (simple?.[1] && mod) map.set(simple[1], mod);
            }
          }
        }
      }
      while ((m = requireDefault.exec(line)) !== null) {
        const sym = m?.[1] ?? '';
        const mod = m?.[2] ?? '';
        if (sym && mod) map.set(sym, mod);
      }
      while ((m = requireDestruct.exec(line)) !== null) {
        const raw = m?.[1] ?? '';
        const mod = m?.[2] ?? '';
        const syms = raw.split(',').map(s => s.trim().split(/\s+as\s+/).pop() ?? '').filter(Boolean);
        for (const s of syms) if (mod) map.set(s, mod);
      }
      // importOnlyModule: no symbols
      // intentionally ignored
    }
    return map;
  }
  
  /**
   * Extract JSX component usage (but avoid deep UI component details)
   */
  private extractComponentUsage(line: string, fromFile: string, lineNumber: number): CodeReference[] {
    const references: CodeReference[] = [];
    
    // Only track major/structural components, not UI details
    const componentRegex = /<(\w+(?:Page|Layout|Provider|Router|Guard|Wrapper|Container|Dashboard|Form|Modal|Dialog))/g;
    let match;
    while ((match = componentRegex.exec(line)) !== null) {
      references.push({
        from: fromFile,
        to: `component:${match[1]}`,
        type: 'component',
        weight: 2, // Lower weight for components
        line: lineNumber,
        context: 'JSX component'
      });
    }
    
    return references;
  }
  
  /**
   * Extract environment variable references (high weight)
   */
  private extractEnvVariables(line: string, fromFile: string, lineNumber: number): CodeReference[] {
    const references: CodeReference[] = [];
    
    const envRegex = /process\.env\.(\w+)/g;
    let match;
    while ((match = envRegex.exec(line)) !== null) {
      references.push({
        from: fromFile,
        to: `env:${match[1]}`,
        type: 'env_var',
        weight: 7, // High weight for env vars
        line: lineNumber,
        context: `Environment variable`
      });
    }
    
    return references;
  }
  
  /**
   * Extract configuration references
   */
  private extractConfigReferences(line: string, fromFile: string, lineNumber: number): CodeReference[] {
    const references: CodeReference[] = [];
    
    // Database URLs, API endpoints in config
    const configRegex = /(DATABASE_URL|API_URL|NEXTAUTH_URL|STRIPE_|CLERK_|OPENAI_)/g;
    let match;
    while ((match = configRegex.exec(line)) !== null) {
      references.push({
        from: fromFile,
        to: `config:${match[1]}`,
        type: 'config',
        weight: 5,
        line: lineNumber,
        context: 'Configuration'
      });
    }
    
    return references;
  }
  
  /**
   * Resolve module path to file path with better path resolution
   */
  private resolveModulePath(modulePath: string, fromFile: string, allFiles: AnalysisFile[]): string {
    // If this is a workspace package import, resolve to on-disk path
    if (!modulePath.startsWith('.') && !modulePath.startsWith('/') && !modulePath.startsWith('src/') && !modulePath.startsWith('@/')) {
      console.log(`[DEPENDENCY_TRACKER] Trying to resolve workspace package: ${modulePath}`);
      
      // Determine the npm package root and subpath
      const moduleRoot = modulePath.startsWith('@')
        ? modulePath.split('/').slice(0, 2).join('/') // @scope/pkg
        : modulePath.split('/')[0] ?? modulePath; // pkg
      const subpath = modulePath.length > moduleRoot.length ? modulePath.slice(moduleRoot.length + 1) : '';
      
      console.log(`[DEPENDENCY_TRACKER] Module root: ${moduleRoot}, subpath: "${subpath}"`);
      console.log(`[DEPENDENCY_TRACKER] Available workspace packages:`, Object.keys(this.workspacePackages));
      
      // Try to match against workspace packages
      for (const [key, meta] of Object.entries(this.workspacePackages)) {
        const dirLeaf = meta.dir.split('/').pop() ?? meta.dir;
        
        // Try multiple matching strategies:
        // 1. Direct name match (if package.json was parsed correctly)
        // 2. Unscoped name match (for @scope/pkg → pkg)
        // 3. Directory leaf match (fallback)
        const candidateMatches = [
          meta.name === moduleRoot,                                           // @dub/prisma === @dub/prisma
          meta.name?.startsWith('@') && meta.name.split('/').pop() === moduleRoot.split('/').pop(), // @dub/prisma.split('/').pop() === prisma
          dirLeaf === moduleRoot,                                             // prisma === @dub/prisma (unlikely)
          dirLeaf === moduleRoot.split('/').pop()                             // prisma === prisma
        ];
        
        const isMatch = candidateMatches.some(Boolean);
        console.log(`[DEPENDENCY_TRACKER] Checking package "${key}" (name: ${meta.name}, dir: ${meta.dir}, dirLeaf: ${dirLeaf}) → match: ${isMatch}`);
        
        if (isMatch) {
          const baseDir = meta.dir;
          console.log(`[DEPENDENCY_TRACKER] Matched! Base dir: ${baseDir}`);
          
          // Build resolution candidates
          const candidates: string[] = [];
          
          if (subpath) {
            // For subpath imports like @dub/prisma/client
            candidates.push(`${baseDir}/src/${subpath}`);
            candidates.push(`${baseDir}/${subpath}`);
            candidates.push(`${baseDir}/lib/${subpath}`);
          } else {
            // For root imports like @dub/prisma
            // Respect package.json fields if present
            if (meta.module) candidates.push(`${baseDir}/${meta.module}`.replace(/^\.\//, ''));
            if (meta.main) candidates.push(`${baseDir}/${meta.main}`.replace(/^\.\//, ''));
            if (meta.types) candidates.push(`${baseDir}/${meta.types}`.replace(/^\.\//, ''));
            // Common index locations
            candidates.push(`${baseDir}/src/index`);
            candidates.push(`${baseDir}/index`);
          }
          
          console.log(`[DEPENDENCY_TRACKER] Trying candidates:`, candidates);
          
          for (const candidate of candidates) {
            const resolved = this.tryResolveWithExtensions(candidate, allFiles, { returnNullIfMissing: true });
            if (resolved) {
              console.log(`[DEPENDENCY_TRACKER] ✅ Resolved workspace package: ${modulePath} → ${resolved}`);
              return resolved;
            }
          }
          
          console.log(`[DEPENDENCY_TRACKER] ❌ No candidates resolved for workspace package: ${modulePath}`);
          // If matched but couldn't resolve, return as external
          return modulePath;
        }
      }
      
      console.log(`[DEPENDENCY_TRACKER] Not a known workspace package: ${modulePath}`);
      // Not a known workspace package; treat as external
      return modulePath;
    }
    
    // Handle relative imports
    if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
      const fromDir = fromFile.split('/').slice(0, -1).join('/');
      let resolved = modulePath;
      
      if (modulePath.startsWith('./')) {
        resolved = `${fromDir}/${modulePath.slice(2)}`;
      } else {
        // Handle ../ paths 
        const upLevels = modulePath.match(/\.\.\//g)?.length ?? 0;
        const pathParts = fromDir.split('/');
        const targetParts = pathParts.slice(0, pathParts.length - upLevels);
        const remainingPath = modulePath.replace(/\.\.\//g, '');
        resolved = `${targetParts.join('/')}/${remainingPath}`;
      }
      
      // Clean up path
      resolved = this.normalizePath(resolved);
      
      console.log(`[DEPENDENCY_TRACKER] Resolving relative: ${modulePath} from ${fromFile} → ${resolved}`);
      
      // Add extension if missing - try to find the right one
      if (!resolved.match(/\.(js|ts|jsx|tsx)$/)) {
        return this.tryResolveWithExtensions(resolved, allFiles) ?? resolved;
      }
      return resolved;
    }
    
    // Handle @/ only as a fallback if tsconfig alias resolution doesn't match
    
    // Handle src/ imports
    if (modulePath.startsWith('src/')) {
      const normalized = this.normalizePath(modulePath);
      if (!normalized.match(/\.(js|ts|jsx|tsx)$/)) {
        return this.tryResolveWithExtensions(normalized, allFiles) ?? normalized;
      }
      return normalized;
    }

    // Try tsconfig path aliases mapping (covers @/* and custom aliases)
    const aliasResolved = this.resolveWithTsconfigAliases(modulePath, fromFile, allFiles);
    if (aliasResolved) return aliasResolved;

    // Fallback: treat @/ alias as src/ when no tsconfig matched
    if (modulePath.startsWith('@/')) {
      // handle both '@/x' and '@x' (some configs map '@' without slash)
      const cleanPath = modulePath.startsWith('@/')
        ? modulePath.replace('@/', 'src/')
        : modulePath.replace('@', 'src/');
      console.log(`[DEPENDENCY_TRACKER] Resolving @/ alias fallback: ${modulePath} → ${cleanPath}`);
      if (!cleanPath.match(/\.(js|ts|jsx|tsx)$/)) {
        return this.tryResolveWithExtensions(cleanPath, allFiles) ?? cleanPath;
      }
      return cleanPath;
    }
    
    return modulePath;
  }

  private resolveWithTsconfigAliases(modulePath: string, fromFile: string, allFiles: AnalysisFile[]): string | null {
    if (!this.tsconfigAliases.length) return null;
    const fromDir = fromFile.split('/').slice(0, -1).join('/');
    for (const cfg of this.tsconfigAliases) {
      // Only consider aliases that apply within the same workspace subtree
      if (fromDir && !fromDir.startsWith(cfg.dir)) continue;
      const baseDir = cfg.baseUrl ? `${cfg.dir}/${cfg.baseUrl}`.replace(/\/+/g, '/') : cfg.dir;
      for (const [pattern, targets] of Object.entries(cfg.paths)) {
        // Convert tsconfig pattern to regex
        const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('^' + escaped.replace('/*', '/(?<sub>.*)') + '$');
        const m = modulePath.match(regex);
        if (m) {
          const sub = m.groups?.sub ?? '';
          for (const t of targets) {
            const variants = [
              t.replace('/*', sub).replace('*', sub),
              t.replace('/*', `/${sub}`).replace('*', `/${sub}`),
            ];
            for (const variant of variants) {
              const cleaned = variant.replace(/^\.\//, '');
              const candidate = this.normalizePath(`${baseDir}/${cleaned}`);
              const resolved = this.tryResolveWithExtensions(candidate, allFiles, { returnNullIfMissing: true });
              if (resolved) return resolved;
            }
          }
        }
      }
      // If no paths matched, but baseUrl exists, try baseUrl + modulePath
      if (cfg.baseUrl && !modulePath.startsWith('.') && !modulePath.startsWith('/') && !modulePath.startsWith('http')) {
        const candidate = this.normalizePath(`${baseDir}/${modulePath}`);
        const resolved = this.tryResolveWithExtensions(candidate, allFiles, { returnNullIfMissing: true });
        if (resolved) return resolved;
      }
    }
    return null;
  }

  /**
   * Try to resolve a path with different extensions
   */
  private tryResolveWithExtensions(basePath: string, files: AnalysisFile[], options?: { returnNullIfMissing?: boolean }): string | null {
    const normalized = this.normalizePath(basePath);
    const actualPath = this.findActualFilePath(normalized, files);
    if (actualPath) {
      console.log(`[DEPENDENCY_TRACKER] Resolved with extension: ${normalized} → ${actualPath}`);
      return actualPath;
    }
    if (options?.returnNullIfMissing) {
      return null;
    }
    // Preserve legacy behavior where a best-guess extension is appended when a single candidate is expected
    return `${normalized}.ts`;
  }
  
  /**
   * Check if file exists and return the actual path if found
   */
  private findActualFilePath(path: string, files: AnalysisFile[]): string | null {
    const normalized = this.normalizePath(path);
    // Direct match first
    if (files.some(f => f.path === normalized)) {
      return normalized;
    }
    
    // If path has no extension, try with common extensions
    if (!normalized.match(/\.(js|ts|jsx|tsx)$/)) {
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
      for (const ext of extensions) {
        const pathWithExt = `${normalized}${ext}`;
        if (files.some(f => f.path === pathWithExt)) {
          console.log(`[DEPENDENCY_TRACKER] Found file with extension: ${normalized} → ${pathWithExt}`);
          return pathWithExt;
        }
      }
    }
    
    // Try removing extension and matching base name
    const basePath = normalized.replace(/\.(js|ts|jsx|tsx)$/, '');
    const matchingFiles = files.filter(f => {
      const fileBase = f.path.replace(/\.(js|ts|jsx|tsx)$/, '');
      return fileBase === basePath;
    });
    
    if (matchingFiles.length > 0) {
      console.log(`[DEPENDENCY_TRACKER] Found file with different extension: ${path} → ${matchingFiles[0]!.path}`);
      return matchingFiles[0]!.path;
    }
    
    return null;
  }

  /**
   * Normalize a file path to avoid issues like "/./" and duplicate slashes
   */
  private normalizePath(p: string): string {
    return p
      .replace(/\\\\/g, '/')
      .replace(/\/\._/g, '/_')
      // Remove only explicit '/./' segments; avoid collapsing '/.' that precedes a path and eating the slash
      .replace(/\/\.\//g, '/')
      .replace(/^\.\//, '')
      .replace(/\/+/g, '/');
  }
  
  /**
   * Check if file exists in our file list with flexible extension matching
   */
  private fileExists(path: string, files: AnalysisFile[]): boolean {
    return this.findActualFilePath(path, files) !== null;
  }
  
  /**
   * Check if reference is a valid external reference (API endpoints, etc.)
   */
  private isValidExternalReference(path: string): boolean {
    return path.startsWith('/api/') || 
           path.startsWith('http') || 
           path.startsWith('env:') || 
           path.startsWith('config:') ||
           path.startsWith('component:');
  }
  
  /**
   * Build edges from references
   */
  private buildEdges(references: CodeReference[], _nodes: Map<string, GraphNode>): GraphEdge[] {
    const edgeMap = new Map<string, GraphEdge>();
    
    for (const ref of references) {
      const edgeKey = `${ref.from}→${ref.to}`;
      const existing = edgeMap.get(edgeKey);
      
      if (existing) {
        existing.weight = Math.max(existing.weight, ref.weight);
        if (!existing.types.includes(ref.type)) {
          existing.types.push(ref.type);
        }
      } else {
        edgeMap.set(edgeKey, {
          from: ref.from,
          to: ref.to,
          weight: ref.weight,
          types: [ref.type]
        });
      }
    }
    
    return Array.from(edgeMap.values());
  }
  
  /**
   * Calculate in-degrees for all nodes
   */
  private calculateInDegrees(nodes: Map<string, GraphNode>, references: CodeReference[]): void {
    for (const ref of references) {
      const targetNode = nodes.get(ref.to);
      if (targetNode) {
        targetNode.inDegree++;
      }
    }
  }
  
  /**
   * Calculate importance scores based on centrality
   */
  private calculateImportanceScores(nodes: Map<string, GraphNode>): void {
    for (const node of nodes.values()) {
      // Combine in-degree, out-degree, and level for importance
      const centralityScore = (node.inDegree * 2) + node.outDegree;
      const levelPenalty = node.level * 0.5; // Deeper levels are less important
      node.importance = Math.max(1, centralityScore - levelPenalty);
    }
  }
  
  /**
   * Calculate graph statistics
   */
  private calculateStatistics(
    nodes: Map<string, GraphNode>, 
    edges: GraphEdge[], 
    levels: GraphLevel[]
  ): GraphStatistics {
    const nodeArray = Array.from(nodes.values());
    const hubNodes = nodeArray
      .filter(n => n.inDegree >= 3 || n.outDegree >= 5)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10)
      .map(n => n.path);
    
    return {
      totalNodes: nodeArray.length,
      totalEdges: edges.length,
      maxDepth: Math.max(...levels.map(l => l.level)),
      entryPoints: nodeArray.filter(n => n.type === 'entry_point').length,
      hubNodes
    };
  }
  
  /**
   * Check if a file path indicates a test file - CRITICAL for architectural analysis
   */
  private isTestFile(path: string): boolean {
    const testPatterns = [
      /\.test\.(js|ts|jsx|tsx)$/i,
      /\.spec\.(js|ts|jsx|tsx)$/i,
      /__tests__\//i,
      /__test__\//i,
      /\/tests?\//i,
      /test-.*\.(js|ts|jsx|tsx)$/i,
      /.*\.test-.*\.(js|ts|jsx|tsx)$/i,
    ];
    
    return testPatterns.some(pattern => pattern.test(path));
  }

  /**
   * Convert importance string to numeric score
   */
  private getImportanceScore(importance: string): number {
    const scores = { critical: 10, high: 7, medium: 4, low: 2 };
    return scores[importance as keyof typeof scores] || 1;
  }
}