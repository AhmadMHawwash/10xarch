/**
 * Entry Point Analyzer
 * 
 * Identifies application entry points in JS/TS repositories using common patterns,
 * package.json analysis, and dependency graph centrality.
 */

import type { AnalysisFile } from './github-service';

export interface EntryPoint {
  path: string;
  type: EntryPointType;
  importance: 'critical' | 'high' | 'medium' | 'low';
  source: string; // How it was identified
  confidence: number;
  packageContext?: string; // For monorepos: package folder (e.g., packages/prisma)
}

export type EntryPointType = 
  | 'main'           // Main application entry (package.json main, index.js)
  | 'server'         // Server/API entry point
  | 'frontend'       // Frontend application entry
  | 'api'           // API route definition
  | 'config'        // Configuration entry
  | 'script'        // Package.json script entry
  | 'hub';          // High-centrality file

export interface EntryPointAnalysis {
  entryPoints: EntryPoint[];
  packageJsonMain?: string;
  scripts: Record<string, string>;
  detectedFrameworks: string[];
}

export class EntryPointAnalyzer {
  
  /**
   * Analyze files to identify entry points
   */
  analyzeEntryPoints(files: AnalysisFile[]): EntryPointAnalysis {
    console.log(`[ENTRY_POINT_ANALYSIS] Analyzing ${files.length} files for entry points`);
    
    const entryPoints: EntryPoint[] = [];
    let packageJsonMain: string | undefined;
    let scripts: Record<string, string> = {};
    const detectedFrameworks: string[] = [];
    
    // First, analyze ALL package.json files for entry points and scripts (monorepo-friendly)
    const packageJsonFiles = files.filter(f => f.path.endsWith('package.json'));
    for (const pkgFile of packageJsonFiles) {
      const analysis = this.analyzePackageJson(pkgFile.content);
      // Only set packageJsonMain if this is the root package.json to avoid noise
      if (pkgFile.path === 'package.json') {
        packageJsonMain = analysis.main ?? packageJsonMain;
        scripts = { ...scripts, ...analysis.scripts };
      }
      detectedFrameworks.push(...analysis.frameworks);
      // Qualify script/source with folder context for non-root packages
      const baseDir = pkgFile.path.includes('/') ? pkgFile.path.slice(0, pkgFile.path.lastIndexOf('/')) : '';
      for (const ep of analysis.entryPoints) {
        const path = baseDir && !ep.path.startsWith(baseDir) && !ep.path.startsWith('src/') && !ep.path.startsWith('apps/')
          ? `${baseDir}/${ep.path}`
          : ep.path;
        entryPoints.push({ ...ep, path });
      }
    }
    
    // Find entry points using common patterns
    entryPoints.push(...this.findCommonEntryPoints(files));
    
    // Find API entry points
    entryPoints.push(...this.findApiEntryPoints(files));
    
    // Monorepo-aware entry points with package context
    entryPoints.push(...this.findMonorepoEntryPoints(files));

    // Find configuration entry points
    entryPoints.push(...this.findConfigEntryPoints(files));
    
    // Deduplicate and sort by importance
    const uniqueEntryPoints = this.deduplicateEntryPoints(entryPoints);
    const sortedEntryPoints = uniqueEntryPoints.sort((a, b) => {
      const importanceOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return importanceOrder[b.importance] - importanceOrder[a.importance] || b.confidence - a.confidence;
    });
    
    console.log(`[ENTRY_POINT_ANALYSIS] Found ${sortedEntryPoints.length} entry points:`);
    sortedEntryPoints.forEach((entry, index) => {
      console.log(`[ENTRY_POINT_ANALYSIS] ${index + 1}. ${entry.path} (${entry.type}, ${entry.importance}, confidence: ${entry.confidence}%) - ${entry.source}`);
    });
    
    return {
      entryPoints: sortedEntryPoints,
      packageJsonMain,
      scripts,
      detectedFrameworks
    };
  }

  /**
   * Detect package-contextual entry points in monorepos
   */
  private findMonorepoEntryPoints(files: AnalysisFile[]): EntryPoint[] {
    const entryPoints: EntryPoint[] = [];
    const packageJsonFiles = files.filter(f => f.path.endsWith('package.json'));
    for (const pkg of packageJsonFiles) {
      const baseDir = pkg.path.replace('/package.json', '');
      if (!baseDir) continue;
      const inPkg = (p: string) => p.startsWith(`${baseDir}/`);

      const apiFiles = files.filter(f => inPkg(f.path) && (f.path.includes('/api/') || /\broute\.(ts|js|tsx|jsx)\b/i.test(f.path)));
      const serviceFiles = files.filter(f => inPkg(f.path) && /\/(service|client|provider|adapter)\.(ts|js)$/i.test(f.path));
      const dbFiles = files.filter(f => inPkg(f.path) && (/\.prisma$/i.test(f.path) || /schema\.|migrate\./i.test(f.path)));

      const toEP = (p: string, type: EntryPointType, source: string): EntryPoint => ({
        path: p,
        type,
        importance: 'high',
        source,
        confidence: 85,
        packageContext: baseDir,
      });

      entryPoints.push(
        ...apiFiles.map(f => toEP(f.path, 'api', `Monorepo API in ${baseDir}`)),
        ...serviceFiles.map(f => toEP(f.path, 'server', `Monorepo service in ${baseDir}`)),
        ...dbFiles.map(f => toEP(f.path, 'config', `Monorepo schema in ${baseDir}`)),
      );
    }
    return entryPoints;
  }
  
  /**
   * Analyze package.json for entry points and framework detection
   */
  private analyzePackageJson(content: string): {
    main?: string;
    scripts: Record<string, string>;
    frameworks: string[];
    entryPoints: EntryPoint[];
  } {
    try {
      type PackageJson = {
        main?: string;
        scripts?: Record<string, string>;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };

      const parsed = JSON.parse(content) as unknown;
      const pkg: PackageJson = typeof parsed === 'object' && parsed !== null ? (parsed as PackageJson) : {};
      const entryPoints: EntryPoint[] = [];
      const frameworks: string[] = [];

      // Detect frameworks from dependencies safely
      const deps: Record<string, string> = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
      if (deps.next) frameworks.push('Next.js');
      if (deps.react) frameworks.push('React');
      if (deps.vue) frameworks.push('Vue.js');
      if (deps.express) frameworks.push('Express');
      if (deps['@trpc/server']) frameworks.push('tRPC');
      if (deps.fastify) frameworks.push('Fastify');
      if (deps.nestjs) frameworks.push('NestJS');

      // Main entry point from package.json
      if (typeof pkg.main === 'string' && pkg.main.length > 0) {
        entryPoints.push({
          path: pkg.main,
          type: 'main',
          importance: 'critical',
          source: 'package.json main field',
          confidence: 100
        });
      }

      // Analyze scripts for entry points
      const scripts: Record<string, string> = pkg.scripts ?? {};
      for (const [scriptName, scriptValueUnknown] of Object.entries(scripts)) {
        const scriptValue = typeof scriptValueUnknown === 'string' ? scriptValueUnknown : '';
        if (scriptValue) {
          const scriptEntries = this.extractEntryPointsFromScript(scriptName, scriptValue);
          entryPoints.push(...scriptEntries);
        }
      }

      return {
        main: typeof pkg.main === 'string' ? pkg.main : undefined,
        scripts,
        frameworks,
        entryPoints
      };
    } catch (error) {
      console.warn('[ENTRY_POINT_ANALYSIS] Failed to parse package.json:', error);
      return { scripts: {}, frameworks: [], entryPoints: [] };
    }
  }
  
  /**
   * Extract entry points from package.json scripts - EXCLUDES TEST SCRIPTS
   */
  private extractEntryPointsFromScript(scriptName: string, scriptValue: string): EntryPoint[] {
    const entryPoints: EntryPoint[] = [];
    
    // Skip test-related scripts completely
    const testScriptNames = ['test', 'test:unit', 'test:e2e', 'test:watch', 'jest', 'vitest', 'cypress'];
    if (testScriptNames.includes(scriptName) || scriptName.includes('test')) {
      return entryPoints; // Return empty for test scripts
    }
    
    // Common script patterns that indicate APPLICATION entry points
    const scriptPatterns = [
      { pattern: /node\s+([^\s]+)/, type: 'server' as const },
      { pattern: /ts-node\s+([^\s]+)/, type: 'server' as const },
      { pattern: /next\s+start/, type: 'frontend' as const },
      { pattern: /next\s+dev/, type: 'frontend' as const },
      { pattern: /nodemon\s+([^\s]+)/, type: 'server' as const },
    ];
    
    for (const { pattern, type } of scriptPatterns) {
      const match = scriptValue.match(pattern);
      if (match) {
        const filePath = match[1] ?? scriptValue;
        
        // Additional check: skip if the resolved path looks like a test file
        if (this.isTestFile(filePath)) {
          continue;
        }
        
        const importance = scriptName === 'start' ? 'critical' : 
                         scriptName === 'dev' ? 'high' : 'medium';
        
        entryPoints.push({
          path: filePath,
          type,
          importance,
          source: `package.json script: ${scriptName}`,
          confidence: 90
        });
      }
    }
    
    return entryPoints;
  }
  
  /**
   * Find entry points using common file name patterns
   */
  private findCommonEntryPoints(files: AnalysisFile[]): EntryPoint[] {
    const entryPoints: EntryPoint[] = [];
    
    // Common entry point patterns (broadened to support monorepos like apps/*)
    const patterns = [
      // Main application entries
      { pattern: /(^|.*\/)\b(index|main|app)\.(js|ts)$/i, type: 'main' as const, importance: 'critical' as const, confidence: 95 },
      { pattern: /(^|.*\/)src\/(index|main|app)\.(js|ts)$/i, type: 'main' as const, importance: 'critical' as const, confidence: 95 },
      
      // Server entries
      { pattern: /(^|.*\/)\b(server|srv)\.(js|ts)$/i, type: 'server' as const, importance: 'high' as const, confidence: 90 },
      { pattern: /(^|.*\/)src\/(server|srv)\.(js|ts)$/i, type: 'server' as const, importance: 'high' as const, confidence: 90 },
      
      // Frontend entries (framework agnostic)
      { pattern: /(^|.*\/)src\/app\/(layout|page)\.(tsx|jsx)$/i, type: 'frontend' as const, importance: 'high' as const, confidence: 85 },
      { pattern: /(^|.*\/)app\/(layout|page)\.(tsx|jsx)$/i, type: 'frontend' as const, importance: 'high' as const, confidence: 85 },
      { pattern: /(^|.*\/)(pages\/_app|src\/pages\/_app)\.(tsx|jsx)$/i, type: 'frontend' as const, importance: 'high' as const, confidence: 85 },
      { pattern: /(^|.*\/)src\/(App|app)\.(tsx|jsx)$/i, type: 'frontend' as const, importance: 'high' as const, confidence: 80 },
      
      // Framework-specific server entries
      { pattern: /(^|.*\/)src\/main\.(js|ts)$/i, type: 'server' as const, importance: 'high' as const, confidence: 85 }, // NestJS, Vite
      { pattern: /(^|.*\/)(src\/)?app\.(js|ts)$/i, type: 'server' as const, importance: 'high' as const, confidence: 80 }, // Express
      { pattern: /(^|.*\/)bin\/www$/i, type: 'server' as const, importance: 'high' as const, confidence: 80 }, // Express generator
      
      // API entries
      { pattern: /(^|.*\/)(src\/)?api\/index\.(js|ts)$/i, type: 'api' as const, importance: 'high' as const, confidence: 85 },
      { pattern: /(^|.*\/)src\/app\/api\/.*\/route\.(js|ts)$/i, type: 'api' as const, importance: 'high' as const, confidence: 85 },
      { pattern: /(^|.*\/)app\/api\/.*\/route\.(js|ts)$/i, type: 'api' as const, importance: 'high' as const, confidence: 85 },
      { pattern: /(^|.*\/)(src\/)?server\/api\/(root|index)\.(js|ts)$/i, type: 'api' as const, importance: 'high' as const, confidence: 85 },
      { pattern: /(^|.*\/)(src\/)?routes\/index\.(js|ts)$/i, type: 'api' as const, importance: 'high' as const, confidence: 80 },
    ];
    
    for (const file of files) {
      // Skip test files completely
      if (this.isTestFile(file.path)) {
        continue;
      }
      
      for (const { pattern, type, importance, confidence } of patterns) {
        if (pattern.test(file.path)) {
          entryPoints.push({
            path: file.path,
            type,
            importance,
            source: `Common pattern: ${pattern.source}`,
            confidence
          });
          break; // Only match first pattern to avoid duplicates
        }
      }
    }
    
    return entryPoints;
  }
  
  /**
   * Find API-specific entry points
   */
  private findApiEntryPoints(files: AnalysisFile[]): EntryPoint[] {
    const entryPoints: EntryPoint[] = [];
    
    // API route patterns (framework-agnostic) — broadened for monorepos
    const apiPatterns = [
      // Next.js specific patterns
      /(^|.*\/)src\/app\/api\/.*\/route\.(js|ts)$/i,        // Next.js App Router API routes
      /(^|.*\/)(src\/)?pages\/api\/.*\.(js|ts)$/i,          // Next.js Pages Router API
      
      // Express/Fastify/Generic patterns  
      /(^|.*\/)(src\/)?routes\/.*\.(js|ts)$/i,              // Express/Fastify routes
      /(^|.*\/)(src\/)?api\/.*\.(js|ts)$/i,                 // Generic API files
      /(^|.*\/)(src\/)?endpoints\/.*\.(js|ts)$/i,           // Alternative API structure
      
      // tRPC patterns
      /(^|.*\/)(src\/)?server\/api\/routers\/.*\.(js|ts)$/i, // tRPC routers
      
      // NestJS patterns
      /(^|.*\/)(src\/)?.*\.controller\.(js|ts)$/i,          // NestJS controllers
      /(^|.*\/)(src\/)?controllers\/.*\.(js|ts)$/i,         // MVC controllers
      
      // Generic service patterns
      /(^|.*\/)(src\/)?services\/.*\.(js|ts)$/i,            // Service layer files
      /(^|.*\/)(src\/)?handlers\/.*\.(js|ts)$/i,            // Handler files
    ];
    
    for (const file of files) {
      // Skip test files completely
      if (this.isTestFile(file.path)) {
        continue;
      }
      
      for (const pattern of apiPatterns) {
        if (pattern.test(file.path)) {
          entryPoints.push({
            path: file.path,
            type: 'api',
            importance: 'medium',
            source: 'API route pattern',
            confidence: 75
          });
          break;
        }
      }
    }
    
    return entryPoints;
  }
  
  /**
   * Find configuration entry points
   */
  private findConfigEntryPoints(files: AnalysisFile[]): EntryPoint[] {
    const entryPoints: EntryPoint[] = [];
    
    // Configuration patterns that often reference other files
    const configPatterns = [
      { pattern: /^(next|nuxt|vite|webpack)\.config\.(js|ts)$/i, importance: 'medium' as const, confidence: 80 },
      { pattern: /^(src\/)?server\/db\/(index|config)\.(js|ts)$/i, importance: 'high' as const, confidence: 85 },
      { pattern: /^(src\/)?lib\/(db|database)\.(js|ts)$/i, importance: 'high' as const, confidence: 80 },
      { pattern: /^(src\/)?config\/(database|db)\.(js|ts)$/i, importance: 'high' as const, confidence: 80 },
    ];
    
    for (const file of files) {
      // Skip test files completely
      if (this.isTestFile(file.path)) {
        continue;
      }
      
      for (const { pattern, importance, confidence } of configPatterns) {
        if (pattern.test(file.path)) {
          entryPoints.push({
            path: file.path,
            type: 'config',
            importance,
            source: 'Configuration pattern',
            confidence
          });
          break;
        }
      }
    }
    
    return entryPoints;
  }
  
  /**
   * Remove duplicate entry points and merge similar ones
   */
  private deduplicateEntryPoints(entryPoints: EntryPoint[]): EntryPoint[] {
    const pathMap = new Map<string, EntryPoint>();
    
    for (const entry of entryPoints) {
      const existing = pathMap.get(entry.path);
      if (existing) {
        // Keep the one with higher confidence or importance
        if (entry.confidence > existing.confidence || 
            (entry.confidence === existing.confidence && 
             this.getImportanceScore(entry.importance) > this.getImportanceScore(existing.importance))) {
          pathMap.set(entry.path, entry);
        }
      } else {
        pathMap.set(entry.path, entry);
      }
    }
    
    return Array.from(pathMap.values());
  }
  
  /**
   * Check if a file path indicates a test file
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
   * Convert importance to numeric score for comparison
   */
  private getImportanceScore(importance: string): number {
    const scores = { critical: 4, high: 3, medium: 2, low: 1 };
    return scores[importance as keyof typeof scores] || 0;
  }
}