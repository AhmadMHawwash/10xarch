import { Octokit } from '@octokit/rest';
import { calculateTextTokens, calculateGPTCost } from '@/lib/tokens';
import { openai } from '@/lib/openai';
import { EntryPointAnalyzer, type EntryPointAnalysis } from './entry-point-analyzer';
import { ArchitecturalFileDetector } from './architectural-file-detector';
import { DependencyTracker, type DependencyGraph as DependencyTrackerGraph } from './dependency-tracker';
import { DependencyAnalyzer, type DependencyGraph } from './dependency-analyzer';

// Type definitions for GitHub API responses
interface TreeItem {
  path?: string;
  type?: string;
  size?: number;
  sha?: string;
}

// Note: GitHubRepo interface removed as it's not currently used
// It can be re-added when needed for additional GitHub API operations

export interface GitHubRepoInfo {
  fullName: string;
  defaultBranch: string;
  size: number; // in KB
  language: string | null;
  isPrivate: boolean;
  fileCount?: number;
}

export interface AnalysisFile {
  path: string;
  content: string;
  size: number;
  type: 'config' | 'entry' | 'route' | 'model' | 'middleware' | 'test' | 'other';
  importance: 'high' | 'medium' | 'low';
}

export interface WorkspacePackageMeta {
  name: string;
  dir: string;
  main?: string;
  module?: string;
  types?: string;
  exports?: Record<string, unknown>;
}

export interface TokenEstimation {
  totalFiles: number;
  selectedFiles: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedCost: number;
  costBreakdown: {
    baseAnalysis: number;
    fileAnalysis: number;
    contentAnalysis: number;
    architecturalContext?: number;
  };
}



export class GitHubService {
  private octokit: Octokit;
  private entryPointAnalyzer: EntryPointAnalyzer;
  private dependencyTracker: DependencyTracker;
  private dependencyAnalyzer: DependencyAnalyzer;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token, // undefined for public repos
    });
    this.entryPointAnalyzer = new EntryPointAnalyzer();
    this.dependencyTracker = new DependencyTracker();
    this.dependencyAnalyzer = new DependencyAnalyzer();
  }

  /**
   * Get basic repository information
   */
  async getRepositoryInfo(owner: string, repo: string): Promise<GitHubRepoInfo> {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      return {
        fullName: data.full_name,
        defaultBranch: data.default_branch,
        size: data.size, // in KB
        language: data.language,
        isPrivate: data.private,
      };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error) {
        if (error.status === 404) {
          throw new Error(`Repository ${owner}/${repo} not found or not accessible`);
        }
        if (error.status === 403) {
          // Check if it's a rate limit error
          const headers = 'response' in error && error.response && typeof error.response === 'object' && 'headers' in error.response 
            ? error.response.headers as Record<string, string>
            : {};
          
          if (headers['x-ratelimit-remaining'] === '0') {
            const resetTime = headers['x-ratelimit-reset'] ? new Date(parseInt(headers['x-ratelimit-reset']) * 1000) : null;
            const resetMsg = resetTime ? ` Rate limit resets at ${resetTime.toLocaleTimeString()}.` : '';
            throw new Error(`GitHub API rate limit exceeded.${resetMsg} For higher limits, provide a GitHub Personal Access Token.`);
          }
          
          throw new Error(`Access denied to repository ${owner}/${repo}. Repository may be private and require authentication.`);
        }
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch repository info: ${message}`);
    }
  }

  /**
   * Get repository tree to analyze file structure
   */
  async getRepositoryTree(owner: string, repo: string, branch = 'main') {
    try {
      const { data } = await this.octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: branch,
        recursive: 'true',
      });

      return data.tree.filter((item: TreeItem) => item.type === 'blob');
    } catch (error) {
      throw new Error(`Failed to fetch repository tree: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze repository using entry-point + dependency tracking strategy
   */
  async analyzeRepository(
    owner: string, 
    repo: string, 
    branch?: string,
    dependencyDepth = 3
  ): Promise<{ 
    files: AnalysisFile[]; 
    estimation: TokenEstimation; 
    dependencyGraph: DependencyGraph; 
    architecturalContext: string;
    entryPointAnalysis: EntryPointAnalysis;
    dependencyTrackerGraph: DependencyTrackerGraph;
    stageAScan: {
      priorityPaths: string[];
      summary: {
        endpoints: number;
        dbFiles: number;
        configFiles: number;
        webhookFiles: number;
        jobFiles: number;
      }
    };
  }> {
    const repoInfo = await this.getRepositoryInfo(owner, repo);
    const effectiveBranch = branch ?? repoInfo.defaultBranch;
    const tree = await this.getRepositoryTree(owner, repo, effectiveBranch);
    
    // Validate repository size
    if (repoInfo.size > 80000) { // 70MB
      throw new Error(`Repository too large (${Math.round(repoInfo.size / 1024)}MB). Maximum size is 70MB for analysis.`);
    }

    console.log(`[ENTRY_POINT_STRATEGY] Repository: ${owner}/${repo}, Dependency depth: ${dependencyDepth}`);

    // Step 1: Build a file index first (paths and lightweight metadata only)
    console.log(`[FILE_FETCH] Indexing repository files (lazy content)...`);
    const allFiles = this.buildFileIndex(tree);
    console.log(`[FILE_FETCH] Indexed ${allFiles.length} files`);

    // Stage A: Repository-wide signature sweep (fast path-based) to identify priority architectural files
    const stageAScan = await this.signatureSweep(allFiles, owner, repo, effectiveBranch);
    const stageAPriority = new Set(stageAScan.priorityPaths);

    // Step 2: Analyze entry points
    console.log(`[ENTRY_POINT_ANALYSIS] Finding application entry points...`);
    const entryPointAnalysis = this.entryPointAnalyzer.analyzeEntryPoints(allFiles);
    
    // Step 3: Build dependency graph from entry points
    console.log(`[DEPENDENCY_TRACKING] Building dependency graph with depth ${dependencyDepth}...`);
    // Derive workspace package map and tsconfig path aliases (monorepos)
    const workspacePackages = await this.detectWorkspacePackages(
      allFiles,
      owner,
      repo,
      repoInfo.defaultBranch
    );
    this.dependencyTracker.setWorkspacePackages(workspacePackages);
    const tsconfigRecords = await this.detectTsconfigPathAliases(tree, owner, repo, repoInfo.defaultBranch);
    this.dependencyTracker.setTsconfigPathAliases(tsconfigRecords as Array<{ dir: string; baseUrl?: string; paths: Record<string, string[]> }>);
    // Provide a lazy content loader to the dependency tracker
    this.dependencyTracker.setContentLoader(async (path: string) => {
      return await this.getFileContent(owner, repo, path, repoInfo.defaultBranch);
    });

    const dependencyTrackerGraph = await this.dependencyTracker.buildDependencyGraph(
      entryPointAnalysis.entryPoints, 
      allFiles, 
      dependencyDepth
    );
    
    // Step 3b: Recommend adaptive depth (informational for now)
    try {
      const recommendedDepth = this.calculateOptimalDepth(allFiles, entryPointAnalysis.entryPoints);
      if (recommendedDepth !== dependencyDepth) {
        console.log(`[DEPTH] Recommended depth based on repo: ${recommendedDepth} (current: ${dependencyDepth})`);
      }
    } catch (e) {
      console.warn('[DEPTH] Failed to compute recommended depth', e);
    }

    // Step 3c: Determine analysis profile from depth & repo size
    const profile = this.resolveAnalysisProfile(dependencyDepth, allFiles.length);
    console.log('[PROFILE] Using analysis profile:', profile);

    // Step 4: Select files based on dependency graph (base set)
    let selectedFiles = this.selectFilesFromDependencyGraph(dependencyTrackerGraph, allFiles);
    
    console.log(`[FILE_SELECTION] Selected ${selectedFiles.length} files based on dependency analysis (pre-LLM):`);
    selectedFiles.forEach((file, index) => {
      const node = dependencyTrackerGraph.nodes.find(n => n.path === file.path);
      const level = node?.level ?? 'N/A';
      const importance = node?.importance ?? 0;
      console.log(`[FILE_SELECTION] ${index + 1}. ${file.path} (level: ${level}, importance: ${importance.toFixed(1)})`);
    });

    // Step 4b: LLM-assisted candidate re-rank (metadata/signals only)
    try {
      console.log('[FILE_SELECTION] Running LLM-assisted candidate re-rank...');
      const candidateDescriptors = this.buildCandidateDescriptors(dependencyTrackerGraph, selectedFiles);
      const orderedPaths = await this.reRankCandidatesWithLLM(candidateDescriptors, entryPointAnalysis, dependencyTrackerGraph);
      // Reorder selected files according to LLM order, keep only known paths
      const fileByPath = new Map(selectedFiles.map(f => [f.path, f] as const));
      const reordered = orderedPaths.map(p => fileByPath.get(p)).filter(Boolean) as AnalysisFile[];
      // In case LLM omitted any, append remaining in original order
      const remaining = selectedFiles.filter(f => !orderedPaths.includes(f.path));
      selectedFiles = [...reordered, ...remaining];
      console.log(`[FILE_SELECTION] LLM re-rank complete. ${selectedFiles.length} files. First 10:`, selectedFiles.slice(0, 10).map(f => f.path));
    } catch (error) {
      console.warn('[FILE_SELECTION] LLM re-rank failed or skipped:', error);
    }

    // Step 4c: Category-aware prioritization when content is enabled
    if (profile.fetchContent) {
      try {
        const detector = new ArchitecturalFileDetector();
        const classified = detector.analyzeFiles(selectedFiles.map(f => ({ path: f.path, size: f.size })));
        const important = new Set(['data_model', 'api_definition', 'configuration', 'entry_point']);
        const rank = (p?: string) => (p && important.has(p)) ? 0 : 1;
        // Stable prioritize important categories while preserving order within buckets
        selectedFiles = selectedFiles
          .map((f, i) => ({ f, i, c: classified.find(c => c.path === f.path)?.category }))
          .sort((a, b) => {
            const ra = rank(a.c); const rb = rank(b.c);
            return ra === rb ? a.i - b.i : ra - rb;
          })
          .map(x => x.f);
        console.log('[FILE_SELECTION] Applied category-aware prioritization (content-enabled profile)');
        this.logSelectedFilesSummary(classified);
      } catch (e) {
        console.warn('[FILE_SELECTION] Category-aware prioritization failed/skipped', e);
      }
    }

    // Ensure Stage A priority files are included in selectedFiles (union)
    try {
      const selectedSet = new Set(selectedFiles.map(f => f.path));
      const toAdd = allFiles.filter(f => stageAPriority.has(f.path) && !selectedSet.has(f.path));
      if (toAdd.length > 0) {
        console.log(`[FILE_SELECTION] Adding ${toAdd.length} Stage A priority files to selected set`);
        selectedFiles = [...selectedFiles, ...toAdd].sort((a, b) => a.path.localeCompare(b.path));
      }
    } catch (e) {
      console.warn('[FILE_SELECTION] Failed to merge Stage A priority files', e);
    }

    // Step 5: Defer content fetching; content will be fetched lazily by downstream consumers
    if (!profile.fetchContent) {
      console.log('[FILE_FETCH] Skipping content fetch (deps-like profile)');
    }

    // Step 6: Build traditional dependency analysis for LLM context
    console.log(`[DEPENDENCY_ANALYSIS] Building architectural context for LLM...`);
    const dependencyGraph = this.dependencyAnalyzer.analyzeDependencies(selectedFiles);
    const architecturalContext = this.generateEnhancedArchitecturalContext(
      dependencyGraph, 
      entryPointAnalysis, 
      dependencyTrackerGraph
    );
    
    // Calculate token estimation (including architectural context)
    const estimation = this.estimateTokenCost(selectedFiles, repoInfo, architecturalContext);

    return { 
      files: selectedFiles, 
      estimation, 
      dependencyGraph, 
      architecturalContext,
      entryPointAnalysis,
      dependencyTrackerGraph,
      stageAScan
    };
  }

  /**
   * Stage A: Repository-wide signature sweep to find high-priority architectural files
   */
  private async signatureSweep(
    allFiles: AnalysisFile[],
    _owner: string,
    _repo: string,
    _branch: string
  ): Promise<{ priorityPaths: string[]; summary: { endpoints: number; dbFiles: number; configFiles: number; webhookFiles: number; jobFiles: number } }> {
    try {
      const priorityPaths = new Set<string>();

      // Path-based patterns
      const nextApiRegex = /^(?:src\/)?(?:app\/api\/.+\/route\.(?:ts|js)|pages\/api\/.+\.(?:ts|js))$/i;
      const trpcRouterRegex = /^src\/server\/api\/routers\/.+\.ts$/i;
      const webhookRegex = /(?:^|\/)webhooks?(?:\/|$)|(?:^|\/)webhook[^\/]*\.(?:ts|js)$/i;
      const jobRegex = /(?:^|\/)(cron|jobs?|workers?)\b/i;
      const dbRegex = /^(prisma\/schema\.prisma|src\/server\/db\/.+|drizzle\/.+\.sql|knexfile\.(?:js|ts))$/i;
      const configRegex = /^(next\.config\.(?:js|mjs|ts)|src\/env\.(?:ts|mjs|js)|config\/.+|\.env(?:\..+)?)$/i;

      let endpoints = 0;
      let dbFiles = 0;
      let configFiles = 0;
      let webhookFiles = 0;
      let jobFiles = 0;

      for (const f of allFiles) {
        const p = f.path;
        if (nextApiRegex.test(p) || trpcRouterRegex.test(p)) { priorityPaths.add(p); endpoints++; }
        if (webhookRegex.test(p)) { priorityPaths.add(p); webhookFiles++; }
        if (jobRegex.test(p)) { priorityPaths.add(p); jobFiles++; }
        if (dbRegex.test(p)) { priorityPaths.add(p); dbFiles++; }
        if (configRegex.test(p)) { priorityPaths.add(p); configFiles++; }
      }

      // Do not prefetch content here; defer fetching until strictly needed

      console.log('[STAGE_A_SWEEP] Priority files identified:', {
        total: priorityPaths.size,
        endpoints,
        dbFiles,
        configFiles,
        webhookFiles,
        jobFiles,
      });

      return { priorityPaths: Array.from(priorityPaths), summary: { endpoints, dbFiles, configFiles, webhookFiles, jobFiles } };
    } catch (e) {
      console.warn('[STAGE_A_SWEEP] Failed, continuing without Stage A priority set', e);
      return { priorityPaths: [], summary: { endpoints: 0, dbFiles: 0, configFiles: 0, webhookFiles: 0, jobFiles: 0 } };
    }
  }

  /**
   * Derive analysis profile from depth & repo size
   */
  private resolveAnalysisProfile(_depth: number, _fileCount: number): { fetchContent: boolean; compressNonPriority: boolean } {
    // Fully-fledged mode: always fetch content, no compression
    return { fetchContent: true, compressNonPriority: false };
  }

  /**
   * Log summary of selected files by architectural category
   */
  private logSelectedFilesSummary(classified: ReturnType<ArchitecturalFileDetector['analyzeFiles']>): void {
    const counts: Record<string, number> = {};
    for (const c of classified) {
      counts[c.category] = (counts[c.category] ?? 0) + 1;
    }
    const ordered = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    console.log('[FILE_SELECTION] Category distribution:', ordered);
  }

  /**
   * Compress file content by extracting signatures and high-signal lines
   */
  private compressFileContent(file: AnalysisFile, category?: string): string {
    const content = file.content || '';
    if (content.length < 2000) return content;
    if (category === 'data_model') return this.extractSchemaSignatures(content);
    if (category === 'api_definition') return this.extractApiSignatures(content);
    return this.extractCodeSignatures(content);
  }

  /**
   * Extract schema signatures for Prisma/SQL-like files
   */
  private extractSchemaSignatures(content: string): string {
    const lines = content.split(/\r?\n/);
    const out: string[] = [];
    for (const line of lines) {
      if (/^\s*(model|enum)\s+\w+\s*\{/.test(line)) out.push(line);
      else if (/^\s*CREATE\s+TABLE\b/i.test(line)) out.push(line);
      else if (/^\s*(table|index|primary key|foreign key)\b/i.test(line)) out.push(line);
    }
    // Fallback if too sparse
    if (out.length < 5) {
      return lines.filter(l => /schema|model|enum|table|column|index/i.test(l)).slice(0, 200).join('\n');
    }
    return out.slice(0, 500).join('\n');
  }

  /**
   * Extract API signatures for Next/Express/tRPC
   */
  private extractApiSignatures(content: string): string {
    const lines = content.split(/\r?\n/);
    const out: string[] = [];
    // Next.js App Router handlers
    for (const line of lines) {
      if (/export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\b/.test(line)) out.push(line);
    }
    // Express router usages
    for (const line of lines) {
      if (/(app|router)\.(get|post|put|delete|patch)\s*\(\s*['"][^'")]+['"]/.test(line)) out.push(line);
    }
    // tRPC routers
    for (const line of lines) {
      if (/createTRPCRouter\(|\.procedure\b|\.query\b|\.mutation\b/.test(line)) out.push(line);
    }
    // Fallback to exported function signatures
    if (out.length < 5) {
      for (const line of lines) {
        if (/export\s+(async\s+)?function\s+\w+\s*\(/.test(line)) out.push(line);
      }
    }
    return Array.from(new Set(out)).slice(0, 500).join('\n');
  }

  /**
   * Extract imports/exports and function/class signatures
   */
  private extractCodeSignatures(content: string): string {
    const lines = content.split(/\r?\n/);
    const out: string[] = [];
    for (const line of lines) {
      if (/^\s*import\b/.test(line)) out.push(line);
      else if (/^\s*export\b/.test(line)) out.push(line);
      else if (/^\s*(async\s+)?function\s+\w+\s*\(/.test(line)) out.push(line);
      else if (/^\s*class\s+\w+\b/.test(line)) out.push(line);
    }
    // Keep only first N to cap tokens
    return out.slice(0, 600).join('\n');
  }

  /**
   * Recommend optimal dependency depth based on repo shape
   */
  private calculateOptimalDepth(files: AnalysisFile[], _entryPoints: EntryPointAnalysis['entryPoints']): number {
    const packageCount = files.filter(f => f.path.endsWith('package.json')).length;
    const hasMonorepo = packageCount > 1;
    const repoSize = files.length;
    if (hasMonorepo) {
      return Math.min(7, Math.max(4, packageCount));
    }
    return repoSize > 500 ? 5 : 3;
  }

  /**
   * Get file content from repository with retry logic
   */
  private async getFileContent(owner: string, repo: string, path: string, branch: string): Promise<string | null> {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      if ('content' in data && data.content) {
          const content = Buffer.from(data.content, 'base64').toString('utf-8');
          
          // 🔍 LOG: File content hash for consistency tracking
          const contentHash = this.createContentHash(content);
          console.log(`[FILE_FETCH] ${path} fetched successfully (hash: ${contentHash}, size: ${content.length})`);
          
          return content;
        }
        console.warn(`[FILE_FETCH] ${path} - no content field in response`);
        return null;
      } catch (error) {
        console.error(`[FILE_FETCH] Attempt ${attempt}/${maxRetries} failed for ${path}:`, error);
        
        if (attempt === maxRetries) {
          console.error(`[FILE_FETCH] Failed to fetch ${path} after ${maxRetries} attempts`);
          return null;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
      return null;
  }

  /**
   * Create a simple hash of file content for consistency tracking
   */
  private createContentHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Fetch all files from repository tree
   */
  private buildFileIndex(tree: TreeItem[]): AnalysisFile[] {
    const files: AnalysisFile[] = [];
    const validFiles = tree.filter(item => item.path && item.type === 'blob' && this.isValidFileForAnalysis(item.path));
    for (const item of validFiles) {
      const path = item.path!;
      files.push({
        path,
        content: '', // lazily loaded when needed
        size: item.size ?? 0,
        type: 'other',
        importance: 'medium',
      });
    }
    return files;
  }

  /**
   * Detect tsconfig path aliases across the repo (monorepos often have many)
   */
  private async detectTsconfigPathAliases(
    tree: TreeItem[],
    owner: string,
    repo: string,
    branch: string
  ): Promise<Array<{ dir: string; baseUrl?: string; paths: Record<string, string[]> }>> {
    const records: Array<{ dir: string; baseUrl?: string; paths: Record<string, string[]> }> = [];
    const tsconfigItems = tree.filter(t => t.path && t.type === 'blob' && /tsconfig(\.[^/]+)?\.json$/i.test(t.path));
    for (const item of tsconfigItems) {
      const path = item.path!;
      try {
        const content = await this.getFileContent(owner, repo, path, branch);
        if (!content) continue;
        const parsed = JSON.parse(content) as {
          compilerOptions?: { baseUrl?: string; paths?: Record<string, string[] | string> };
          extends?: string;
        };
        const dir = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';
        const co = parsed.compilerOptions ?? {};
        const normPaths: Record<string, string[]> = {};
        const rawPaths = co.paths ?? {};
        for (const [k, v] of Object.entries(rawPaths)) {
          normPaths[k] = Array.isArray(v) ? v : [v];
        }
        records.push({ dir, baseUrl: co.baseUrl, paths: normPaths });
      } catch {
        // ignore malformed tsconfig
      }
    }
    return records;
  }

  /**
   * Detect workspace packages by locating package.json files and returning their directories
   */
  private async detectWorkspacePackages(
    files: AnalysisFile[],
    owner: string,
    repo: string,
    branch: string
  ): Promise<Record<string, WorkspacePackageMeta>> {
    const map: Record<string, WorkspacePackageMeta> = {};
    const packageJsonPaths = files
      .map(f => f.path)
      .filter(p => p.endsWith('package.json'));

    console.log(`[WORKSPACE_PACKAGES] Found ${packageJsonPaths.length} package.json files:`, packageJsonPaths);

    // Parse workspace config (pnpm-workspace.yaml) for patterns
    const workspaceYaml = files.find(f => f.path === 'pnpm-workspace.yaml' || f.path === 'pnpm-workspace.yml');
    let workspacePatterns: string[] = [];
    if (workspaceYaml) {
      try {
        const yamlContent = await this.getFileContent(owner, repo, workspaceYaml.path, branch);
        if (yamlContent) {
          workspacePatterns = this.extractPnpmWorkspacePatterns(yamlContent);
          console.log('[WORKSPACE_PACKAGES] pnpm-workspace patterns:', workspacePatterns);
        }
      } catch (e) {
        console.warn('[WORKSPACE_PACKAGES] Failed to parse pnpm-workspace.yaml', e);
      }
    }

    // Optional: read turbo.json (informational; not strictly for package discovery)
    const turboJson = files.find(f => f.path === 'turbo.json');
    if (turboJson) {
      try {
        const turboContent = await this.getFileContent(owner, repo, turboJson.path, branch);
        if (turboContent) {
          // Log presence to aid debugging; no-op for now
          console.log('[WORKSPACE_PACKAGES] turbo.json present');
        }
      } catch {}
    }

    const inferredScope = this.detectWorkspaceScope(owner, repo, workspacePatterns);
    console.log(`[WORKSPACE_PACKAGES] Inferred workspace scope: ${inferredScope}`);

    for (const pkgPath of packageJsonPaths) {
      const dir = pkgPath.includes('/') ? pkgPath.slice(0, pkgPath.lastIndexOf('/')) : '';
      if (!dir) continue;
      try {
        const content = await this.getFileContent(owner, repo, pkgPath, branch);
        const parsed = content ? JSON.parse(content) as { name?: string; main?: string; module?: string; types?: string; exports?: Record<string, unknown> } : {};
        let packageName = parsed.name;
        if (!packageName || packageName.trim().length === 0) {
          const leaf = dir.split('/').pop() ?? dir;
          // If directory is inside a workspace pattern (e.g., packages/*), infer scoped name
          if (dir.startsWith('packages/') || workspacePatterns.some(p => dir.startsWith(p.replace('/*', '/')))) {
            packageName = `${inferredScope}/${leaf}`;
          } else if (dir.startsWith('apps/')) {
            packageName = `${inferredScope}/${leaf}`;
          } else {
            packageName = leaf;
          }
        }
        console.log(`[WORKSPACE_PACKAGES] Parsed ${pkgPath}: name="${packageName}", dir="${dir}"`);
        map[packageName] = {
          name: packageName,
          dir,
          main: parsed.main,
          module: parsed.module,
          types: parsed.types,
          exports: parsed.exports,
        };
      } catch (error) {
        const leaf = dir.split('/').pop() ?? dir;
        const name = `${inferredScope}/${leaf}`;
        console.log(`[WORKSPACE_PACKAGES] Failed to parse ${pkgPath}, using inferred name="${name}", dir="${dir}"`);
        map[name] = { name, dir };
      }
    }
    
    console.log(`[WORKSPACE_PACKAGES] Final workspace packages:`, Object.keys(map).map(key => `${key} → ${map[key]!.dir}`));
    return map;
  }

  /**
   * Extract 'packages' patterns from pnpm-workspace.yaml content (simple parser)
   */
  private extractPnpmWorkspacePatterns(yamlContent: string): string[] {
    const lines = yamlContent.split(/\r?\n/);
    const patterns: string[] = [];
    let inPackages = false;
    for (const raw of lines) {
      const line = raw.trim();
      if (!inPackages) {
        if (/^packages\s*:/i.test(line)) inPackages = true;
        continue;
      } else {
        if (line.startsWith('-')) {
          const val = line.replace(/^-\s*/, '').trim();
          if (val) patterns.push(val);
        } else if (line && !line.startsWith('#')) {
          // End of packages block when next non-list line appears
          break;
        }
      }
    }
    return patterns;
  }

  /**
   * Infer a workspace scope like "@repo" using simple heuristics
   */
  private detectWorkspaceScope(owner: string, repo: string, patterns: string[]): string {
    // Prefer repo name if packages/* pattern exists, else owner
    if (patterns.some(p => p.startsWith('packages/'))) {
      return `@${repo.toLowerCase()}`;
    }
    return `@${owner.toLowerCase()}`;
  }

  /**
   * Check if file should be included in analysis
   */
  private isValidFileForAnalysis(path: string): boolean {
    // Skip common non-code files
    const skipPatterns = [
      /\.md$/i, /\.txt$/i, /\.lock$/i, /\.log$/i,
      /node_modules\//, /\.git\//, /dist\//, /build\//, /\.next\//,
      /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i,
    ];

    // Include code files and important config files
    const includePatterns = [
      /\.(ts|tsx|js|jsx)$/i,
      /package\.json$/i,  // Important: package.json files for workspace detection
      /\.(config|rc)\.(js|ts)$/i,

      // TypeScript/monorepo configs
      /tsconfig.*\.json$/i,
      /turbo\.json$/i,
      /pnpm-workspace\.ya?ml$/i,

      // Database & schema files
      /\.prisma$/i,
      /\.sql$/i,
      /(^|\/)schema\.(ts|js)$/i,
      /(^|\/)migrate\.(ts|js)$/i,

      // Environment & YAML configs
      /\.env(\..+)?$/i,
      /\.(ya?ml)$/i,

      // API & route files (explicit, though ts/js already covered)
      /(^|.*\/)app\/.*\/(route|page|layout)\.(ts|tsx|js|jsx)$/i,
      /(^|\/)middleware\.(ts|js)$/i,
      /(^|.*\/)api\/.*\.(ts|js)$/i,

      // Service & integration files
      /(^|.*\/)(service|client|provider|adapter)\.(ts|js)$/i,
    ];

    return !skipPatterns.some(pattern => pattern.test(path)) &&
           includePatterns.some(pattern => pattern.test(path));
  }

  /**
   * Select files from dependency graph based on importance and level
   */
  private selectFilesFromDependencyGraph(
    graph: DependencyTrackerGraph, 
    allFiles: AnalysisFile[]
  ): AnalysisFile[] {
    const selectedPaths = new Set<string>();
    
    // Always include entry points (sorted for deterministic order)
    graph.nodes
      .filter(node => node.type === 'entry_point')
      .sort((a, b) => a.path.localeCompare(b.path)) // Deterministic order
      .forEach(node => selectedPaths.add(node.path));
    
    // Include hub nodes (sorted for deterministic order)
    graph.statistics.hubNodes
      .sort((a, b) => a.localeCompare(b)) // Deterministic order
      .forEach(path => selectedPaths.add(path));
    
    // Include nodes by importance with stable sorting
    const nodesByImportance = graph.nodes
      .filter(node => node.level <= 5) // Don't go too deep
      .sort((a, b) => {
        // Primary sort: importance (descending)
        if (b.importance !== a.importance) {
          return b.importance - a.importance;
        }
        // Secondary sort: path (ascending) for deterministic order when importance is equal
        return a.path.localeCompare(b.path);
      });
    
    // Take top nodes by importance up to a reasonable limit
    const maxFiles = Math.min(80, nodesByImportance.length);
    nodesByImportance.slice(0, maxFiles).forEach(node => {
      selectedPaths.add(node.path);
    });
    
    // Convert paths to actual files and sort for deterministic order
    const selectedFiles = allFiles.filter(file => selectedPaths.has(file.path));
    return selectedFiles.sort((a, b) => a.path.localeCompare(b.path)); // DETERMINISTIC FILE ORDER
  }

  /**
   * Build candidate descriptors (metadata/signals only) for LLM re-ranking
   */
  private buildCandidateDescriptors(
    graph: DependencyTrackerGraph,
    selectedFiles: AnalysisFile[]
  ): Array<{
    path: string;
    level: number;
    importance: number;
    inDegree: number;
    outDegree: number;
    indicators: string[]; // e.g., api_call:/api/..., env:VAR, db:prisma, config:STRIPE_...
  }> {
    const nodeByPath = new Map(graph.nodes.map(n => [n.path, n] as const));
    const edgeFrom = new Map<string, { types: string[]; targets: string[] }>();
    for (const e of graph.edges) {
      const prev = edgeFrom.get(e.from) ?? { types: [], targets: [] };
      prev.types = Array.from(new Set([...prev.types, ...e.types]));
      prev.targets = Array.from(new Set([...prev.targets, e.to]));
      edgeFrom.set(e.from, prev);
    }
    return selectedFiles.map(f => {
      const n = nodeByPath.get(f.path);
      const meta = edgeFrom.get(f.path) ?? { types: [], targets: [] };
      const indicators: string[] = [];
      for (const t of meta.types) {
        if (t === 'api_call') indicators.push('api_call');
        if (t === 'database') indicators.push('db');
        if (t === 'env_var') indicators.push('env');
        if (t === 'config') indicators.push('config');
      }
      return {
        path: f.path,
        level: n?.level ?? 99,
        importance: n?.importance ?? 1,
        inDegree: n?.inDegree ?? 0,
        outDegree: n?.outDegree ?? 0,
        indicators: Array.from(new Set(indicators)),
      };
    });
  }

  /**
   * Use LLM to re-rank candidates using only metadata/signals, never raw code
   */
  private async reRankCandidatesWithLLM(
    candidates: Array<{ path: string; level: number; importance: number; inDegree: number; outDegree: number; indicators: string[] }>,
    entryPointAnalysis: EntryPointAnalysis,
    graph: DependencyTrackerGraph
  ): Promise<string[]> {
    const system = 'You are a Senior Software Architect. Re-rank files for architectural analysis importance. Return a JSON object of the form {"order": ["path1", "path2", ...]} using only the provided candidate paths. Do not add, remove, or invent paths; only reorder.';
    const payload = {
      entryPoints: entryPointAnalysis.entryPoints.map(e => ({ path: e.path, type: e.type, importance: e.importance })),
      stats: {
        nodes: graph.statistics.totalNodes,
        edges: graph.statistics.totalEdges,
        maxDepth: graph.statistics.maxDepth,
        hubNodes: graph.statistics.hubNodes.slice(0, 10),
      },
      candidates,
      allowedPaths: candidates.map(c => c.path),
      rules: [
        'Prioritize API-related (api_call), env, and db indicators over imports/UI',
        'Prefer lower level (closer to entry) and higher centrality (in/out degree)',
        'Do not remove entry points; keep them near top',
        'Do not introduce paths not in candidates',
      ],
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      seed: Math.floor(Math.random() * 1_000_000),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify(payload) },
      ],
    });

    const content = response.choices[0]?.message?.content ?? '{}';
    type LlmOrder = { order?: unknown } | string[];
    let parsed: LlmOrder = {};
    try { parsed = JSON.parse(content) as LlmOrder; } catch {}
    const orderRaw: unknown = Array.isArray(parsed) ? parsed : (typeof parsed === 'object' && parsed && 'order' in parsed ? (parsed as { order?: unknown }).order : undefined);
    const orderArr = Array.isArray(orderRaw) ? orderRaw : [];
    const strOrder = orderArr.filter((p): p is string => typeof p === 'string');
    if (strOrder.length === 0) {
      console.warn('[FILE_SELECTION] LLM returned empty or invalid order; using original order. Raw content:', content);
      return candidates.map(c => c.path);
    }
    // Keep only known candidate paths
    const candidateSet = new Set(candidates.map(c => c.path));
    return strOrder.filter(p => candidateSet.has(p));
  }

  /**
   * Generate enhanced architectural context with entry point and dependency info
   */
  private generateEnhancedArchitecturalContext(
    dependencyGraph: DependencyGraph,
    entryPointAnalysis: EntryPointAnalysis,
    trackerGraph: DependencyTrackerGraph
  ): string {
    let context = `=== ENHANCED SYSTEM ARCHITECTURE ANALYSIS ===\n\n`;
    
    // Entry points information (sorted for deterministic order)
    context += `APPLICATION ENTRY POINTS (${entryPointAnalysis.entryPoints.length}):\n`;
    entryPointAnalysis.entryPoints
      .sort((a, b) => a.path.localeCompare(b.path)) // DETERMINISTIC ENTRY POINT ORDER
      .forEach(entry => {
        context += `- ${entry.path} (${entry.type}, ${entry.importance}): ${entry.source}\n`;
      });
    context += '\n';
    
    // Detected frameworks (sorted for deterministic order)
    if (entryPointAnalysis.detectedFrameworks.length > 0) {
      const sortedFrameworks = entryPointAnalysis.detectedFrameworks
        .sort((a, b) => a.localeCompare(b)); // DETERMINISTIC FRAMEWORK ORDER
      context += `DETECTED FRAMEWORKS: ${sortedFrameworks.join(', ')}\n\n`;
    }
    
    // Package.json scripts context (sorted for deterministic order)
    const scriptEntries = Object.entries(entryPointAnalysis.scripts)
      .sort(([a], [b]) => a.localeCompare(b)); // DETERMINISTIC SCRIPT ORDER
    if (scriptEntries.length > 0) {
      context += `PACKAGE.JSON SCRIPTS:\n`;
      scriptEntries.forEach(([name, script]) => {
        context += `- ${name}: ${script}\n`;
      });
      context += '\n';
    }
    
    // Dependency levels (sorted for deterministic order)
    context += `DEPENDENCY LEVELS (${trackerGraph.levels.length} levels, max depth: ${trackerGraph.statistics.maxDepth}):\n`;
    trackerGraph.levels
      .sort((a, b) => a.level - b.level) // Ensure levels are in order
      .forEach(level => {
        context += `- Level ${level.level} (${level.description}): ${level.nodes.length} files\n`;
        if (level.level <= 2) { // Show details for first few levels
          level.nodes
            .sort((a, b) => a.localeCompare(b)) // DETERMINISTIC NODE ORDER
            .slice(0, 5)
            .forEach(path => {
              context += `  * ${path}\n`;
            });
          if (level.nodes.length > 5) {
            context += `  * ... and ${level.nodes.length - 5} more\n`;
          }
        }
      });
    context += '\n';
    
    // Hub nodes (high centrality) - sorted for deterministic order
    if (trackerGraph.statistics.hubNodes.length > 0) {
      context += `HUB NODES (High Centrality):\n`;
      trackerGraph.statistics.hubNodes
        .sort((a, b) => a.localeCompare(b)) // DETERMINISTIC HUB ORDER
        .forEach(hubPath => {
          const node = trackerGraph.nodes.find(n => n.path === hubPath);
          if (node) {
            context += `- ${hubPath} (in-degree: ${node.inDegree}, out-degree: ${node.outDegree}, importance: ${node.importance.toFixed(1)})\n`;
          }
        });
      context += '\n';
    }
    
    // Add traditional dependency analysis context
    const traditionalContext = this.dependencyAnalyzer.generateDependencyContext(dependencyGraph);
    context += traditionalContext;
    
    return context;
  }





  /**
   * Estimate token cost for analysis including architectural context
   */
  private estimateTokenCost(files: AnalysisFile[], _repoInfo: GitHubRepoInfo, architecturalContext?: string): TokenEstimation {
    // Base analysis prompt tokens
    const baseAnalysisTokens = 1500; // Increased for more sophisticated analysis
    
    // File structure analysis tokens
    const fileAnalysisTokens = files.length * 100;
    
    // Content analysis tokens
    const contentAnalysisTokens = files.reduce((total, file) => {
      return total + calculateTextTokens(file.content);
    }, 0);

    // Architectural context tokens (dependency graph, service boundaries, etc.)
    const architecturalContextTokens = architecturalContext ? calculateTextTokens(architecturalContext) : 0;

    const totalInputTokens = baseAnalysisTokens + fileAnalysisTokens + contentAnalysisTokens + architecturalContextTokens;
    
    // Estimate output tokens (30-40% of input for richer architectural analysis)
    const estimatedOutputTokens = Math.ceil(totalInputTokens * 0.35);
    
    // Calculate cost using existing system
    const estimatedCost = calculateGPTCost(totalInputTokens, estimatedOutputTokens, 'gpt-5-nano');

    return {
      totalFiles: files.length,
      selectedFiles: files.length,
      estimatedInputTokens: totalInputTokens,
      estimatedOutputTokens: estimatedOutputTokens,
      estimatedCost,
      costBreakdown: {
        baseAnalysis: baseAnalysisTokens,
        fileAnalysis: fileAnalysisTokens,
        contentAnalysis: contentAnalysisTokens,
        architecturalContext: architecturalContextTokens,
      },
    };
  }

  /**
   * Get the current commit SHA for a repository branch
   * - If branch is omitted, resolve to repository default branch
   * - If the requested branch is missing, retry with default branch
   */
  async getCurrentCommitSha(owner: string, repo: string, branch?: string): Promise<string> {
    // Helper to fetch branch head SHA
    const fetchSha = async (b: string) => {
      const response = await this.octokit.rest.repos.getBranch({ owner, repo, branch: b });
      return response.data.commit.sha;
    };

    try {
      // Resolve branch: prefer provided value; fall back to repo default
      let targetBranch = branch;
      if (!targetBranch) {
        const info = await this.getRepositoryInfo(owner, repo);
        targetBranch = info.defaultBranch;
      }
      return await fetchSha(targetBranch);
    } catch (error: unknown) {
      // If not found, retry with default branch (handles non-standard branch names)
      const status = (error && typeof error === 'object' && 'status' in error) ? (error as { status?: number }).status : undefined;
      if (status === 404) {
        try {
          const info = await this.getRepositoryInfo(owner, repo);
          const defaultBranch = info.defaultBranch;
          if (branch && branch !== defaultBranch) {
            const resp = await this.octokit.rest.repos.getBranch({ owner, repo, branch: defaultBranch });
            return resp.data.commit.sha;
          }
        } catch {
          // Fall through to error rethrow below
        }
        throw new Error(`Repository ${owner}/${repo} or branch ${branch ?? 'default'} not found`);
      }

      if (status === 403) {
        type MaybeOctokitError = { response?: { headers?: Record<string, string> } };
        let headers: Record<string, string> = {};
        if (error && typeof error === 'object') {
          const e = error as MaybeOctokitError;
          headers = e.response?.headers ?? {};
        }
        if (headers['x-ratelimit-remaining'] === '0') {
          const resetTime = headers['x-ratelimit-reset'] ? new Date(parseInt(headers['x-ratelimit-reset']) * 1000) : null;
          const resetMsg = resetTime ? ` Rate limit resets at ${resetTime.toLocaleTimeString()}.` : '';
          throw new Error(`GitHub API rate limit exceeded.${resetMsg} For higher limits, provide a GitHub Personal Access Token.`);
        }
        throw new Error(`Access denied to repository ${owner}/${repo}. Repository may be private and require authentication.`);
      }

      const message = ((): string => {
        if (error && typeof error === 'object' && 'message' in error) {
          const m = (error as { message?: unknown }).message;
          if (typeof m === 'string') return m;
        }
        return 'Unknown error';
      })();
      throw new Error(`Failed to get current commit SHA: ${message}`);
    }
  }

  /**
   * Get the number of commits between two SHAs
   */
  async getCommitsBehind(owner: string, repo: string, baseSha: string, headSha: string): Promise<{ commitsBehind: number; commits: Array<{ sha: string; message: string; date: string }> }> {
    try {
      // Compare the two commits
      const response = await this.octokit.rest.repos.compareCommits({
        owner,
        repo,
        base: baseSha,
        head: headSha,
      });

      const commits = response.data.commits.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message.split('\n')[0] ?? '', // First line of commit message
        date: commit.commit.author?.date ?? '',
      }));

      return {
        commitsBehind: response.data.ahead_by,
        commits,
      };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error) {
        if (error.status === 404) {
          throw new Error(`Unable to compare commits - one or both SHAs not found`);
        }
        if (error.status === 403) {
          // Check if it's a rate limit error
          const headers = 'response' in error && error.response && typeof error.response === 'object' && 'headers' in error.response 
            ? error.response.headers as Record<string, string>
            : {};
          
          if (headers['x-ratelimit-remaining'] === '0') {
            const resetTime = headers['x-ratelimit-reset'] ? new Date(parseInt(headers['x-ratelimit-reset']) * 1000) : null;
            const resetMsg = resetTime ? ` Rate limit resets at ${resetTime.toLocaleTimeString()}.` : '';
            throw new Error(`GitHub API rate limit exceeded.${resetMsg} For higher limits, provide a GitHub Personal Access Token.`);
          }
          
          throw new Error(`Access denied when comparing commits. Repository may require authentication.`);
        }
      }
      const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
        ? error.message 
        : 'Unknown error';
      throw new Error(`Failed to get commits behind: ${message}`);
    }
  }

  /**
   * Check if an analysis is fresh (within acceptable commit threshold)
   */
  isAnalysisFresh(commitsBehind: number, maxCommitsBehind = 5): boolean {
    return commitsBehind <= maxCommitsBehind;
  }

  /**
   * Parse GitHub URL to extract owner and repo
   */
  static parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const patterns = [
      /^https:\/\/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/,
      /^git@github\.com:([^\/]+)\/([^\/]+?)(?:\.git)?$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1] && match[2]) {
        return {
          owner: match[1],
          repo: match[2],
        };
      }
    }

    return null;
  }
} 