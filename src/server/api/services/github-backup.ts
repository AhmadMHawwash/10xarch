import { type Node, type Edge } from 'reactflow';

// Types for the service
export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  html_url: string;
}

export interface PlaygroundBackupData {
  id: string;
  title: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  metadata: {
    ownerId: string;
    ownerType: 'user' | 'organization';
    updatedBy: string;
    updatedAt: string;
    tags?: string;
    isPublic: boolean;
  };
}

export interface BackupResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  error?: string;
}

export interface VersionHistoryEntry {
  commitSha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface GitHubBackupConfig {
  token: string;
  repo: string;
  branch?: string;
}

// GitHub API response types
interface GitHubRef {
  object: {
    sha: string;
  };
}

interface GitHubCommitResponse {
  tree: {
    sha: string;
  };
}

interface GitHubBlobResponse {
  sha: string;
}

interface GitHubTreeResponse {
  sha: string;
}

interface GitHubCreateCommitResponse {
  sha: string;
}

interface GitHubFileContent {
  content: string;
}

interface GitHubCommitsResponse {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

export interface GitHubApiClient {
  get(path: string): Promise<unknown>;
  put(path: string, data: unknown): Promise<unknown>;
  post(path: string, data: unknown): Promise<unknown>;
}

// GitHub API client implementation
class GitHubApiClientImpl implements GitHubApiClient {
  private baseUrl = 'https://api.github.com';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request(method: string, path: string, data?: any): Promise<any> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': '10xarch/1.0',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  async get(path: string): Promise<any> {
    return this.request('GET', path);
  }

  async put(path: string, data: any): Promise<any> {
    return this.request('PUT', path, data);
  }

  async post(path: string, data: any): Promise<any> {
    return this.request('POST', path, data);
  }
}

// Main service class
export class GitHubBackupService {
  private client: GitHubApiClient;
  private config: GitHubBackupConfig;

  constructor(config: GitHubBackupConfig, client?: GitHubApiClient) {
    this.config = {
      branch: 'main',
      ...config,
    };
    this.client = client ?? new GitHubApiClientImpl(config.token);
  }

  /**
   * Commits a playground to GitHub repository
   */
  async commitPlayground(
    userId: string,
    playgroundId: string,
    data: PlaygroundBackupData,
  ): Promise<BackupResult> {
    try {
      const filePath = this.getPlaygroundPath(userId, playgroundId);
      const metadataPath = this.getMetadataPath(userId, playgroundId);
      const readmePath = this.getReadmePath(userId, playgroundId);

      // Prepare the content files
      const playgroundContent = JSON.stringify({
        nodes: data.nodes,
        edges: data.edges,
      }, null, 2);

      const metadataContent = JSON.stringify({
        id: data.id,
        title: data.title,
        description: data.description,
        metadata: data.metadata,
      }, null, 2);

      const readmeContent = this.generateReadmeContent(data);

             // Get the current commit SHA for the branch
       let branchRef: GitHubRef;
       let actualBranch = this.config.branch;
       
       try {
         branchRef = await this.client.get(
           `/repos/${this.config.repo}/git/refs/heads/${this.config.branch}`
         ) as GitHubRef;
       } catch (error) {
         // If main branch doesn't exist, try master
         if (this.config.branch === 'main') {
           console.log('Main branch not found, trying master branch...');
           branchRef = await this.client.get(
             `/repos/${this.config.repo}/git/refs/heads/master`
           ) as GitHubRef;
           actualBranch = 'master';
         } else {
           throw error;
         }
       }
       
       const baseSha = branchRef.object.sha;

       // Get the current tree
       const baseCommit = await this.client.get(
         `/repos/${this.config.repo}/git/commits/${baseSha}`
       ) as GitHubCommitResponse;
       const baseTreeSha = baseCommit.tree.sha;

      // Create blobs for the new content
      const [playgroundBlob, metadataBlob, readmeBlob] = await Promise.all([
        this.client.post(`/repos/${this.config.repo}/git/blobs`, {
          content: Buffer.from(playgroundContent).toString('base64'),
          encoding: 'base64',
        }) as Promise<GitHubBlobResponse>,
        this.client.post(`/repos/${this.config.repo}/git/blobs`, {
          content: Buffer.from(metadataContent).toString('base64'),
          encoding: 'base64',
        }) as Promise<GitHubBlobResponse>,
        this.client.post(`/repos/${this.config.repo}/git/blobs`, {
          content: Buffer.from(readmeContent).toString('base64'),
          encoding: 'base64',
        }) as Promise<GitHubBlobResponse>,
      ]);

      // Create a new tree with the updated files
      const newTree = await this.client.post(`/repos/${this.config.repo}/git/trees`, {
        base_tree: baseTreeSha,
        tree: [
          {
            path: filePath,
            mode: '100644',
            type: 'blob',
            sha: playgroundBlob.sha,
          },
          {
            path: metadataPath,
            mode: '100644',
            type: 'blob',
            sha: metadataBlob.sha,
          },
          {
            path: readmePath,
            mode: '100644',
            type: 'blob',
            sha: readmeBlob.sha,
          },
        ],
      }) as GitHubTreeResponse;

      // Create a new commit
      const commitMessage = this.generateCommitMessage(data);
      const newCommit = await this.client.post(`/repos/${this.config.repo}/git/commits`, {
        message: commitMessage,
        tree: newTree.sha,
        parents: [baseSha],
        author: {
          name: 'System Design Playground',
          email: 'noreply@10xarch.com',
          date: new Date().toISOString(),
        },
      }) as GitHubCreateCommitResponse;

      // Update the branch to point to the new commit
      await this.client.post(`/repos/${this.config.repo}/git/refs/heads/${actualBranch}`, {
        sha: newCommit.sha,
        force: false,
      });

      return {
        success: true,
        commitSha: newCommit.sha,
        commitUrl: `https://github.com/${this.config.repo}/commit/${newCommit.sha}`,
      };
    } catch (error) {
      console.error('GitHub backup failed:', error);
      
      // Enhanced error reporting for debugging
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Special handling for common 403 errors
        if (errorMessage.includes('403')) {
          console.error('🚨 GitHub API 403 Error Details:');
          console.error('- Repository:', this.config.repo);
          console.error('- Branch:', this.config.branch);
          console.error('- This usually indicates:');
          console.error('  1. Missing Contents permission (Read & Write)');
          console.error('  2. Missing SSO authorization for organization');
          console.error('  3. Repository doesn\'t exist or branch missing');
          console.error('  4. Token doesn\'t have access to this repository');
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Gets version history for a playground
   */
  async getVersionHistory(
    userId: string,
    playgroundId: string,
    limit = 20,
  ): Promise<VersionHistoryEntry[]> {
    try {
      const filePath = this.getPlaygroundPath(userId, playgroundId);
      
      const commits = await this.client.get(
        `/repos/${this.config.repo}/commits?path=${filePath}&per_page=${limit}`
      ) as GitHubCommitsResponse[];

      return commits.map((commit: GitHubCommitsResponse) => ({
        commitSha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url,
      }));
    } catch (error) {
      console.error('Failed to get version history:', error);
      return [];
    }
  }

  /**
   * Restores a playground from a specific commit
   */
  async restoreVersion(
    userId: string,
    playgroundId: string,
    commitSha: string,
  ): Promise<PlaygroundBackupData | null> {
    try {
      const filePath = this.getPlaygroundPath(userId, playgroundId);
      const metadataPath = this.getMetadataPath(userId, playgroundId);

      // Get the file content at the specific commit
      const [playgroundFile, metadataFile] = await Promise.all([
        this.client.get(`/repos/${this.config.repo}/contents/${filePath}?ref=${commitSha}`) as Promise<GitHubFileContent>,
        this.client.get(`/repos/${this.config.repo}/contents/${metadataPath}?ref=${commitSha}`) as Promise<GitHubFileContent>,
      ]);

      // Decode the content
      const playgroundContent = JSON.parse(
        Buffer.from(playgroundFile.content, 'base64').toString('utf-8')
      ) as { nodes: Node[]; edges: Edge[] };
      
      const metadataContent = JSON.parse(
        Buffer.from(metadataFile.content, 'base64').toString('utf-8')
      ) as {
        id: string;
        title: string;
        description?: string;
        metadata: PlaygroundBackupData['metadata'];
      };

      return {
        id: metadataContent.id,
        title: metadataContent.title,
        description: metadataContent.description,
        nodes: playgroundContent.nodes,
        edges: playgroundContent.edges,
        metadata: metadataContent.metadata,
      };
    } catch (error) {
      console.error('❌ GitHub restore failed:', error);
      return null;
    }
  }

  /**
   * Checks if the service is properly configured and accessible
   */
  async healthCheck(): Promise<{ healthy: boolean; error?: string }> {
    try {
      // Try to access the repository
      await this.client.get(`/repos/${this.config.repo}`);
      return { healthy: true };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Private helper methods
  private getPlaygroundPath(userId: string, playgroundId: string): string {
    return `playgrounds/${userId}/${playgroundId}/playground.json`;
  }

  private getMetadataPath(userId: string, playgroundId: string): string {
    return `playgrounds/${userId}/${playgroundId}/metadata.json`;
  }

  private getReadmePath(userId: string, playgroundId: string): string {
    return `playgrounds/${userId}/${playgroundId}/README.md`;
  }

  private generateCommitMessage(data: PlaygroundBackupData): string {
    const action = 'Update'; // Could be 'Create' or 'Update' based on context
    return `${action} playground: ${data.title}\n\nPlayground ID: ${data.id}\nUpdated by: ${data.metadata.updatedBy}`;
  }

  private generateReadmeContent(data: PlaygroundBackupData): string {
    return `# ${data.title}

${data.description ? `## Description\n${data.description}\n` : ''}

## Playground Details
- **ID**: ${data.id}
- **Owner**: ${data.metadata.ownerId} (${data.metadata.ownerType})
- **Last Updated**: ${data.metadata.updatedAt}
- **Public**: ${data.metadata.isPublic ? 'Yes' : 'No'}
${data.metadata.tags ? `- **Tags**: ${data.metadata.tags}` : ''}

## System Components
- **Nodes**: ${data.nodes.length} components
- **Edges**: ${data.edges.length} connections

## Files
- \`playground.json\` - System design data (nodes and edges)
- \`metadata.json\` - Playground metadata and settings
- \`README.md\` - This human-readable description

---
*This backup was automatically generated by System Design Playground*
`;
  }
}

// Factory function to create the service with environment configuration
export function createGitHubBackupService(): GitHubBackupService | null {
  // Lazy import to avoid environment validation at module load time
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { env } = require('../../../env.js') as { env: any };
  
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const token = env.GITHUB_BACKUP_TOKEN as string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const repo = env.GITHUB_BACKUP_REPO as string | undefined;

  if (!token || !repo) {
    console.warn('GitHub backup not configured - missing GITHUB_BACKUP_TOKEN or GITHUB_BACKUP_REPO');
    return null;
  }

  return new GitHubBackupService({ token, repo });
}

// Singleton instance for the application
let instance: GitHubBackupService | null = null;

export function getGitHubBackupService(): GitHubBackupService | null {
  if (instance === null) {
    instance = createGitHubBackupService();
  }
  return instance;
} 