/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { describe, it, expect, vi, beforeEach, beforeAll, type MockedFunction } from 'vitest';
import { setupTestEnvironment } from '../../__tests__/test-utils';

// Setup environment before importing modules that validate env
setupTestEnvironment();

import { 
  GitHubBackupService, 
  type GitHubApiClient, 
  type PlaygroundBackupData,
  type GitHubBackupConfig
} from '../github-backup';

// Mock API client for testing
class MockGitHubApiClient implements GitHubApiClient {
  public getMock: MockedFunction<(path: string) => Promise<any>>;
  public putMock: MockedFunction<(path: string, data: any) => Promise<any>>;
  public postMock: MockedFunction<(path: string, data: any) => Promise<any>>;

  constructor() {
    this.getMock = vi.fn();
    this.putMock = vi.fn();
    this.postMock = vi.fn();
  }

  async get(path: string): Promise<any> {
    return this.getMock(path);
  }

  async put(path: string, data: any): Promise<any> {
    return this.putMock(path, data);
  }

  async post(path: string, data: any): Promise<any> {
    return this.postMock(path, data);
  }
}

describe('GitHubBackupService', () => {
  let service: GitHubBackupService;
  let mockClient: MockGitHubApiClient;
  let config: GitHubBackupConfig;

  beforeAll(() => {
    setupTestEnvironment();
  });

  const mockPlaygroundData: PlaygroundBackupData = {
    id: 'test-playground-id',
    title: 'Test Playground',
    description: 'A test playground for unit testing',
    nodes: [
      {
        id: 'node1',
        type: 'SystemComponentNode',
        position: { x: 100, y: 100 },
        data: { label: 'Test Node' },
      },
    ],
    edges: [
      {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
      },
    ],
    metadata: {
      ownerId: 'test-user-id',
      ownerType: 'user',
      updatedBy: 'test-user-id',
      updatedAt: '2024-01-01T00:00:00Z',
      isPublic: false,
      tags: 'test,playground',
    },
  };

  beforeEach(() => {
    config = {
      token: 'test-token',
      repo: 'test-owner/test-repo',
      branch: 'main',
    };
    mockClient = new MockGitHubApiClient();
    service = new GitHubBackupService(config, mockClient);
  });

  describe('constructor', () => {
    it('should create service with default branch', () => {
      const configWithoutBranch = { token: 'test', repo: 'test/repo' };
      const serviceWithDefaults = new GitHubBackupService(configWithoutBranch, mockClient);
      expect(serviceWithDefaults).toBeDefined();
    });

    it('should create service with custom branch', () => {
      expect(service).toBeDefined();
    });
  });

  describe('commitPlayground', () => {
    it('should successfully commit a playground', async () => {
      // Mock GitHub API responses
      mockClient.getMock
        .mockResolvedValueOnce({ object: { sha: 'base-commit-sha' } }) // branch ref
        .mockResolvedValueOnce({ tree: { sha: 'base-tree-sha' } }); // base commit

      mockClient.postMock
        .mockResolvedValueOnce({ sha: 'playground-blob-sha' }) // playground blob
        .mockResolvedValueOnce({ sha: 'metadata-blob-sha' }) // metadata blob
        .mockResolvedValueOnce({ sha: 'readme-blob-sha' }) // readme blob
        .mockResolvedValueOnce({ sha: 'new-tree-sha' }) // new tree
        .mockResolvedValueOnce({ sha: 'new-commit-sha' }) // new commit
        .mockResolvedValueOnce({ sha: 'new-commit-sha' }); // update ref

      const result = await service.commitPlayground('test-user', 'test-playground', mockPlaygroundData);

      expect(result.success).toBe(true);
      expect(result.commitSha).toBe('new-commit-sha');
      expect(result.commitUrl).toBe('https://github.com/test-owner/test-repo/commit/new-commit-sha');
      expect(result.error).toBeUndefined();

      // Verify API calls
      expect(mockClient.getMock).toHaveBeenCalledWith('/repos/test-owner/test-repo/git/refs/heads/main');
      expect(mockClient.getMock).toHaveBeenCalledWith('/repos/test-owner/test-repo/git/commits/base-commit-sha');
      expect(mockClient.postMock).toHaveBeenCalledTimes(6);
    });

    it('should handle API errors gracefully', async () => {
      // Mock both main and master branch calls to fail
      mockClient.getMock
        .mockRejectedValueOnce(new Error('GitHub API Error'))
        .mockRejectedValueOnce(new Error('GitHub API Error'));

      const result = await service.commitPlayground('test-user', 'test-playground', mockPlaygroundData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('GitHub API Error');
      expect(result.commitSha).toBeUndefined();
      expect(result.commitUrl).toBeUndefined();
    });

    it('should generate correct file paths', async () => {
      mockClient.getMock
        .mockResolvedValueOnce({ object: { sha: 'base-commit-sha' } })
        .mockResolvedValueOnce({ tree: { sha: 'base-tree-sha' } });

      mockClient.postMock
        .mockResolvedValueOnce({ sha: 'playground-blob-sha' })
        .mockResolvedValueOnce({ sha: 'metadata-blob-sha' })
        .mockResolvedValueOnce({ sha: 'readme-blob-sha' })
        .mockResolvedValueOnce({ sha: 'new-tree-sha' })
        .mockResolvedValueOnce({ sha: 'new-commit-sha' })
        .mockResolvedValueOnce({ sha: 'new-commit-sha' });

      await service.commitPlayground('test-user', 'test-playground', mockPlaygroundData);

      // Check that the tree creation includes correct paths
      const treeCall = mockClient.postMock.mock.calls.find(
        call => call[0] === '/repos/test-owner/test-repo/git/trees'
      );
      
      expect(treeCall).toBeDefined();
      const treeData = treeCall![1];
      expect(treeData.tree).toHaveLength(3);
      expect(treeData.tree[0].path).toBe('playgrounds/test-user/test-playground/playground.json');
      expect(treeData.tree[1].path).toBe('playgrounds/test-user/test-playground/metadata.json');
      expect(treeData.tree[2].path).toBe('playgrounds/test-user/test-playground/README.md');
    });
  });

  describe('getVersionHistory', () => {
    it('should return version history for a playground', async () => {
      const mockCommits = [
        {
          sha: 'commit1',
          commit: {
            message: 'Update playground: Test Playground',
            author: {
              name: 'Test User',
              date: '2024-01-01T00:00:00Z',
            },
          },
          html_url: 'https://github.com/test-owner/test-repo/commit/commit1',
        },
        {
          sha: 'commit2',
          commit: {
            message: 'Create playground: Test Playground',
            author: {
              name: 'Test User',
              date: '2023-12-31T00:00:00Z',
            },
          },
          html_url: 'https://github.com/test-owner/test-repo/commit/commit2',
        },
      ];

      mockClient.getMock.mockResolvedValueOnce(mockCommits);

      const history = await service.getVersionHistory('test-user', 'test-playground');

      expect(history).toHaveLength(2);
      expect(history?.[0]?.commitSha).toBe('commit1');
      expect(history?.[0]?.message).toBe('Update playground: Test Playground');
      expect(history?.[0]?.author).toBe('Test User');
      expect(mockClient.getMock).toHaveBeenCalledWith(
        '/repos/test-owner/test-repo/commits?path=playgrounds/test-user/test-playground/playground.json&per_page=20'
      );
    });

    it('should handle API errors and return empty array', async () => {
      mockClient.getMock.mockRejectedValueOnce(new Error('API Error'));

      const history = await service.getVersionHistory('test-user', 'test-playground');

      expect(history).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      mockClient.getMock.mockResolvedValueOnce([]);

      await service.getVersionHistory('test-user', 'test-playground', 5);

      expect(mockClient.getMock).toHaveBeenCalledWith(
        '/repos/test-owner/test-repo/commits?path=playgrounds/test-user/test-playground/playground.json&per_page=5'
      );
    });
  });

  describe('restoreVersion', () => {
    it('should restore playground from specific commit', async () => {
      const mockPlaygroundFile = {
        content: Buffer.from(JSON.stringify({
          nodes: mockPlaygroundData.nodes,
          edges: mockPlaygroundData.edges,
        })).toString('base64'),
      };

      const mockMetadataFile = {
        content: Buffer.from(JSON.stringify({
          id: mockPlaygroundData.id,
          title: mockPlaygroundData.title,
          description: mockPlaygroundData.description,
          metadata: mockPlaygroundData.metadata,
        })).toString('base64'),
      };

      mockClient.getMock
        .mockResolvedValueOnce(mockPlaygroundFile)
        .mockResolvedValueOnce(mockMetadataFile);

      const result = await service.restoreVersion('test-user', 'test-playground', 'commit-sha');

      expect(result).toEqual(mockPlaygroundData);
      expect(mockClient.getMock).toHaveBeenCalledWith(
        '/repos/test-owner/test-repo/contents/playgrounds/test-user/test-playground/playground.json?ref=commit-sha'
      );
      expect(mockClient.getMock).toHaveBeenCalledWith(
        '/repos/test-owner/test-repo/contents/playgrounds/test-user/test-playground/metadata.json?ref=commit-sha'
      );
    });

    it('should return null on API error', async () => {
      mockClient.getMock.mockRejectedValueOnce(new Error('Not found'));

      const result = await service.restoreVersion('test-user', 'test-playground', 'invalid-commit');

      expect(result).toBeNull();
    });
  });

  describe('healthCheck', () => {
    it('should return healthy when repository is accessible', async () => {
      mockClient.getMock.mockResolvedValueOnce({ name: 'test-repo' });

      const result = await service.healthCheck();

      expect(result.healthy).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockClient.getMock).toHaveBeenCalledWith('/repos/test-owner/test-repo');
    });

    it('should return unhealthy when repository is not accessible', async () => {
      mockClient.getMock.mockRejectedValueOnce(new Error('Repository not found'));

      const result = await service.healthCheck();

      expect(result.healthy).toBe(false);
      expect(result.error).toBe('Repository not found');
    });
  });
}); 