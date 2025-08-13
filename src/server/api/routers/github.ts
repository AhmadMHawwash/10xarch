import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { GitHubService } from '@/lib/github/github-service';
import { ArchitecturalFileDetector } from '@/lib/github/architectural-file-detector';
// Simple AST analysis for architectural insights
import { TRPCError } from '@trpc/server';
import { repositoryAnalyses, playgrounds } from '@/server/db/schema';
import { eq, or, like } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

// Helper function to get GitHub token with fallback to environment variable
function getGitHubToken(userToken?: string): string | undefined {
  return userToken ?? process.env.GITHUB_BACKUP_TOKEN;
}

// Helper function to run enhanced analysis with simple AST insights
async function runEnhancedAnalysis(
  owner: string,
  repo: string,
  branch?: string,
  dependencyDepth = 5,
  token?: string
) {
  console.log(`[ENHANCED_ANALYSIS] Starting enhanced analysis for ${owner}/${repo}`);
  
  // Step 1: Get repository info and files using existing service
  const github = new GitHubService(getGitHubToken(token));
  const repoInfo = await github.getRepositoryInfo(owner, repo);
  const analysis = await github.analyzeRepository(owner, repo, branch, dependencyDepth);
  const { dependencyGraph, entryPointAnalysis, dependencyTrackerGraph } = analysis;
  
  console.log(`[ENHANCED_ANALYSIS] Got ${analysis.files.length} files from GitHub service`);
  // Log high-signal dependency graph summary for server-side inspection
  try {
    const stats = dependencyTrackerGraph?.statistics;
    if (stats) {
      const topHubs = stats.hubNodes.slice(0, 10);
      const refTypeCounts = (() => {
        const counts: Record<string, number> = {};
        for (const e of dependencyTrackerGraph.edges) {
          for (const t of e.types) counts[t] = (counts[t] ?? 0) + 1;
        }
        return counts;
      })();
      console.log('[ENHANCED_ANALYSIS] DEP_GRAPH_STATS', {
        repo: `${owner}/${repo}`,
        totalNodes: stats.totalNodes,
        totalEdges: stats.totalEdges,
        maxDepth: stats.maxDepth,
        entryPoints: stats.entryPoints,
        topHubs,
        refTypeCounts,
      });
      if (entryPointAnalysis) {
        console.log('[ENHANCED_ANALYSIS] ENTRY_POINTS', entryPointAnalysis.entryPoints.map(e => ({ path: e.path, type: e.type, importance: e.importance })));
        if (entryPointAnalysis.detectedFrameworks?.length) {
          console.log('[ENHANCED_ANALYSIS] FRAMEWORKS', entryPointAnalysis.detectedFrameworks);
        }
      }
    }
  } catch (e) {
    console.warn('[ENHANCED_ANALYSIS] Failed to log dependency graph summary', e);
  }
  
  // Step 2: Run simple AST analysis on key files for additional insights
  try {
    const { createSimpleAnalyzer } = await import('@/lib/github/simple-ast');
    const astAnalyzer = await createSimpleAnalyzer();

    // Smart selection of AST files
    const detector = new ArchitecturalFileDetector();
    const classified = detector.analyzeFiles(analysis.files.map(f => ({ path: f.path, size: f.content?.length ?? 0 })));
    const categoryByPath = new Map(classified.map(c => [c.path, c.category] as const));
    const important = new Set(['data_model', 'api_definition', 'configuration', 'entry_point']);
    const nodeByPath = new Map(dependencyTrackerGraph.nodes.map(n => [n.path, n] as const));
    const stageAPriority = new Set(analysis.stageAScan?.priorityPaths ?? []);

    const scored = analysis.files
      .filter(f => f.content && f.content.length > 0)
      .map(f => {
        const cat = categoryByPath.get(f.path) ?? 'other';
        const n = nodeByPath.get(f.path);
        const centrality = (n?.inDegree ?? 0) * 2 + (n?.outDegree ?? 0);
        const priorityBoost = important.has(cat) ? 100 : 0;
        const stageABoost = stageAPriority.has(f.path) ? 120 : 0;
        const score = priorityBoost + stageABoost + centrality - (n?.level ?? 0) * 0.5;
        return { f, score, cat };
      })
      .sort((a, b) => b.score - a.score);

    // Dynamic cap based on repo size and content
    const baseCap = analysis.files.length <= 100 ? 40 : (analysis.files.length <= 300 ? 60 : 80);
    const maxCap = Math.min(baseCap, scored.length);
    const selectedForAst: typeof scored = [];
    let totalChars = 0;
    const maxChars = 120_000; // ~120k chars budget
    // Ensure Stage A priority files are included first within the char budget
    const stageAFirst = scored.sort((a, b) => {
      const aStage = stageAPriority.has(a.f.path) ? 0 : 1;
      const bStage = stageAPriority.has(b.f.path) ? 0 : 1;
      return aStage === bStage ? b.score - a.score : aStage - bStage;
    });

    for (const item of stageAFirst) {
      const len = item.f.content.length;
      if (selectedForAst.length >= maxCap) break;
      if (totalChars + len > maxChars) continue; // skip overly large files to stay budgeted
      selectedForAst.push(item);
      totalChars += len;
    }

    const keyFiles = selectedForAst.map(s => ({ path: s.f.path, content: s.f.content }));
    console.log('[ENHANCED_ANALYSIS] AST selection:', {
      totalCandidates: scored.length,
      selected: keyFiles.length,
      charBudget: totalChars,
      categories: selectedForAst.reduce((acc, s) => { acc[s.cat] = (acc[s.cat] ?? 0) + 1; return acc; }, {} as Record<string, number>)
    });

    const astResults = keyFiles.length > 0 ? await astAnalyzer.analyzeFiles(keyFiles) : [];
    
    // Enhance the architectural context with AST insights
    const astInsights = {
      totalImports: astResults.reduce((sum, r) => sum + r.imports.length, 0),
      totalEndpoints: astResults.reduce((sum, r) => sum + r.apiEndpoints.length, 0),
      frameworks: [...new Set(astResults.flatMap(r => r.frameworks))],
      hasDatabase: astResults.some(r => r.hasDatabase),
      environmentVars: [...new Set(astResults.flatMap(r => r.environmentVars))],
      apiEndpoints: astResults.flatMap(r => r.apiEndpoints)
    };
    
    console.log(`[ENHANCED_ANALYSIS] AST insights: ${astInsights.frameworks.length} frameworks, ${astInsights.totalEndpoints} endpoints`);
    
    // Add AST insights to architectural context
    const baseContext = analysis.architecturalContext 
      ? (() => { 
          try { 
            return JSON.parse(analysis.architecturalContext) as Record<string, unknown>; 
          } catch { 
            return {}; 
          } 
        })()
      : {};
    
    const enhancedContext = {
      ...baseContext,
      astInsights,
      frameworksDetected: astInsights.frameworks,
      apiEndpointsFound: astInsights.apiEndpoints,
      databaseUsage: astInsights.hasDatabase,
      environmentVariables: astInsights.environmentVars
    };
    
    return {
      repoInfo,
      files: analysis.files,
      estimation: analysis.estimation,
      architecturalContext: enhancedContext,
      astInsights,
      // Expose dependency artifacts for QA and downstream use
      dependencyGraph,
      entryPointAnalysis,
      dependencyTrackerGraph,
    };
    
  } catch (error) {
    console.warn(`[ENHANCED_ANALYSIS] AST analysis failed, using basic analysis:`, error);
    
    // Fallback to basic analysis without AST
    return {
      repoInfo,
      files: analysis.files,
      estimation: analysis.estimation,
      architecturalContext: analysis.architecturalContext,
      astInsights: null,
      dependencyGraph,
      entryPointAnalysis,
      dependencyTrackerGraph,
    };
  }
}

// Helper function to get canonical repository information (handles redirects)
async function getCanonicalRepositoryInfo(owner: string, repo: string, token?: string) {
  const github = new GitHubService(getGitHubToken(token));
  
  try {
    // Get the current repository information - GitHub API will follow redirects
    const repoInfo = await github.getRepositoryInfo(owner, repo);
    
    // Extract the actual owner/repo from the returned info in case of redirect
    const actualOwner = repoInfo.fullName.split('/')[0]!;
    const actualRepo = repoInfo.fullName.split('/')[1]!;
    
    return {
      original: { owner, repo },
      actual: { owner: actualOwner, repo: actualRepo },
      redirected: repoInfo.fullName !== `${owner}/${repo}`,
      repoInfo
    };
  } catch (error) {
    // If we can't get repo info, return the original values
    console.warn(`[Analysis] Failed to get canonical repo info for ${owner}/${repo}:`, error);
    return {
      original: { owner, repo },
      actual: { owner, repo },
      redirected: false,
      repoInfo: null
    };
  }
}

export const githubRouter = createTRPCRouter({
  // List my analyzed repositories (latest per repo), most recent first
  listMyAnalyzedRepos: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).optional(), all: z.boolean().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const { userId } = await auth();
      if (!userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
      }

      const limit = input?.all ? undefined : (input?.limit ?? 10);

      // Fetch recent analyses for this user, newest first
      const rows = await ctx.db.query.repositoryAnalyses.findMany({
        where: eq(repositoryAnalyses.userId, userId),
        orderBy: (tbl, { desc }) => [desc(tbl.createdAt)],
      });

      // Deduplicate by repositoryFullName, keeping the latest
      const seen = new Set<string>();
      const deduped: Array<{ fullName: string; lastAnalyzedAt: Date; latestStatus: string; isPrivate: boolean }>= [];
      for (const r of rows) {
        const fullName = r.repositoryFullName;
        if (!fullName || seen.has(fullName)) continue;
        seen.add(fullName);
        deduped.push({
          fullName,
          lastAnalyzedAt: r.createdAt,
          latestStatus: r.status,
          isPrivate: (r.isPrivate ?? 0) === 1,
        });
        if (limit && deduped.length >= limit) break;
      }

      const hasMore = rows.some(r => !seen.has(r.repositoryFullName));
      return { repos: deduped, hasMore };
    }),
  // List distinct repos that have analyses for a given owner
  listReposByOwner: protectedProcedure
    .input(z.object({ owner: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const prefix = `${input.owner}/`;
        const rows = await ctx.db
          .select({ fullName: repositoryAnalyses.repositoryFullName })
          .from(repositoryAnalyses)
          .where(like(repositoryAnalyses.repositoryFullName, `${prefix}%`));

        const repoCounts = new Map<string, number>();
        for (const r of rows) {
          const [, repo] = r.fullName.split('/');
          if (repo) repoCounts.set(repo, (repoCounts.get(repo) ?? 0) + 1);
        }

        const repos = Array.from(repoCounts.entries())
          .map(([repo, count]) => ({ repo, count }))
          .sort((a, b) => a.repo.localeCompare(b.repo));

        return { success: true, owner: input.owner, repos };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to list repositories for owner',
        });
      }
    }),
  // Validate GitHub URL and get repository info
  validateRepository: protectedProcedure
    .input(z.object({
      url: z.string().url(),
      token: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const parsed = GitHubService.parseGitHubUrl(input.url);
        if (!parsed) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid GitHub URL format',
          });
        }

        const github = new GitHubService(getGitHubToken(input.token));
        const repoInfo = await github.getRepositoryInfo(parsed.owner, parsed.repo);
        
        return {
          success: true,
          repository: repoInfo,
          owner: parsed.owner,
          repo: parsed.repo,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes('Not Found')) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Repository not found or not accessible',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to validate repository',
        });
      }
    }),

  // Get analysis estimation
  getAnalysisEstimation: protectedProcedure
    .input(z.object({
      owner: z.string(),
      repo: z.string(),
      token: z.string().optional(),
      branch: z.string().optional(),
      includeDeps: z.boolean().optional().default(false),
    }))
    .mutation(async ({ input }) => {
             try {
                 console.log(`[Estimation] Running enhanced estimation for ${input.owner}/${input.repo}`);
        
        const { files, estimation, astInsights, dependencyGraph, entryPointAnalysis, dependencyTrackerGraph } = await runEnhancedAnalysis(
          input.owner,
          input.repo,
          input.branch,
          10,
          input.token
        );

        return {
          success: true,
          estimation,
          fileCount: files.length,
          selectedFiles: files.map(f => ({
            path: f.path,
            type: 'code',
            importance: 1.0,
            size: f.content.length,
          })),
          astInsights: astInsights ? {
            frameworks: astInsights.frameworks,
            apiEndpoints: astInsights.totalEndpoints,
            hasDatabase: astInsights.hasDatabase
          } : null,
          // Optionally expose dependency artifacts for QA
          ...(input.includeDeps ? {
            entryPointAnalysis,
            dependencyGraph,
            dependencyTrackerGraph,
            dependencySummary: (() => {
              if (!dependencyTrackerGraph?.statistics) return null;
              const stats = dependencyTrackerGraph.statistics;
              const refTypeCounts: Record<string, number> = {};
              for (const e of dependencyTrackerGraph.edges) {
                for (const t of e.types) refTypeCounts[t] = (refTypeCounts[t] ?? 0) + 1;
              }
              return {
                totalNodes: stats.totalNodes,
                totalEdges: stats.totalEdges,
                maxDepth: stats.maxDepth,
                entryPoints: stats.entryPoints,
                topHubs: stats.hubNodes.slice(0, 10),
                refTypeCounts,
                frameworks: entryPointAnalysis?.detectedFrameworks ?? [],
              };
            })()
          } : {}),
        };
       } catch (error) {
         throw new TRPCError({
           code: 'INTERNAL_SERVER_ERROR',
           message: error instanceof Error ? error.message : 'Failed to estimate analysis cost',
         });
       }
    }),

  // Start repository analysis
  analyzeRepository: protectedProcedure
    .input(z.object({
      playgroundId: z.string(),
      owner: z.string(),
      repo: z.string(),
      isPrivate: z.boolean().default(false),
      token: z.string().optional(),
      branch: z.string().optional(),
      dependencyDepth: z.number().min(1).max(10).default(3),
    }))
    .mutation(async ({ input, ctx }) => {
      const startTime = Date.now();
      const repositoryFullName = `${input.owner}/${input.repo}`;
      console.log(`[Analysis] Starting playground-based analysis for ${repositoryFullName} with smart dynamic selection`);
      
      try {
        const { userId } = await auth();
        if (!userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Not authenticated',
          });
        }

        // Get canonical repository information (handles redirects)
        const github = new GitHubService(getGitHubToken(input.token));
        console.log(`[Analysis] Getting canonical repository info for ${input.owner}/${input.repo}`);
        const canonicalInfo = await getCanonicalRepositoryInfo(input.owner, input.repo, input.token);
        
        if (canonicalInfo.redirected) {
          console.log(`[Analysis] Repository ${input.owner}/${input.repo} redirects to ${canonicalInfo.actual.owner}/${canonicalInfo.actual.repo}`);
        }

        // Use canonical repository information for file analysis
        const targetOwner = canonicalInfo.actual.owner;
        const targetRepo = canonicalInfo.actual.repo;
        
        console.log(`[Analysis] Running enhanced analysis for ${targetOwner}/${targetRepo} (canonical)`);
        const { 
          repoInfo,
          files,
          estimation,
          architecturalContext,
          astInsights
        } = await runEnhancedAnalysis(
          targetOwner,
          targetRepo,
          input.branch,
          input.dependencyDepth,
          input.token
        );

        console.log(`==============================================`);
        console.log(`[Analysis] Architectural context: ${JSON.stringify(architecturalContext)}`);
        console.log(`==============================================`);

        // Get repository info and current commit SHA using canonical information
        const finalRepoInfo = canonicalInfo.repoInfo ?? repoInfo;
        let currentCommitSha: string;
        
        try {
          currentCommitSha = await github.getCurrentCommitSha(targetOwner, targetRepo, input.branch ?? finalRepoInfo.defaultBranch);
        } catch (error) {
          console.warn(`[Analysis] Failed to get current commit SHA for ${targetOwner}/${targetRepo}:`, error);
          currentCommitSha = '';
        }

        console.log(`[Analysis] Found ${files.length} files for analysis, estimated tokens: ${estimation.estimatedInputTokens + estimation.estimatedOutputTokens}`);

        // In a real implementation, you'd check user credits here
        // For now, we'll proceed with the analysis
        // const requiredCredits = Math.ceil(estimation.estimatedCost * 100);

        // Create repository analysis record in database
        let analysisRecord;
        try {
          console.log(`[Analysis] Creating analysis record for playground ${input.playgroundId}`);
          
          const [record] = await ctx.db
            .insert(repositoryAnalyses)
            .values({
              playgroundId: input.playgroundId,
              userId: userId,
              repositoryUrl: `https://github.com/${targetOwner}/${targetRepo}`,
              repositoryFullName: finalRepoInfo.fullName,
              branch: input.branch ?? finalRepoInfo.defaultBranch,
              analyzedCommitSha: currentCommitSha,
              isPrivate: input.isPrivate ? 1 : 0,
              status: 'analyzing',
              analysisDepth: 'dynamic',
              estimatedTokens: estimation.estimatedInputTokens + estimation.estimatedOutputTokens,
              actualTokensUsed: 0,
              detectedLanguages: finalRepoInfo.language ? [finalRepoInfo.language] : [],
              identifiedComponents: null,
              expertAnalyses: null,
              analysisLog: null,
            })
            .returning();

          analysisRecord = record;
          
          if (!analysisRecord) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create analysis record',
            });
          }
          
          console.log(`[Analysis] Created analysis record ${analysisRecord.id} for ${repositoryFullName}`);
        } catch (dbError) {
          console.error(`[Analysis] Failed to create analysis record for ${repositoryFullName}:`, dbError);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create analysis record in database',
          });
        }

        // Run LLM analysis using existing AnalysisService with enhanced data
        console.log(`[Analysis] Starting LLM analysis for ${repositoryFullName} (analysis ID: ${analysisRecord.id}) with enhanced data`);
        
        // Import AnalysisService for LLM processing
        const { AnalysisService } = await import('@/lib/github/analysis-service');
        const analysisService = new AnalysisService();
        
        // Run analysis with selected LLM input mode
        const filesForLLM = files; // profile-driven content selection already applied upstream
        analysisService.analyzeRepository(filesForLLM, finalRepoInfo, undefined, JSON.stringify(architecturalContext))
          .then(async (analysisResult) => {
            try {
              console.log(`[Analysis] LLM analysis completed for ${repositoryFullName} (analysis ID: ${analysisRecord.id}), updating database`);
              
              // Update the analysis record with results
              await ctx.db
                .update(repositoryAnalyses)
                .set({
                  status: 'completed',
                  actualTokensUsed: (() => {
                    const maybe: unknown = (analysisResult as unknown as { estimatedCosts?: { tokensUsed?: number } })?.estimatedCosts?.tokensUsed;
                    if (typeof maybe === 'number' && Number.isFinite(maybe)) return maybe;
                    return estimation.estimatedInputTokens + estimation.estimatedOutputTokens;
                  })(),
                  expertAnalyses: JSON.stringify(analysisResult),
                  identifiedComponents: JSON.stringify(analysisResult.nodes ?? []),
                  analysisLog: JSON.stringify([
                    `Enhanced analysis completed with ${files.length} files`,
                    astInsights ? `AST insights: ${astInsights.frameworks.length} frameworks, ${astInsights.totalEndpoints} endpoints` : 'No AST insights'
                  ]),
                  completedAt: new Date(),
                })
                .where(eq(repositoryAnalyses.id, analysisRecord.id));
              
              console.log(`[Analysis] Successfully saved analysis results for ${repositoryFullName} (analysis ID: ${analysisRecord.id})`);
            } catch (updateError) {
              console.error(`[Analysis] Failed to update analysis record ${analysisRecord.id} with results:`, updateError);
              
              // Try to mark as failed even if we can't save the results
              try {
                await ctx.db
                  .update(repositoryAnalyses)
                  .set({
                    status: 'failed',
                    errorMessage: 'Failed to save analysis results',
                  })
                  .where(eq(repositoryAnalyses.id, analysisRecord.id));
              } catch (failureUpdateError) {
                console.error(`[Analysis] Failed to update analysis record ${analysisRecord.id} with failure status:`, failureUpdateError);
              }
            }
          })
          .catch(async (error) => {
            console.error(`[Analysis] Analysis failed for ${repositoryFullName} (analysis ID: ${analysisRecord.id}):`, error);
            
            // Update the analysis record with error
            try {
              await ctx.db
                .update(repositoryAnalyses)
                .set({
                  status: 'failed',
                  errorMessage: error instanceof Error ? error.message : 'Analysis failed',
                })
                .where(eq(repositoryAnalyses.id, analysisRecord.id));
              
              console.log(`[Analysis] Updated analysis record ${analysisRecord.id} with failure status`);
            } catch (updateError) {
              console.error(`[Analysis] Failed to update analysis record ${analysisRecord.id} with error status:`, updateError);
            }
          });

        console.log(`[Analysis] Analysis setup completed for ${repositoryFullName} in ${Date.now() - startTime}ms`);

        return {
          success: true,
          analysisId: analysisRecord.id,
          estimation,
          message: 'Analysis started successfully',
        };
      } catch (error) {
        console.error(`[Analysis] Failed to start analysis for ${input.owner}/${input.repo}:`, error);
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to start repository analysis',
        });
      }
    }),

  // Get analysis status
  getAnalysisStatus: protectedProcedure
    .input(z.object({
      analysisId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const analysis = await ctx.db.query.repositoryAnalyses.findFirst({
          where: eq(repositoryAnalyses.id, input.analysisId),
        });

        if (!analysis) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Analysis not found',
          });
        }

        // Parse analysis results if completed
        let analysisResults = null;
        if (analysis.status === 'completed' && analysis.expertAnalyses) {
          try {
            // expertAnalyses is a JSONB field, so it's already parsed as an object
            // Only parse if it's actually a string
            if (typeof analysis.expertAnalyses === 'string') {
              analysisResults = JSON.parse(analysis.expertAnalyses);
            } else {
              // It's already an object
              analysisResults = analysis.expertAnalyses;
            }
          } catch (error) {
            console.warn('Failed to parse analysis results:', error);
          }
        }

        return {
          success: true,
          analysis: {
            id: analysis.id,
            status: analysis.status,
            repositoryName: analysis.repositoryFullName,
            repositoryUrl: analysis.repositoryUrl,
            analysisDepth: analysis.analysisDepth ?? 'standard', // Use stored depth with fallback
            actualTokensUsed: analysis.actualTokensUsed ?? 0,
            estimatedTokens: analysis.estimatedTokens ?? 0,
            estimatedCost: 0, // Default fallback since not stored
            actualCost: 0, // Default fallback since not stored 
            fileCount: 0, // Default fallback since not stored
            detectedLanguage: analysis.detectedLanguages?.[0] ?? null,
            createdAt: analysis.createdAt,
            completedAt: analysis.completedAt,
            errorMessage: analysis.errorMessage,
            results: analysisResults,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get analysis status',
        });
      }
    }),



  // Standalone repository analysis (without playground)
  analyzeRepositoryStandalone: protectedProcedure
    .input(z.object({
      owner: z.string(),
      repo: z.string(),
      isPrivate: z.boolean().default(false),
      privacyMode: z.boolean().default(true),
      token: z.string().optional(),
      branch: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const startTime = Date.now();
      console.log(`[Analysis] Starting analysis for ${input.owner}/${input.repo} with smart dynamic selection`);
      
      try {
        const { userId } = await auth();
        if (!userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Not authenticated',
          });
        }

        const github = new GitHubService(getGitHubToken(input.token));
        const repositoryFullName = `${input.owner}/${input.repo}`;

        // Get canonical repository information (handles redirects)
        console.log(`[Analysis] Getting canonical repository info for ${input.owner}/${input.repo}`);
        const canonicalInfo = await getCanonicalRepositoryInfo(input.owner, input.repo, input.token);
        
        if (canonicalInfo.redirected) {
          console.log(`[Analysis] Repository ${input.owner}/${input.repo} redirects to ${canonicalInfo.actual.owner}/${canonicalInfo.actual.repo}`);
        }

        // analyzeRepositoryStandalone creates a fresh analysis without checking for existing ones

        // Get repository info and current commit SHA using the canonical information
        const initialRepoInfo = canonicalInfo.repoInfo ?? await github.getRepositoryInfo(input.owner, input.repo);
        let currentCommitSha: string;
        
        try {
          // Use canonical repository info for commit SHA comparison
          const targetOwner = canonicalInfo.actual.owner;
          const targetRepo = canonicalInfo.actual.repo;
          currentCommitSha = await github.getCurrentCommitSha(targetOwner, targetRepo, input.branch ?? initialRepoInfo.defaultBranch);
          console.log(`[Analysis] Current commit SHA for ${targetOwner}/${targetRepo}: ${currentCommitSha}`);
        } catch (error) {
          console.warn(`[Analysis] Failed to get current commit SHA for ${repositoryFullName}, proceeding with new analysis:`, error);
          currentCommitSha = '';
        }

        // analyzeRepositoryStandalone always creates a new analysis since the UI
        // already handles showing existing analyses and letting users choose to reuse them.
        // When users call this endpoint, they explicitly want a fresh analysis.
        
        // Use canonical repository information for file analysis
        const targetOwner = canonicalInfo.actual.owner;
        const targetRepo = canonicalInfo.actual.repo;
        
        console.log(`[Analysis] Running enhanced analysis for ${targetOwner}/${targetRepo} (canonical)`);
        const { 
          repoInfo: enhancedRepoInfo,
          files,
          estimation,
          architecturalContext,
          astInsights
        } = await runEnhancedAnalysis(
          targetOwner,
          targetRepo,
          input.branch,
          10,
          input.token
        );

        console.log(`==============================================`);
        console.log(`[Analysis] Architectural context: ${JSON.stringify(architecturalContext)}`);
        console.log(`==============================================`);

        console.log(`[Analysis] Found ${files.length} files for analysis, estimated tokens: ${estimation.estimatedInputTokens + estimation.estimatedOutputTokens}`);

        // Use a transaction to ensure atomic creation of playground and analysis record
        const result = await ctx.db.transaction(async (tx) => {
          console.log(`[Analysis] Creating temporary playground for ${repositoryFullName}`);
          
          // Create a temporary playground for the analysis
          const [tempPlayground] = await tx
            .insert(playgrounds)
            .values({
              title: `Analysis: ${input.owner}/${input.repo}`,
              jsonBlob: { nodes: [], edges: [] },
              ownerId: userId,
              ownerType: 'user',
              createdBy: userId,
              updatedBy: userId,
              description: `Temporary playground for repository analysis`,
              tags: 'analysis,temporary',
              isPublic: 0,
            })
            .returning();

          if (!tempPlayground) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create temporary playground',
            });
          }

          console.log(`[Analysis] Created playground ${tempPlayground.id}, creating analysis record for ${repositoryFullName}`);

          // Create repository analysis record in database
          const [analysisRecord] = await tx
            .insert(repositoryAnalyses)
            .values({
              playgroundId: tempPlayground.id,
              userId: userId,
              repositoryUrl: `https://github.com/${canonicalInfo.actual.owner}/${canonicalInfo.actual.repo}`, // Use canonical URL
              repositoryFullName: enhancedRepoInfo.fullName, // Use canonical full name from repoInfo
              branch: input.branch ?? enhancedRepoInfo.defaultBranch,
              analyzedCommitSha: currentCommitSha,
              isPrivate: input.isPrivate ? 1 : 0,
              privacyMode: input.privacyMode ? 1 : 0,
              status: 'analyzing',
              analysisDepth: 'dynamic',
              estimatedTokens: estimation.estimatedInputTokens + estimation.estimatedOutputTokens,
              actualTokensUsed: 0,
              detectedLanguages: enhancedRepoInfo.language ? [enhancedRepoInfo.language] : [],
              identifiedComponents: null,
              expertAnalyses: null,
              analysisLog: null,
            })
            .returning();

          if (!analysisRecord) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create analysis record',
            });
          }

          console.log(`[Analysis] Created analysis record ${analysisRecord.id} for ${repositoryFullName}`);
          return { analysisRecord, tempPlayground };
        });

        const { analysisRecord } = result;

        // Run LLM analysis using existing AnalysisService with enhanced data
        console.log(`[Analysis] Starting LLM analysis for ${repositoryFullName} (analysis ID: ${analysisRecord.id}) with enhanced data`);
        
        // Import AnalysisService for LLM processing
        const { AnalysisService } = await import('@/lib/github/analysis-service');
        const analysisService = new AnalysisService();
        
        // Run analysis with selected LLM input mode
        const filesForLLM = files;
        analysisService.analyzeRepository(filesForLLM, enhancedRepoInfo, undefined, JSON.stringify(architecturalContext))
          .then(async (analysisResult) => {
            try {
              console.log(`[Analysis] LLM analysis completed for ${repositoryFullName} (analysis ID: ${analysisRecord.id}), updating database`);
              
              // Update the analysis record with enhanced results
              await ctx.db
                .update(repositoryAnalyses)
                .set({
                  status: 'completed',
                  actualTokensUsed: estimation.estimatedInputTokens + estimation.estimatedOutputTokens,
                  expertAnalyses: JSON.stringify(analysisResult),
                  identifiedComponents: JSON.stringify(analysisResult.nodes ?? []),
                  analysisLog: JSON.stringify([
                    `Enhanced analysis completed with ${files.length} files`,
                    astInsights ? `AST insights: ${astInsights.frameworks.length} frameworks, ${astInsights.totalEndpoints} endpoints` : 'No AST insights'
                  ]),
                  completedAt: new Date(),
                })
                .where(eq(repositoryAnalyses.id, analysisRecord.id));
              
              console.log(`[Analysis] Successfully saved analysis results for ${repositoryFullName} (analysis ID: ${analysisRecord.id})`);
            } catch (updateError) {
              console.error(`[Analysis] Failed to update analysis record ${analysisRecord.id} with results:`, updateError);
              
              // Try to mark as failed even if we can't save the results
              try {
                await ctx.db
                  .update(repositoryAnalyses)
                  .set({
                    status: 'failed',
                    errorMessage: 'Failed to save analysis results',
                  })
                  .where(eq(repositoryAnalyses.id, analysisRecord.id));
              } catch (failureUpdateError) {
                console.error(`[Analysis] Failed to update analysis record ${analysisRecord.id} with failure status:`, failureUpdateError);
              }
            }
          })
          .catch(async (error) => {
            console.error(`[Analysis] Analysis failed for ${repositoryFullName} (analysis ID: ${analysisRecord.id}):`, error);
            
            // Update the analysis record with error
            try {
              await ctx.db
                .update(repositoryAnalyses)
                .set({
                  status: 'failed',
                  errorMessage: error instanceof Error ? error.message : 'Analysis failed',
                })
                .where(eq(repositoryAnalyses.id, analysisRecord.id));
              
              console.log(`[Analysis] Updated analysis record ${analysisRecord.id} with failure status`);
            } catch (updateError) {
              console.error(`[Analysis] Failed to update analysis record ${analysisRecord.id} with error status:`, updateError);
            }
          });

        console.log(`[Analysis] Analysis setup completed for ${repositoryFullName} in ${Date.now() - startTime}ms`);

        return {
          success: true,
          analysisId: analysisRecord.id,
          estimation,
          message: 'Analysis started successfully',
          reused: false,
        };
      } catch (error) {
        console.error(`[Analysis] Failed to start analysis for ${input.owner}/${input.repo}:`, error);
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to start repository analysis',
        });
      }
    }),

  // Check for existing analysis and its freshness
  checkExistingAnalysis: protectedProcedure
    .input(z.object({
      owner: z.string(),
      repo: z.string(),
      branch: z.string().optional(),
      token: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { userId } = await auth();
        if (!userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Not authenticated',
          });
        }

        const repositoryFullName = `${input.owner}/${input.repo}`;
        const repositoryUrl = `https://github.com/${input.owner}/${input.repo}`;

        console.log(`[Analysis] Checking for existing analyses for ${repositoryFullName}`);

        // Get canonical repository information (handles redirects)
        const canonicalInfo = await getCanonicalRepositoryInfo(input.owner, input.repo, input.token);
        
        if (canonicalInfo.redirected) {
          console.log(`[Analysis] Repository ${input.owner}/${input.repo} redirects to ${canonicalInfo.actual.owner}/${canonicalInfo.actual.repo}`);
        }

        // Search for existing analyses using multiple criteria to handle renames
        const searchCriteria = [
          // Current requested name/URL
          eq(repositoryAnalyses.repositoryFullName, repositoryFullName),
          eq(repositoryAnalyses.repositoryUrl, repositoryUrl),
        ];

        // If repository was redirected, also search for the canonical name/URL
        if (canonicalInfo.redirected && canonicalInfo.repoInfo) {
          const canonicalFullName = canonicalInfo.repoInfo.fullName;
          const canonicalUrl = `https://github.com/${canonicalFullName}`;
          
          searchCriteria.push(
            eq(repositoryAnalyses.repositoryFullName, canonicalFullName),
            eq(repositoryAnalyses.repositoryUrl, canonicalUrl)
          );
          
          console.log(`[Analysis] Also searching for analyses under canonical name: ${canonicalFullName}`);
        }

        // Find existing analyses for this repository (from any user)
        const existingAnalyses = await ctx.db.query.repositoryAnalyses.findMany({
          where: or(...searchCriteria),
          orderBy: (analyses, { desc }) => [desc(analyses.createdAt)],
          limit: 20, // Increased limit to account for potential duplicates from renames
        });

        console.log(`[Analysis] Found ${existingAnalyses.length} existing analyses for ${repositoryFullName}`);
        if (existingAnalyses.length > 0) {
          console.log(`[Analysis] Existing analyses details:`, existingAnalyses.map(a => ({
            id: a.id, 
            name: a.repositoryFullName, 
            url: a.repositoryUrl, 
            status: a.status,
            createdAt: a.createdAt.toISOString()
          })));
        }

        if (existingAnalyses.length === 0) {
          return {
            success: true,
            hasExistingAnalysis: false,
            analyses: [],
          };
        }

        // Get current commit SHA to compare freshness
        const github = new GitHubService(getGitHubToken(input.token));
        let currentCommitSha: string;
        let rateLimitError: string | null = null;
        
        try {
          // Use canonical repository info for commit SHA comparison
          const targetOwner = canonicalInfo.actual.owner;
          const targetRepo = canonicalInfo.actual.repo;
          currentCommitSha = await github.getCurrentCommitSha(targetOwner, targetRepo, input.branch);
          console.log(`[Analysis] Current commit SHA for ${targetOwner}/${targetRepo}: ${currentCommitSha}`);
        } catch (error) {
          console.warn('Failed to get current commit SHA:', error);
          
          // Check if it's a rate limit error and preserve the message
          if (error instanceof Error && error.message.includes('rate limit')) {
            rateLimitError = error.message;
          }
          
          // Return existing analyses without freshness check
          return {
            success: true,
            hasExistingAnalysis: true,
            rateLimitError,
            analyses: existingAnalyses.map(analysis => ({
              id: analysis.id,
              status: analysis.status,
              createdAt: analysis.createdAt,
              completedAt: analysis.completedAt,
              analyzedCommitSha: analysis.analyzedCommitSha,
              repositoryUrl: analysis.repositoryUrl,
              errorMessage: analysis.errorMessage,
              isFresh: null, // Cannot determine without current SHA
              commitsBehind: null,
              isOwnedByUser: analysis.userId === userId,
            })),
          };
        }

        // Check freshness for each analysis
        const analysesWithFreshness = await Promise.all(
          existingAnalyses.map(async (analysis) => {
            let isFresh: boolean | null = null;
            let commitsBehind: number | null = null;
            let recentCommits: Array<{ sha: string; message: string; date: string }> = [];

            if (analysis.analyzedCommitSha && analysis.status === 'completed') {
              try {
                // For commit comparison, use the canonical repository info
                const targetOwner = canonicalInfo.actual.owner;
                const targetRepo = canonicalInfo.actual.repo;
                
                console.log(`[Analysis] Checking freshness for analysis ${analysis.id}: ${analysis.analyzedCommitSha} vs ${currentCommitSha}`);
                const comparison = await github.getCommitsBehind(
                  targetOwner,
                  targetRepo,
                  analysis.analyzedCommitSha,
                  currentCommitSha
                );
                commitsBehind = comparison.commitsBehind;
                recentCommits = comparison.commits.slice(0, 5); // Show last 5 commits
                isFresh = github.isAnalysisFresh(commitsBehind);
              } catch (error) {
                console.warn('Failed to check commits behind:', error);
                // Analysis exists but we can't determine freshness
              }
            }

            return {
              id: analysis.id,
              status: analysis.status,
              createdAt: analysis.createdAt,
              completedAt: analysis.completedAt,
              analyzedCommitSha: analysis.analyzedCommitSha,
              repositoryUrl: analysis.repositoryUrl,
              errorMessage: analysis.errorMessage,
              isFresh,
              commitsBehind,
              recentCommits,
              isOwnedByUser: analysis.userId === userId,
            };
          })
        );

        return {
          success: true,
          hasExistingAnalysis: true,
          currentCommitSha,
          analyses: analysesWithFreshness,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to check existing analysis',
        });
      }
    }),
}); 