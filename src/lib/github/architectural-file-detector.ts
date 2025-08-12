/**
 * Architectural File Detector
 * 
 * Focuses on high-level system architecture rather than implementation details.
 * Categorizes files based on their architectural significance for system design analysis.
 */

export interface ArchitecturalFile {
  path: string;
  category: ArchitecturalCategory;
  importance: ArchitecturalImportance;
  framework?: string; // e.g., 'nextjs', 'trpc', 'drizzle'
  purpose: string; // Human-readable description
}

export type ArchitecturalCategory = 
  | 'entry_point'     // Application bootstrap files
  | 'api_definition'  // API routes, controllers, routers
  | 'data_model'      // Database schemas, type definitions
  | 'configuration'   // Build, environment, framework configs
  | 'integration'     // External service integrations
  | 'middleware'      // Auth, routing, request processing
  | 'frontend_core';  // Core UI components/layouts

export type ArchitecturalImportance = 'critical' | 'high' | 'medium' | 'low';

interface FrameworkPattern {
  patterns: RegExp[];
  category: ArchitecturalCategory;
  importance: ArchitecturalImportance;
  framework: string;
  purposeTemplate: string;
}

export class ArchitecturalFileDetector {
  private frameworkPatterns: FrameworkPattern[] = [
    // === ENTRY POINTS ===
    
    // General Node.js/JavaScript entry points
    {
      patterns: [/^(src\/)?index\.(ts|js|mjs)$/, /^(src\/)?main\.(ts|js|mjs)$/, /^(src\/)?app\.(ts|js|mjs)$/, /^(src\/)?server\.(ts|js|mjs)$/],
      category: 'entry_point',
      importance: 'critical',
      framework: 'node',
      purposeTemplate: 'Application entry point - main bootstrap file'
    },
    {
      patterns: [/^bin\/[^/]+$/, /^(src\/)?cli\.(ts|js)$/, /^(src\/)?bin\.(ts|js)$/],
      category: 'entry_point',
      importance: 'high',
      framework: 'cli',
      purposeTemplate: 'CLI entry point - command line interface'
    },

    // React applications (general)
    {
      patterns: [/^(src\/)?App\.(tsx?|jsx?)$/, /^src\/index\.(tsx?|jsx?)$/],
      category: 'entry_point',
      importance: 'critical',
      framework: 'react',
      purposeTemplate: 'React application root component'
    },

    // Vue.js applications
    {
      patterns: [/^(src\/)?main\.(js|ts)$/, /^(src\/)?App\.vue$/],
      category: 'entry_point',
      importance: 'critical',
      framework: 'vue',
      purposeTemplate: 'Vue.js application entry point'
    },

    // Angular applications
    {
      patterns: [/^src\/main\.ts$/, /^src\/app\/app\.component\.ts$/],
      category: 'entry_point',
      importance: 'critical',
      framework: 'angular',
      purposeTemplate: 'Angular application bootstrap'
    },

    // Next.js specific (keep existing)
    {
      patterns: [/^src\/app\/layout\.tsx?$/, /^app\/layout\.tsx?$/],
      category: 'entry_point',
      importance: 'critical',
      framework: 'nextjs',
      purposeTemplate: 'Next.js root layout - application structure'
    },
    {
      patterns: [/^src\/app\/page\.tsx?$/, /^app\/page\.tsx?$/],
      category: 'entry_point', 
      importance: 'critical',
      framework: 'nextjs',
      purposeTemplate: 'Next.js home page - application entry'
    },
    {
      patterns: [/^pages\/_app\.tsx?$/, /^src\/pages\/_app\.tsx?$/],
      category: 'entry_point',
      importance: 'critical', 
      framework: 'nextjs',
      purposeTemplate: 'Next.js app wrapper - global application setup'
    },

    // === API DEFINITIONS ===
    
    // Express.js patterns
    {
      patterns: [/^(src\/)?routes?\/.*\.(ts|js)$/, /^(src\/)?api\/.*\.(ts|js)$/, /^(src\/)?router\/.*\.(ts|js)$/],
      category: 'api_definition',
      importance: 'high',
      framework: 'express',
      purposeTemplate: 'API route definition - HTTP endpoints'
    },
    {
      patterns: [/^(src\/)?controllers?\/.*\.(ts|js)$/, /^(src\/)?handlers?\/.*\.(ts|js)$/],
      category: 'api_definition',
      importance: 'high',
      framework: 'backend',
      purposeTemplate: 'API controller - business logic handler'
    },

    // GraphQL patterns
    {
      patterns: [/^(src\/)?schema\.(ts|js|graphql)$/, /^(src\/)?graphql\/.*\.(ts|js)$/],
      category: 'api_definition',
      importance: 'high',
      framework: 'graphql',
      purposeTemplate: 'GraphQL schema - API definition'
    },
    {
      patterns: [/^(src\/)?resolvers?\/.*\.(ts|js)$/, /^(src\/)?graphql\/resolvers?\/.*\.(ts|js)$/],
      category: 'api_definition',
      importance: 'high',
      framework: 'graphql',
      purposeTemplate: 'GraphQL resolver - query/mutation handler'
    },

    // REST API patterns
    {
      patterns: [/swagger|openapi/i],
      category: 'api_definition',
      importance: 'medium',
      framework: 'rest',
      purposeTemplate: 'API documentation - REST endpoints specification'
    },

    // tRPC specific (keep existing)
    {
      patterns: [/^src\/server\/api\/root\.ts$/, /^server\/api\/root\.ts$/],
      category: 'api_definition',
      importance: 'critical',
      framework: 'trpc',
      purposeTemplate: 'tRPC root router - API orchestration'
    },
    {
      patterns: [/^src\/server\/api\/routers\/.*\.ts$/, /^server\/api\/routers\/.*\.ts$/],
      category: 'api_definition',
      importance: 'high',
      framework: 'trpc', 
      purposeTemplate: 'tRPC router - API endpoint definitions'
    },

    // Next.js API routes (keep existing)
    {
      patterns: [/^src\/app\/api\/.*\/route\.ts$/, /^app\/api\/.*\/route\.ts$/],
      category: 'api_definition',
      importance: 'high',
      framework: 'nextjs',
      purposeTemplate: 'Next.js API route - REST endpoint'
    },
    {
      patterns: [/^pages\/api\/.*\.(ts|js)$/, /^src\/pages\/api\/.*\.(ts|js)$/],
      category: 'api_definition',
      importance: 'high',
      framework: 'nextjs',
      purposeTemplate: 'Next.js API route - REST endpoint'
    },

    // === DATA MODELS ===
    
    // General database schemas
    {
      patterns: [/^(src\/)?models?\/.*\.(ts|js)$/, /^(src\/)?entities\/.*\.(ts|js)$/],
      category: 'data_model',
      importance: 'high',
      framework: 'database',
      purposeTemplate: 'Data model - entity definitions'
    },
    {
      patterns: [/^(src\/)?db\/.*\.(ts|js)$/, /^(src\/)?database\/.*\.(ts|js)$/],
      category: 'data_model',
      importance: 'high',
      framework: 'database',
      purposeTemplate: 'Database layer - data access logic'
    },

    // MongoDB/Mongoose patterns
    {
      patterns: [/mongoose|mongo/i],
      category: 'data_model',
      importance: 'high',
      framework: 'mongodb',
      purposeTemplate: 'MongoDB model - document schema'
    },

    // TypeORM patterns
    {
      patterns: [/entity|typeorm/i],
      category: 'data_model',
      importance: 'high',
      framework: 'typeorm',
      purposeTemplate: 'TypeORM entity - database model'
    },

    // Sequelize patterns
    {
      patterns: [/sequelize/i],
      category: 'data_model',
      importance: 'high',
      framework: 'sequelize',
      purposeTemplate: 'Sequelize model - ORM definitions'
    },

    // TypeScript type definitions
    {
      patterns: [/^src\/types\/.*\.ts$/, /^types\/.*\.ts$/, /^@types\/.*\.ts$/, /\.d\.ts$/],
      category: 'data_model',
      importance: 'medium',
      framework: 'typescript',
      purposeTemplate: 'Type definitions - data structure contracts'
    },

    // Drizzle specific (keep existing)
    {
      patterns: [/^src\/server\/db\/schema\.ts$/, /^server\/db\/schema\.ts$/, /^(src\/)?schema\.ts$/],
      category: 'data_model',
      importance: 'critical',
      framework: 'drizzle',
      purposeTemplate: 'Database schema - data structure definitions'
    },
    {
      patterns: [/^src\/server\/db\/migrate\.ts$/, /^server\/db\/migrate\.ts$/],
      category: 'data_model',
      importance: 'medium',
      framework: 'drizzle',
      purposeTemplate: 'Database migration runner'
    },

    // Prisma specific (keep existing)
    {
      patterns: [/^(src\/)?prisma\/schema\.prisma$/],
      category: 'data_model',
      importance: 'critical',
      framework: 'prisma',
      purposeTemplate: 'Prisma schema - data model definitions'
    },

    // === CONFIGURATIONS ===
    
    // Package management
    {
      patterns: [/^package\.json$/, /^yarn\.lock$/, /^package-lock\.json$/, /^pnpm-lock\.yaml$/],
      category: 'configuration',
      importance: 'critical',
      framework: 'node',
      purposeTemplate: 'Package configuration - dependencies and scripts'
    },

    // Build tools
    {
      patterns: [/^webpack\.config\.(js|ts)$/, /^vite\.config\.(js|ts)$/, /^rollup\.config\.(js|ts)$/],
      category: 'configuration',
      importance: 'high',
      framework: 'build',
      purposeTemplate: 'Build configuration - bundling and compilation'
    },
    {
      patterns: [/^tsconfig\.json$/, /^jsconfig\.json$/],
      category: 'configuration',
      importance: 'high',
      framework: 'typescript',
      purposeTemplate: 'TypeScript configuration - compiler settings'
    },
    {
      patterns: [/^babel\.config\.(js|json)$/, /^\.babelrc(\.(js|json))?$/],
      category: 'configuration',
      importance: 'medium',
      framework: 'babel',
      purposeTemplate: 'Babel configuration - JavaScript transformation'
    },

    // Environment and runtime
    {
      patterns: [/^\.env(\.(example|local|development|production))?$/, /^\.env\.[a-z]+$/],
      category: 'configuration',
      importance: 'high',
      framework: 'environment',
      purposeTemplate: 'Environment configuration - runtime variables'
    },

    // Docker and deployment
    {
      patterns: [/^Dockerfile$/, /^docker-compose\.ya?ml$/, /^\.dockerignore$/],
      category: 'configuration',
      importance: 'high',
      framework: 'docker',
      purposeTemplate: 'Docker configuration - containerization'
    },

    // CI/CD
    {
      patterns: [/^\.github\/workflows\/.*\.ya?ml$/, /^\.gitlab-ci\.yml$/, /^\.travis\.yml$/, /^\.circleci\/config\.yml$/],
      category: 'configuration',
      importance: 'medium',
      framework: 'cicd',
      purposeTemplate: 'CI/CD configuration - automated deployment'
    },

    // Linting and formatting
    {
      patterns: [/^\.eslintrc(\.(js|json|yml|yaml))?$/, /^eslint\.config\.(js|mjs)$/],
      category: 'configuration',
      importance: 'low',
      framework: 'linting',
      purposeTemplate: 'ESLint configuration - code quality'
    },
    {
      patterns: [/^\.prettierrc(\.(js|json|yml|yaml))?$/, /^prettier\.config\.(js|mjs)$/],
      category: 'configuration',
      importance: 'low',
      framework: 'formatting',
      purposeTemplate: 'Prettier configuration - code formatting'
    },

    // Framework-specific configs (keep existing)
    {
      patterns: [/^next\.config\.(js|ts|mjs)$/],
      category: 'configuration',
      importance: 'high',
      framework: 'nextjs',
      purposeTemplate: 'Next.js configuration - build and runtime settings'
    },
    {
      patterns: [/^vue\.config\.(js|ts)$/, /^nuxt\.config\.(js|ts)$/],
      category: 'configuration',
      importance: 'high',
      framework: 'vue',
      purposeTemplate: 'Vue.js configuration - build and runtime settings'
    },
    {
      patterns: [/^angular\.json$/, /^ng-package\.json$/],
      category: 'configuration',
      importance: 'high',
      framework: 'angular',
      purposeTemplate: 'Angular configuration - project settings'
    },
    {
      patterns: [/^drizzle\.config\.ts$/, /^prisma\/schema\.prisma$/],
      category: 'configuration', 
      importance: 'high',
      framework: 'database',
      purposeTemplate: 'Database ORM configuration'
    },

    // === INTEGRATIONS ===
    {
      patterns: [/webhook.*stripe/i, /stripe.*webhook/i],
      category: 'integration',
      importance: 'high', 
      framework: 'stripe',
      purposeTemplate: 'Stripe payment integration - webhook handlers'
    },
    {
      patterns: [/webhook.*clerk/i, /clerk.*webhook/i, /auth.*clerk/i],
      category: 'integration',
      importance: 'high',
      framework: 'clerk',
      purposeTemplate: 'Clerk authentication integration'
    },
    {
      patterns: [/openai/i, /gpt/i, /ai.*chat/i, /chat.*ai/i],
      category: 'integration',
      importance: 'high',
      framework: 'openai',
      purposeTemplate: 'AI integration - OpenAI/GPT services'
    },

    // === MIDDLEWARE ===
    {
      patterns: [/^src\/middleware\.ts$/, /^middleware\.ts$/],
      category: 'middleware',
      importance: 'critical',
      framework: 'nextjs',
      purposeTemplate: 'Next.js middleware - request processing pipeline'
    },
    {
      patterns: [/^(src\/)?middleware\/.*\.(ts|js)$/, /^(src\/)?middlewares\/.*\.(ts|js)$/],
      category: 'middleware',
      importance: 'high',
      framework: 'backend',
      purposeTemplate: 'Application middleware - request/response processing'
    },
    {
      patterns: [/auth.*middleware/i, /middleware.*auth/i],
      category: 'middleware',
      importance: 'high',
      framework: 'auth',
      purposeTemplate: 'Authentication middleware'
    },
    {
      patterns: [/cors|helmet|morgan|compression/i],
      category: 'middleware',
      importance: 'medium',
      framework: 'express',
      purposeTemplate: 'Express middleware - security and utilities'
    },

    // === FRONTEND CORE ===
    
    // Application-specific important components (customizable)
    {
      patterns: [/SystemDesigner/i, /system.*designer/i],
      category: 'frontend_core',
      importance: 'critical',
      framework: 'react',
      purposeTemplate: 'Core system designer component - main application feature'
    },

    // General component patterns
    {
      patterns: [/^(src\/)?components\/.*\.(tsx?|jsx?|vue)$/, /^(src\/)?ui\/.*\.(tsx?|jsx?|vue)$/],
      category: 'frontend_core',
      importance: 'medium',
      framework: 'frontend',
      purposeTemplate: 'UI component - reusable interface building block'
    },

    // Layout and page components
    {
      patterns: [/^(src\/)?layouts?\/.*\.(tsx?|jsx?|vue)$/, /^(src\/)?pages\/.*\.(tsx?|jsx?|vue)$/],
      category: 'frontend_core',
      importance: 'high',
      framework: 'frontend',
      purposeTemplate: 'Page/Layout component - application structure'
    },

    // State management
    {
      patterns: [/^(src\/)?store\/.*\.(ts|js)$/, /^(src\/)?stores\/.*\.(ts|js)$/, /^(src\/)?state\/.*\.(ts|js)$/],
      category: 'frontend_core',
      importance: 'high',
      framework: 'state',
      purposeTemplate: 'State management - application data flow'
    },
    {
      patterns: [/redux|zustand|pinia|vuex/i],
      category: 'frontend_core',
      importance: 'high',
      framework: 'state',
      purposeTemplate: 'State management library - centralized state'
    },

    // Hooks and utilities
    {
      patterns: [/^(src\/)?hooks\/.*\.(ts|js)$/, /^(src\/)?composables\/.*\.(ts|js)$/],
      category: 'frontend_core',
      importance: 'medium',
      framework: 'frontend',
      purposeTemplate: 'Custom hooks/composables - reusable logic'
    },

    // Services and API clients
    {
      patterns: [/^(src\/)?services\/.*\.(ts|js)$/, /^(src\/)?api\/.*\.(ts|js)$/, /^(src\/)?lib\/.*\.(ts|js)$/],
      category: 'frontend_core',
      importance: 'medium',
      framework: 'frontend',
      purposeTemplate: 'Frontend service - API integration and utilities'
    },
  ];

  /**
   * Analyze files and categorize them by architectural significance
   */
  analyzeFiles(files: Array<{ path: string; size?: number }>): ArchitecturalFile[] {
    const architecturalFiles: ArchitecturalFile[] = [];

    for (const file of files) {
      const analysis = this.analyzeFile(file.path);
      if (analysis) {
        architecturalFiles.push(analysis);
      }
    }

    // Sort by architectural importance
    architecturalFiles.sort((a, b) => {
      const importanceOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const categoryOrder = { 
        entry_point: 7, 
        configuration: 6, 
        api_definition: 5, 
        data_model: 4, 
        middleware: 3, 
        integration: 2, 
        frontend_core: 1 
      };
      
      // Primary sort: importance
      if (importanceOrder[a.importance] !== importanceOrder[b.importance]) {
        return importanceOrder[b.importance] - importanceOrder[a.importance];
      }
      
      // Secondary sort: category
      if (categoryOrder[a.category] !== categoryOrder[b.category]) {
        return categoryOrder[b.category] - categoryOrder[a.category];
      }
      
      // Tertiary sort: path (for consistency)
      return a.path.localeCompare(b.path);
    });

    return architecturalFiles;
  }

  /**
   * Smart selection of files for analysis - dynamic and architecture-focused
   */
  selectFilesForAnalysis(files: Array<{ path: string; size?: number }>): ArchitecturalFile[] {
    const allArchitecturalFiles = this.analyzeFiles(files);
    
    // Group files by importance
    const criticalFiles = allArchitecturalFiles.filter(f => f.importance === 'critical');
    const highFiles = allArchitecturalFiles.filter(f => f.importance === 'high');
    const mediumFiles = allArchitecturalFiles.filter(f => f.importance === 'medium');
    const lowFiles = allArchitecturalFiles.filter(f => f.importance === 'low');

    // Group medium files by category
    const mediumArchitectural = mediumFiles.filter(f => f.category !== 'frontend_core');
    const mediumFrontend = mediumFiles.filter(f => f.category === 'frontend_core');

    const selectedFiles: ArchitecturalFile[] = [];
    
    // ALWAYS include all critical files (these define the core architecture)
    selectedFiles.push(...criticalFiles);
    
    // ALWAYS include all high importance files (these complete the architecture picture)
    selectedFiles.push(...highFiles);
    
    // Selectively include medium importance files
    // Include all non-frontend medium files (configs, integrations, etc.)
    selectedFiles.push(...mediumArchitectural);
    
    // Limit frontend medium files to avoid UI component spam
    const frontendLimit = Math.min(mediumFrontend.length, 10);
    selectedFiles.push(...mediumFrontend.slice(0, frontendLimit));
    
    // Ensure architectural completeness - at least one file from each category if available
    const representedCategories = new Set(selectedFiles.map(f => f.category));
    const allCategories: ArchitecturalCategory[] = ['entry_point', 'api_definition', 'data_model', 'configuration', 'integration', 'middleware', 'frontend_core'];
    
    for (const category of allCategories) {
      if (!representedCategories.has(category)) {
        // Find any file from this category
        const categoryFile = allArchitecturalFiles.find(f => f.category === category);
        if (categoryFile && !selectedFiles.includes(categoryFile)) {
          selectedFiles.push(categoryFile);
        }
      }
    }
    
    // Apply reasonable upper limit to prevent token overflow
    const maxFiles = 80; // Generous but reasonable limit
    const finalSelection = selectedFiles.slice(0, maxFiles);
    
    // Log the smart selection strategy
    console.log(`[SMART_SELECTION] Selected ${finalSelection.length} files dynamically:`);
    console.log(`[SMART_SELECTION] Critical: ${criticalFiles.length}, High: ${highFiles.length}, Medium: ${mediumArchitectural.length + Math.min(mediumFrontend.length, frontendLimit)}`);
    console.log(`[SMART_SELECTION] Skipped ${mediumFrontend.length - frontendLimit} frontend components, ${lowFiles.length} low-importance files`);
    
    return finalSelection;
  }

  /**
   * Analyze a single file path for architectural significance
   */
  private analyzeFile(filePath: string): ArchitecturalFile | null {
    // Skip non-architectural files immediately
    if (this.shouldSkipFile(filePath)) {
      return null;
    }

    // Check against framework patterns
    for (const pattern of this.frameworkPatterns) {
      if (pattern.patterns.some(regex => regex.test(filePath))) {
        return {
          path: filePath,
          category: pattern.category,
          importance: pattern.importance,
          framework: pattern.framework,
          purpose: pattern.purposeTemplate
        };
      }
    }

    return null;
  }

  /**
   * Files that should never be included in architectural analysis
   */
  private shouldSkipFile(filePath: string): boolean {
    const skipPatterns = [
      // Documentation
      /\.md$/i,
      /^docs\//i,
      /readme/i,
      /license/i,
      /changelog/i,
      /contributing/i,
      /code_of_conduct/i,
      /security/i,
      /charity/i,

      // Build/IDE files
      /node_modules\//,
      /\.git\//,
      /dist\//,
      /build\//,
      /\.next\//,
      /coverage\//,
      
      // Old migration files (keep only recent schema)
      /drizzle\/\d+_.*\.sql$/,
      
      // Git/Development files
      /\.gitignore$/,
      /\.husky\//,
      /\.vscode\//,
      /\.idea\//,
      
      // Lock files (except package.json)
      /yarn\.lock$/,
      /package-lock\.json$/,
      /pnpm-lock\.yaml$/,
      
      // Linting/Formatting
      /\.eslintrc/,
      /\.prettierrc/,
      /\.editorconfig/,
      
      // Binary/Media files
      /\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz|woff|woff2|ttf|eot)$/i,
      
      // Test files (focus on architecture, not testing)
      /\.(test|spec)\.(ts|js|tsx|jsx)$/i,
      /__tests__\//,
      /\.test\./,
      /\.spec\./,
    ];

    return skipPatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * Get summary of architectural analysis
   */
  getAnalysisSummary(files: ArchitecturalFile[]): {
    byCategory: Record<ArchitecturalCategory, number>;
    byImportance: Record<ArchitecturalImportance, number>;
    byFramework: Record<string, number>;
    totalFiles: number;
  } {
    const byCategory = {} as Record<ArchitecturalCategory, number>;
    const byImportance = {} as Record<ArchitecturalImportance, number>;
    const byFramework = {} as Record<string, number>;

    for (const file of files) {
      byCategory[file.category] = (byCategory[file.category] ?? 0) + 1;
      byImportance[file.importance] = (byImportance[file.importance] ?? 0) + 1;
      if (file.framework) {
        byFramework[file.framework] = (byFramework[file.framework] ?? 0) + 1;
      }
    }

    return {
      byCategory,
      byImportance, 
      byFramework,
      totalFiles: files.length
    };
  }

  /**
   * Add support for additional language patterns (future extensibility)
   * 
   * Example Python patterns to add later:
   * - Django: manage.py, settings.py, urls.py, models.py, views.py
   * - Flask: app.py, main.py, routes.py, models.py, __init__.py
   * - FastAPI: main.py, routers/, models/, dependencies.py
   */
  addLanguagePatterns(patterns: FrameworkPattern[]): void {
    this.frameworkPatterns.push(...patterns);
  }

  /**
   * Get all supported frameworks/languages
   */
  getSupportedFrameworks(): string[] {
    const frameworks = new Set(this.frameworkPatterns.map(p => p.framework));
    return Array.from(frameworks).sort();
  }
}