/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
// Simple, focused tree-sitter implementation for architectural analysis
// Server-side only

/**
 * Simple file analysis result
 */
export interface FileAnalysis {
  filePath: string;
  imports: string[];
  exports: string[];
  apiEndpoints: Array<{
    method: string;
    path: string;
    framework: string;
  }>;
  frameworks: string[];
  hasDatabase: boolean;
  environmentVars: string[];
  errors: string[];
}

/**
 * Simple tree-sitter analyzer focused on architectural insights
 */
export class SimpleASTAnalyzer {
  private parserJS: any;
  private parserTS: any;
  private parserTSX: any;
  private jsLanguage: any;
  private tsLanguage: any;
  private tsxLanguage: any;
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      throw new Error('SimpleASTAnalyzer can only be used on the server side');
    }
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize tree-sitter properly
      const Parser = (await import('tree-sitter')).default;
      const JavaScript = (await import('tree-sitter-javascript')).default;
      const tsModule = await import('tree-sitter-typescript');
      const TypeScript = (tsModule as any).typescript;
      const TSX = (tsModule as any).tsx;

      // Create dedicated parsers per language to avoid concurrency issues
      this.parserJS = new Parser();
      this.parserTS = new Parser();
      this.parserTSX = new Parser();

      this.jsLanguage = JavaScript;
      this.tsLanguage = TypeScript;
      this.tsxLanguage = TSX;

      this.parserJS.setLanguage(this.jsLanguage);
      this.parserTS.setLanguage(this.tsLanguage);
      this.parserTSX.setLanguage(this.tsxLanguage);
      this.initialized = true;

      console.log('[SIMPLE_AST] Initialized tree-sitter successfully');
    } catch (error) {
      console.error('[SIMPLE_AST] Failed to initialize:', error);
      throw error;
    }
  }

  async analyzeFile(filePath: string, content: string): Promise<FileAnalysis> {
    await this.initialize();

    const analysis: FileAnalysis = {
      filePath,
      imports: [],
      exports: [],
      apiEndpoints: [],
      frameworks: [],
      hasDatabase: false,
      environmentVars: [],
      errors: []
    };

    try {
      // Choose parser based on file extension
      const isTSX = filePath.endsWith('.tsx');
      const isTS = filePath.endsWith('.ts') && !filePath.endsWith('.d.ts');
      const isJSX = filePath.endsWith('.jsx');

      const parser = isTSX ? this.parserTSX : (isTS ? this.parserTS : this.parserJS);
      const langLabel = isTSX ? 'TSX' : (isTS ? 'TypeScript' : (isJSX ? 'JavaScript (JSX)' : 'JavaScript'));

      console.log(`[SIMPLE_AST] Parsing ${filePath} as ${langLabel}`);

      // Parse the code
      const tree = parser.parse(content);
      const rootNode = tree.rootNode;

      // Check for parse errors
      if (rootNode.hasError) {
        console.warn(`[SIMPLE_AST] Parse errors detected in ${filePath}, tree has errors`);
        analysis.errors.push('Parse errors detected, using regex fallback');
        this.regexFallback(content, analysis);
        return analysis;
      }

      // Simple analysis using tree-sitter
      this.extractImports(rootNode, content, analysis);
      this.extractAPIEndpoints(rootNode, content, analysis);
      this.extractFrameworks(content, analysis);
      this.extractEnvironmentVars(content, analysis);
      this.checkDatabase(content, analysis);

      console.log(`[SIMPLE_AST] ✅ ${filePath}: ${analysis.imports.length} imports, ${analysis.apiEndpoints.length} endpoints`);
    } catch (error) {
      console.warn(`[SIMPLE_AST] Error parsing ${filePath}, using regex fallback:`, error);
      analysis.errors.push(`Parse failed: ${error}`);
      this.regexFallback(content, analysis);
    }

    return analysis;
  }

  private extractImports(node: any, content: string, analysis: FileAnalysis) {
    // Simple import extraction using tree-sitter queries
    const cursor = node.walk();

    const traverse = (cursor: any) => {
      const nodeType = cursor.currentNode.type;
      
      if (nodeType === 'import_statement') {
        const nodeText = cursor.currentNode.text;
        const importMatch = nodeText.match(/from\s+['"`]([^'"`]+)['"`]/) as RegExpMatchArray | null;
        if (importMatch && typeof importMatch[1] === 'string') {
          const moduleName: string = importMatch[1];
          analysis.imports.push(moduleName);
        }
      } else if (nodeType === 'call_expression') {
        const nodeText = cursor.currentNode.text;
        if (nodeText.startsWith('require(')) {
          const requireMatch = nodeText.match(/require\(['"`]([^'"`]+)['"`]\)/) as RegExpMatchArray | null;
          if (requireMatch && typeof requireMatch[1] === 'string') {
            const moduleName: string = requireMatch[1];
            analysis.imports.push(moduleName);
          }
        }
      }

      // Traverse children
      if (cursor.gotoFirstChild()) {
        do {
          traverse(cursor);
        } while (cursor.gotoNextSibling());
        cursor.gotoParent();
      }
    };

    traverse(cursor);
  }

  private extractAPIEndpoints(_node: any, content: string, analysis: FileAnalysis) {
    // Look for Next.js/Express/tRPC API patterns
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    // Next.js App Router: src/app/api/**/route.ts
    const nextAppMatch = analysis.filePath.match(/^(?:.*\/)?(?:src\/)?app\/api\/(.+)\/route\.(?:ts|js)$/);
    if (nextAppMatch) {
      const routePath = `/api/${nextAppMatch[1]}`;
      for (const method of httpMethods) {
        const hasFn = new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\b`).test(content);
        const hasConst = new RegExp(`export\\s+const\\s+${method}\\b`).test(content);
        if (hasFn || hasConst) {
          analysis.apiEndpoints.push({ method, path: routePath, framework: 'nextjs' });
        }
      }
    }

    // Next.js Pages API: src/pages/api/**.{ts,js}
    const nextPagesMatch = analysis.filePath.match(/^(?:.*\/)?(?:src\/)?pages\/api\/(.+)\.(?:ts|js)$/);
    if (nextPagesMatch) {
      const routePath = `/api/${nextPagesMatch[1]}`;
      for (const method of httpMethods) {
        // Pages API typically uses default handler; still detect explicit handlers if present
        const hasFn = new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\b`).test(content);
        const hasConst = new RegExp(`export\\s+const\\s+${method}\\b`).test(content);
        if (hasFn || hasConst) {
          analysis.apiEndpoints.push({ method, path: routePath, framework: 'nextjs' });
        }
      }
      // Fallback: treat default export as generic handler (method unknown)
      if (/export\s+default\s+/.test(content) && !httpMethods.some(m => new RegExp(`export\\s+(?:async\\s+)?function\\s+${m}\\b|export\\s+const\\s+${m}\\b`).test(content))) {
        analysis.apiEndpoints.push({ method: 'GET', path: routePath, framework: 'nextjs' });
      }
    }

    // Express/Fastify routes
    const expressRoutes = content.match(/(app|router)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi);
    if (expressRoutes) {
      for (const route of expressRoutes) {
        const match = route.match(/(app|router)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/i);
        if (match) {
          analysis.apiEndpoints.push({
            method: match[2]!.toUpperCase(),
            path: match[3]!,
            framework: 'express'
          });
        }
      }
    }

    // tRPC procedures: src/server/api/routers/*.ts
    const trpcFileMatch = analysis.filePath.match(/src\/server\/api\/routers\/(.+)\.ts$/);
    if (trpcFileMatch) {
      const routerName = trpcFileMatch[1]!;
      const procRegex = /(\w+)\s*:\s*(?:publicProcedure|protectedProcedure)[\s\S]*?\.(query|mutation)/g;
      let m: RegExpExecArray | null;
      while ((m = procRegex.exec(content)) !== null) {
        const procName = m[1]!;
        const kind = m[2]!.toLowerCase();
        analysis.apiEndpoints.push({
          method: kind === 'mutation' ? 'POST' : 'GET',
          path: `/trpc/${routerName}.${procName}`,
          framework: 'trpc'
        });
      }
    }
  }

  private extractFrameworks(content: string, analysis: FileAnalysis) {
    const frameworks = [
      { name: 'react', patterns: ['useState', 'useEffect', 'React.'] },
      { name: 'next.js', patterns: ['next/', 'getServerSideProps', 'getStaticProps'] },
      { name: 'express', patterns: ['express()', 'app.get', 'app.post'] },
      { name: 'fastify', patterns: ['fastify()', 'fastify.get', 'fastify.post'] },
      { name: 'nestjs', patterns: ['@Controller', '@Injectable', '@Module'] },
      { name: 'trpc', patterns: ['createTRPCRouter', 'publicProcedure', 'protectedProcedure'] },
      { name: 'prisma', patterns: ['@prisma/client', 'prisma.'] },
      { name: 'drizzle', patterns: ['drizzle-orm', 'db.select', 'db.insert'] }
    ];

    frameworks.forEach(framework => {
      if (framework.patterns.some(pattern => content.includes(pattern))) {
        analysis.frameworks.push(framework.name);
      }
    });
  }

  private extractEnvironmentVars(content: string, analysis: FileAnalysis) {
    const envMatches = content.match(/process\.env\.(\w+)/g);
    if (envMatches) {
      envMatches.forEach(match => {
        const envVar = match.replace('process.env.', '');
        if (!analysis.environmentVars.includes(envVar)) {
          analysis.environmentVars.push(envVar);
        }
      });
    }

    const importMetaMatches = content.match(/import\.meta\.env\.(\w+)/g);
    if (importMetaMatches) {
      importMetaMatches.forEach(match => {
        const envVar = match.replace('import.meta.env.', '');
        if (!analysis.environmentVars.includes(envVar)) {
          analysis.environmentVars.push(envVar);
        }
      });
    }
  }

  private checkDatabase(content: string, analysis: FileAnalysis) {
    const dbPatterns = [
      'prisma.',
      'db.select',
      'db.insert',
      'db.update',
      'db.delete',
      'SELECT',
      'INSERT',
      'UPDATE',
      'DELETE',
      'mongoose.',
      'sequelize.',
      'typeorm'
    ];

    analysis.hasDatabase = dbPatterns.some(pattern => content.includes(pattern));
  }

  private regexFallback(content: string, analysis: FileAnalysis) {
    console.log('[SIMPLE_AST] Using regex fallback analysis');

    // Basic import detection
    const importMatches = content.match(/(?:import.*?from\s+['"`]([^'"`]+)['"`]|require\(['"`]([^'"`]+)['"`]\))/g);
    if (importMatches) {
      importMatches.forEach(match => {
        const moduleMatch = match.match(/['"`]([^'"`]+)['"`]/);
        if (moduleMatch && typeof moduleMatch[1] === 'string') {
          const moduleName: string = moduleMatch[1];
          analysis.imports.push(moduleName);
        }
      });
    }

    // Extract other patterns using existing methods
    this.extractAPIEndpoints(null, content, analysis);
    this.extractFrameworks(content, analysis);
    this.extractEnvironmentVars(content, analysis);
    this.checkDatabase(content, analysis);
  }

  async analyzeFiles(files: Array<{ path: string; content: string }>): Promise<FileAnalysis[]> {
    await this.initialize();
    
    console.log(`[SIMPLE_AST] Analyzing ${files.length} files`);
    
    const results = await Promise.all(
      files.map(file => this.analyzeFile(file.path, file.content))
    );

    const totalImports = results.reduce((sum, r) => sum + r.imports.length, 0);
    const totalEndpoints = results.reduce((sum, r) => sum + r.apiEndpoints.length, 0);
    
    console.log(`[SIMPLE_AST] Analysis complete: ${totalImports} imports, ${totalEndpoints} endpoints`);
    return results;
  }
}

// Factory function for server-side usage
export async function createSimpleAnalyzer(): Promise<SimpleASTAnalyzer> {
  if (typeof window !== 'undefined') {
    throw new Error('Simple analyzer can only be created on the server side');
  }
  
  const analyzer = new SimpleASTAnalyzer();
  await analyzer.initialize(); // Pre-initialize to catch any errors early
  return analyzer;
}