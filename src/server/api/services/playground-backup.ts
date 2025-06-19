import { type Node, type Edge } from 'reactflow';
import { eq } from 'drizzle-orm';
import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { backupHistory, playgrounds, type Playground } from '../../db/schema';
import type * as schema from '../../db/schema';
import { 
  getGitHubBackupService, 
  type PlaygroundBackupData, 
  type BackupResult 
} from './github-backup';

interface PlaygroundBackupService {
  backupPlayground(
    db: PostgresJsDatabase<typeof schema>,
    playground: Playground,
    userId: string,
    options?: {
      commitMessage?: string;
      authorEmail?: string;
      authorName?: string;
    }
  ): Promise<BackupResult>;
}

class PlaygroundBackupServiceImpl implements PlaygroundBackupService {
  private readonly maxRetries = 3;

  async backupPlayground(
    db: PostgresJsDatabase<typeof schema>,
    playground: Playground,
    userId: string,
    options?: {
      commitMessage?: string;
      authorEmail?: string;
      authorName?: string;
    }
  ): Promise<BackupResult> {
    const githubService = getGitHubBackupService();
    
    if (!githubService) {
      console.warn('GitHub backup service not configured - skipping backup');
      return {
        success: false,
        error: 'GitHub backup service not configured'
      };
    }

    // Set backup status to pending
    await db
      .update(playgrounds)
      .set({ 
        backupStatus: 'pending',
        updatedAt: new Date()
      })
      .where(eq(playgrounds.id, playground.id));

    // Prepare backup data - only content changes (nodes, edges, title, description)
    const backupData: PlaygroundBackupData = {
      id: playground.id,
      title: playground.title,
      description: playground.description ?? undefined,
      nodes: this.extractNodes(playground.jsonBlob),
      edges: this.extractEdges(playground.jsonBlob),
      metadata: {
        ownerId: playground.ownerId,
        ownerType: playground.ownerType === 'org' ? 'organization' : 'user',
        updatedBy: playground.updatedBy,
        updatedAt: playground.updatedAt.toISOString(),
        tags: playground.tags ?? undefined,
        isPublic: playground.isPublic === 1,
      },
      commitMessage: options?.commitMessage,
      authorEmail: options?.authorEmail,
      authorName: options?.authorName,
    };

    // Attempt backup with retry logic
    let lastError = 'Unknown error';
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`GitHub backup attempt ${attempt}/${this.maxRetries} for playground ${playground.id}`);
        
        const result = await githubService.commitPlayground(
          playground.ownerId,
          playground.id,
          backupData
        );

        if (result.success && result.commitSha && result.commitUrl) {
          // Success - update database
          await this.recordSuccessfulBackup(
            db,
            playground.id,
            result.commitSha,
            result.commitUrl,
            userId,
            backupData.commitMessage
          );
          
          console.log(`GitHub backup successful for playground ${playground.id}: ${result.commitUrl}`);
          return result;
        } else {
          lastError = result.error ?? 'Unknown backup error';
          console.warn(`GitHub backup attempt ${attempt} failed:`, lastError);
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.error(`GitHub backup attempt ${attempt} failed:`, error);
      }

      // Wait before retry (exponential backoff)
      if (attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // All retries failed - record failure
    await this.recordFailedBackup(
      db,
      playground.id,
      lastError,
      userId
    );

    console.error(`GitHub backup failed after ${this.maxRetries} attempts for playground ${playground.id}: ${lastError}`);
    
    return {
      success: false,
      error: `Backup failed after ${this.maxRetries} attempts: ${lastError}`
    };
  }

  private extractNodes(jsonBlob: unknown): Node[] {
    try {
      if (
        typeof jsonBlob === 'object' && 
        jsonBlob !== null && 
        'nodes' in jsonBlob && 
        Array.isArray(jsonBlob.nodes)
      ) {
        return jsonBlob.nodes as Node[];
      }
      return [];
    } catch (error) {
      console.warn('Failed to extract nodes from jsonBlob:', error);
      return [];
    }
  }

  private extractEdges(jsonBlob: unknown): Edge[] {
    try {
      if (
        typeof jsonBlob === 'object' && 
        jsonBlob !== null && 
        'edges' in jsonBlob && 
        Array.isArray(jsonBlob.edges)
      ) {
        return jsonBlob.edges as Edge[];
      }
      return [];
    } catch (error) {
      console.warn('Failed to extract edges from jsonBlob:', error);
      return [];
    }
  }

  private async recordSuccessfulBackup(
    db: PostgresJsDatabase<typeof schema>,
    playgroundId: string,
    commitSha: string,
    commitUrl: string,
    userId: string,
    commitMessage?: string
  ): Promise<void> {
    // Update playground status
    await db
      .update(playgrounds)
      .set({
        lastBackupCommitSha: commitSha,
        backupStatus: 'success',
        updatedAt: new Date()
      })
      .where(eq(playgrounds.id, playgroundId));

    // Record in backup history
    await db
      .insert(backupHistory)
      .values({
        playgroundId,
        commitSha,
        commitUrl,
        commitMessage: commitMessage ?? `Update playground backup`,
        status: 'success',
        createdBy: userId,
      });
  }

  private async recordFailedBackup(
    db: PostgresJsDatabase<typeof schema>,
    playgroundId: string,
    errorMessage: string,
    userId: string
  ): Promise<void> {
    // Update playground status
    await db
      .update(playgrounds)
      .set({
        backupStatus: 'failed',
        updatedAt: new Date()
      })
      .where(eq(playgrounds.id, playgroundId));

    // Record in backup history
    await db
      .insert(backupHistory)
      .values({
        playgroundId,
        commitSha: 'failed',
        commitUrl: '',
        commitMessage: 'Backup failed',
        status: 'failed',
        errorMessage,
        createdBy: userId,
      });
  }
}

// Export singleton instance
export const playgroundBackupService = new PlaygroundBackupServiceImpl();

// Export for testing
export { PlaygroundBackupServiceImpl }; 