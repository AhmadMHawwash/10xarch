# Dependency Analysis Improvement Plan
*For Complex Monorepos like Dub*

## Current Problems Identified

### 1. **File Type Restrictions (Critical)**
- Currently only includes: `.ts`, `.tsx`, `.js`, `.jsx`, `package.json`, `.config.(js|ts)`
- **Missing**: `.prisma`, `.sql`, `.env`, `.yaml`, API routes, middleware files
- **Impact**: Missing 60-70% of architectural components

### 2. **LLM Input Mode Handling (Critical)**
- UI/API expose `llmInputMode: 'full' | 'deps'`, but the service doesn't differentiate selection/content by mode
- **Missing**: Smart content inclusion for 'full' (prioritize API/DB/config/entry), metadata-only for 'deps'; pre-fetch and compress content for selected files
- **Impact**: Token waste in 'full', shallow analysis in practice, mode not honored end-to-end

### 3. **Conservative Dependency Depth (High)**
- Current default: 3 levels
- **Problem**: Insufficient for complex monorepos with deep service layers
- **Impact**: Missing deeper architectural components

### 4. **Monorepo Structure Blindness (High)**
- Not detecting package boundaries properly
- Missing cross-package dependencies
- **Impact**: Incomplete service boundary identification

### 5. **Entry Point Detection Gaps (Medium)**
- Missing monorepo-specific entry points
- Not detecting API routes, middleware, service layers
- **Impact**: Incomplete dependency graph starting points

---

## Implementation Plan

### Phase 1: Fix File Inclusion (Immediate - High Impact)

#### Step 1.1: Expand File Type Detection
**File**: `src/lib/github/github-service.ts`
**Location**: `isValidFileForAnalysis()` method

```typescript
// Current (restrictive)
const includePatterns = [
  /\.(ts|tsx|js|jsx)$/i,
  /package\.json$/i,
  /\.(config|rc)\.(js|ts)$/i,
];

// Proposed (comprehensive)
const includePatterns = [
  // Core code files
  /\.(ts|tsx|js|jsx)$/i,
  
  // Configuration files
  /package\.json$/i,
  /\.(config|rc)\.(js|ts)$/i,
  /tsconfig.*\.json$/i,
  /turbo\.json$/i,
  /pnpm-workspace\.yaml$/i,
  
  // Database & Schema files
  /\.prisma$/i,
  /\.sql$/i,
  /schema\.(ts|js)$/i,
  /migrate\.(ts|js)$/i,
  
  // Environment & Config
  /\.env/i,
  /\.(yaml|yml)$/i,
  
  // API & Route files
  /route\.(ts|js)$/i,
  /api\/.*\.(ts|js)$/i,
  /middleware\.(ts|js)$/i,
  
  // Service & Integration files
  /service\.(ts|js)$/i,
  /client\.(ts|js)$/i,
  /provider\.(ts|js)$/i,
  /adapter\.(ts|js)$/i,
];
```

**Expected Impact**: 3-4x more files included, capturing database schemas, API routes, configs

#### Step 1.2: Integrate Architectural File Classification (No type changes)
**Purpose**: Help LLM understand file importance and relationships using existing detector

```typescript
// File: src/lib/github/architectural-file-detector.ts already classifies files
// Action: Use it during selection and attach categories via a side map instead of changing AnalysisFile

// In GitHubService.analyzeRepository(), after building allFiles:
const detector = new ArchitecturalFileDetector();
const classified = detector.analyzeFiles(allFiles.map(f => ({ path: f.path, size: f.size })));
const categoryByPath = new Map(classified.map(c => [c.path, c.category] as const));

// Later when selecting files for LLM:
// - Prioritize categories: 'data_model' (db/prisma/sql), 'api_definition', 'configuration', 'entry_point'
```

### Phase 2: Enhanced Entry Point Detection (High Impact)

#### Step 2.1: Monorepo-Aware Entry Point Detection
**File**: `src/lib/github/entry-point-analyzer.ts`
**Location**: Extend analyzer with package context (EntryPoint packageContext)

```typescript
private findMonorepoEntryPoints(files: AnalysisFile[]): EntryPoint[] {
  const entryPoints: EntryPoint[] = [];
  const packageJsonFiles = files.filter(f => f.path.endsWith('package.json'));
  for (const pkg of packageJsonFiles) {
    const baseDir = pkg.path.replace('/package.json', '');
    const inPkg = (p: string) => p.startsWith(`${baseDir}/`);
    const apiFiles = files.filter(f => inPkg(f.path) && (f.path.includes('/api/') || /\broute\.(ts|js)\b/i.test(f.path)));
    const serviceFiles = files.filter(f => inPkg(f.path) && /\/(service|client|provider|adapter)\.(ts|js)$/i.test(f.path));
    const dbFiles = files.filter(f => inPkg(f.path) && (/\.prisma$/i.test(f.path) || /schema\.|migrate\./i.test(f.path)));
    const toEP = (f: AnalysisFile, type: EntryPointType, source: string) => ({ path: f.path, type, importance: 'high' as const, source, confidence: 85, packageContext: baseDir });
    entryPoints.push(
      ...apiFiles.map(f => toEP(f, 'api', `Monorepo API in ${baseDir}`)),
      ...serviceFiles.map(f => toEP(f, 'server', `Monorepo service in ${baseDir}`)),
      ...dbFiles.map(f => toEP(f, 'database', `Monorepo schema in ${baseDir}`)),
    );
  }
  return entryPoints;
}
```

#### Step 2.2: API Route Detection Enhancement
**Purpose**: Better detect Next.js app router and API routes

```typescript
private findApiEntryPoints(files: AnalysisFile[]): EntryPoint[] {
  // Current logic +
  
  // Next.js App Router detection
  const appRouterFiles = files.filter(f => 
    /\/app\/.*\/(route|page|layout)\.(ts|tsx|js|jsx)$/.test(f.path)
  );
  
  // tRPC router detection
  const trpcRouters = files.filter(f =>
    /\/(routers?|api)\/.*\.(ts|js)$/.test(f.path) &&
    !f.path.includes('__tests__')
  );
  
  return [...appRouterFiles, ...trpcRouters].map(/* convert to EntryPoint */);
}
```

### Phase 3: Workspace Package Detection Enhancement (Critical)

#### Step 3.1: Fix Package.json Detection
**Status**: ✅ **COMPLETED** - Fixed file inclusion bug
**File**: `src/lib/github/github-service.ts`
**Issue**: `.json` files were being excluded before `package.json` inclusion

#### Step 3.2: Enhanced Package Name Resolution
**File**: `src/lib/github/github-service.ts`
**Location**: `detectWorkspacePackages()` method

```typescript
// Enhanced logic to handle:
// 1. Scoped packages (@dub/prisma)
// 2. Directory-based fallbacks
// 3. Workspace configuration detection

private async detectWorkspacePackages(/* ... */) {
  // Current logic +
  
  // Also check pnpm-workspace.yaml, turbo.json for package discovery
  const workspaceConfig = files.find(f => f.path === 'pnpm-workspace.yaml');
  if (workspaceConfig) {
    // Parse workspace patterns and pre-populate expected packages
  }
  
  // Enhanced fallback naming
  for (const pkgPath of packageJsonPaths) {
    // Current parsing logic +
    
    // If no name in package.json, infer from workspace structure
    if (!parsed.name) {
      const pathParts = dir.split('/');
      if (pathParts[0] === 'packages') {
        // packages/prisma → @dub/prisma (inferred scope)
        const inferredScope = await this.detectWorkspaceScope(files);
        parsed.name = `${inferredScope}/${pathParts[1]}`;
      }
    }
  }
}
```

### Phase 4: Dependency Depth Optimization (Medium Impact)

#### Step 4.1: Adaptive Depth Based on Repository Size
**File**: `src/lib/github/github-service.ts`
**Location**: `analyzeRepository()` method

```typescript
// Current: Fixed depth = 3
// Proposed: Adaptive depth

private calculateOptimalDepth(files: AnalysisFile[], entryPoints: EntryPoint[]): number {
  const packageCount = files.filter(f => f.path.endsWith('package.json')).length;
  const hasMonorepo = packageCount > 1;
  const repoSize = files.length;
  
  if (hasMonorepo) {
    return Math.min(7, Math.max(4, packageCount)); // 4-7 for monorepos
  } else {
    return repoSize > 500 ? 5 : 3; // 3-5 for single packages
  }
}
```

#### Step 4.2: Smart Depth Limiting
**Purpose**: Avoid infinite traversal while capturing architecture

```typescript
// In DependencyTracker.buildDependencyGraph()
// Add circuit breaker logic:

private shouldContinueTraversal(
  currentDepth: number, 
  maxDepth: number, 
  nodesAtLevel: number,
  totalNodes: number
): boolean {
  // Stop if we hit depth limit
  if (currentDepth >= maxDepth) return false;
  
  // Stop if we're not finding new meaningful nodes
  if (currentDepth > 3 && nodesAtLevel < 2) return false;
  
  // Stop if graph is getting too large (memory protection)
  if (totalNodes > 500) return false;
  
  return true;
}
```

### Phase 5: LLM Input Mode Enhancement (High Impact)

#### Step 5.0: Thread `llmInputMode` into service and honor it
**File**: `src/lib/github/github-service.ts`
**Action**: Add a `llmInputMode: 'full' | 'deps'` parameter to `analyzeRepository(...)` and pass through from API routes. Use it to switch selection/content strategies.

```typescript
private selectFilesForLLMAnalysis(
  dependencyGraph: DependencyGraph, 
  allFiles: AnalysisFile[],
  mode: 'full' | 'deps'
): AnalysisFile[] {
  
  if (mode === 'deps') {
    // Current behavior - metadata only
    return this.selectFilesFromDependencyGraph(dependencyGraph, allFiles);
  }
  
  // Enhanced 'full' mode selection
  const selected = this.selectFilesFromDependencyGraph(dependencyGraph as any, allFiles);
  // Use ArchitecturalFileDetector to classify and prioritize
  const detector = new ArchitecturalFileDetector();
  const classified = detector.analyzeFiles(selected.map(f => ({ path: f.path, size: f.size })));
  const important = new Set(['data_model', 'api_definition', 'configuration', 'entry_point']);
  const prioritized = selected.sort((a, b) => {
    const ca = classified.find(c => c.path === a.path)?.category;
    const cb = classified.find(c => c.path === b.path)?.category;
    const ia = important.has(ca ?? '') ? 0 : 1;
    const ib = important.has(cb ?? '') ? 0 : 1;
    return ia - ib;
  });
  return prioritized;
}

#### Step 5.2: Ensure content fetch for selected files before token estimation
**Purpose**: Token estimates and analysis should use real content for prioritized files
```typescript
// After final selection (respecting mode), fetch content for selected files
for (const f of selectedFiles) {
  if (!f.content) f.content = await this.getFileContent(owner, repo, f.path, branch) ?? '';
}
```
```

### Phase 6: Performance & Token Management (Medium Impact)

#### Step 6.1: Content Compression for Large Files
**Purpose**: Include more files without exploding token costs

```typescript
private compressFileContent(file: AnalysisFile): string {
  if (file.content.length < 2000) return file.content;
  
  // Extract key patterns for large files
  if (file.category === 'database_schema') {
    return this.extractSchemaSignatures(file.content);
  }
  
  if (file.category === 'api_route') {
    return this.extractApiSignatures(file.content);
  }
  
  // For other large files, extract imports + exports + signatures
  return this.extractCodeSignatures(file.content);
}
```

---

## Testing Plan

### Test Case 1: Dub Repository
- **URL**: https://github.com/dubinc/dub
- **Expected Improvements**:
  - Detect packages: `@dub/prisma`, `@dub/ui`, `@dub/analytics`, etc.
  - Include Prisma schemas, API routes, config files
  - Resolve cross-package dependencies
  - Identify service boundaries

### Test Case 2: Verification Metrics
```typescript
// Before vs After comparison
interface AnalysisMetrics {
  filesIncluded: number;
  packagesBoundariesDetected: number;
  workspacePackagesResolved: number;
  apiRoutesFound: number;
  databaseSchemasFound: number;
  dependencyDepthAchieved: number;
  unresolvedReferences: number;
}
```

---

## Implementation Priority

### 🔥 **CRITICAL (Do First)**
1. **Phase 1.1**: Expand file type detection - *30 min*
2. **Phase 5.0 & 5.1**: Honor `llmInputMode` and add intelligent content-aware selection using `ArchitecturalFileDetector` - *60 min*
3. **Phase 4.1 & 4.2**: Adaptive depth calculation + circuit breaker - *45 min*

### ⚡ **HIGH (Do Second)**  
4. **Phase 3.2**: Enhanced package name resolution (pnpm-workspace.yaml, turbo.json) - *60 min*
5. **Phase 2.1**: Monorepo entry point detection with `packageContext` - *45 min*

### 📈 **MEDIUM (Do Third)**
6. **Phase 1.2**: Integrate architectural classification into selection - *30 min*
7. **Phase 6.1**: Content compression - *45 min*

---

## Success Criteria

✅ **Dub repository analysis includes**:
- All packages detected: `@dub/prisma`, `@dub/ui`, `@dub/analytics`, etc.
- Database schemas: `packages/prisma/schema.prisma`
- API routes: `apps/web/app/api/**`
- Cross-package dependencies resolved
- Service boundaries identified
- 150+ meaningful files vs current ~30
 - `llmInputMode` respected (deps vs full); prioritized content for API/DB/config/entry in 'full'

✅ **Performance targets**:
- Analysis completes in < 5 minutes
- Token usage stays under reasonable limits
- No unresolved reference errors for workspace packages
 - Circuit breakers prevent oversized graphs; early stop on low-yield levels

---

*Total Estimated Implementation Time: ~4-5 hours*
*Expected Impact: 3-5x better architectural analysis coverage*
