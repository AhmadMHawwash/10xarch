/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { describe, it, expect, vi, beforeEach, beforeAll, type MockedFunction } from 'vitest';
import { setupTestEnvironment } from '../../__tests__/test-utils';
import { PlaygroundBackupServiceImpl } from '../playground-backup';
import type { PlaygroundBackupData, BackupResult } from '../github-backup';

// Mock timers
vi.useFakeTimers();

// Mock the entire github-backup module
vi.mock('../github-backup', () => ({
  getGitHubBackupService: vi.fn(),
}));

// Import the mocked function
import { getGitHubBackupService } from '../github-backup';

// Mock database
const mockDb = {
  update: vi.fn(() => mockDb),
  set: vi.fn(() => mockDb),
  where: vi.fn(() => mockDb),
  insert: vi.fn(() => mockDb),
  values: vi.fn(() => mockDb),
  returning: vi.fn().mockResolvedValue([{ id: 'test_backup_id' }]),
  transaction: vi.fn((callback: any) => callback(mockDb)),
};

// Mock GitHub service
class MockGitHubService {
  public commitPlaygroundMock: MockedFunction<any>;

  constructor() {
    this.commitPlaygroundMock = vi.fn();
  }

  async commitPlayground(...args: any[]): Promise<BackupResult> {
    return this.commitPlaygroundMock(...args);
  }
}

describe('PlaygroundBackupService', () => {
  let service: PlaygroundBackupServiceImpl;
  let mockGitHubService: MockGitHubService;
  
  beforeAll(() => {
    setupTestEnvironment();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PlaygroundBackupServiceImpl();
    mockGitHubService = new MockGitHubService();
    
    // Reset mock database call counts
    Object.values(mockDb).forEach(mock => {
      if (typeof mock === 'function' && 'mockClear' in mock) {
        mock.mockClear();
      }
    });
    
    // Mock the getGitHubBackupService to return our mock
    vi.mocked(getGitHubBackupService).mockReturnValue(mockGitHubService as any);
  });

  const mockPlayground = {
    id: 'test-playground-id',
    title: 'Test Playground',
    description: 'Test description',
    jsonBlob: {
      nodes: [{ id: 'node1', type: 'test', position: { x: 0, y: 0 }, data: {} }],
      edges: [{ id: 'edge1', source: 'node1', target: 'node2' }],
    },
    ownerId: 'test-user-id',
    ownerType: 'user' as const,
    updatedBy: 'test-user-id',
    updatedAt: new Date(),
    isPublic: 0,
    tags: 'test,playground',
  };

  describe('backupPlayground', () => {
    it('should successfully backup a playground', async () => {
      // Mock successful GitHub response
      mockGitHubService.commitPlaygroundMock.mockResolvedValueOnce({
        success: true,
        commitSha: 'abc123',
        commitUrl: 'https://github.com/owner/repo/commit/abc123',
      });

      const result = await service.backupPlayground(
        mockDb as any,
        mockPlayground as any,
        'test-user-id'
      );

      expect(result.success).toBe(true);
      expect(result.commitSha).toBe('abc123');
      expect(result.commitUrl).toBe('https://github.com/owner/repo/commit/abc123');

      // Verify database calls
      expect(mockDb.update).toHaveBeenCalledTimes(2); // pending + success
      expect(mockDb.insert).toHaveBeenCalledTimes(1); // backup history
    });

    it('should handle GitHub service not configured', async () => {
      // Mock getGitHubBackupService to return null
      vi.mocked(getGitHubBackupService).mockReturnValue(null);

      const result = await service.backupPlayground(
        mockDb as any,
        mockPlayground as any,
        'test-user-id'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('GitHub backup service not configured');
    });

    it('should retry on failure and eventually succeed', async () => {
      // Mock failure then success
      mockGitHubService.commitPlaygroundMock
        .mockResolvedValueOnce({ success: false, error: 'Network error' })
        .mockResolvedValueOnce({
          success: true,
          commitSha: 'def456',
          commitUrl: 'https://github.com/owner/repo/commit/def456',
        });

      // Start the backup operation
      const backupPromise = service.backupPlayground(
        mockDb as any,
        mockPlayground as any,
        'test-user-id'
      );

      // Advance timers to skip the retry delay
      await vi.advanceTimersByTimeAsync(2000);

      const result = await backupPromise;

      expect(result.success).toBe(true);
      expect(mockGitHubService.commitPlaygroundMock).toHaveBeenCalledTimes(2);
    }, 10000); // Add timeout

    it('should fail after max retries', async () => {
      // Mock all attempts failing
      mockGitHubService.commitPlaygroundMock.mockResolvedValue({
        success: false,
        error: 'Persistent error',
      });

      // Start the backup operation
      const backupPromise = service.backupPlayground(
        mockDb as any,
        mockPlayground as any,
        'test-user-id'
      );

      // Advance timers to skip all retry delays (2s + 4s + 8s = 14s)
      await vi.advanceTimersByTimeAsync(15000);

      const result = await backupPromise;

      expect(result.success).toBe(false);
      expect(result.error).toContain('Backup failed after 3 attempts');
      expect(mockGitHubService.commitPlaygroundMock).toHaveBeenCalledTimes(3);

      // Verify failure was recorded: 1 pending update + 1 failed update + 1 insert for backup history
      expect(mockDb.update).toHaveBeenCalledTimes(2); // pending + failed
      expect(mockDb.insert).toHaveBeenCalledTimes(1); // backup history with failure
    }, 20000); // Increase timeout for this test

    it('should extract nodes and edges correctly', async () => {
      mockGitHubService.commitPlaygroundMock.mockResolvedValueOnce({
        success: true,
        commitSha: 'xyz789',
        commitUrl: 'https://github.com/owner/repo/commit/xyz789',
      });

      await service.backupPlayground(
        mockDb as any,
        mockPlayground as any,
        'test-user-id'
      );

      // Check that the GitHub service was called with correct data structure
      const call = mockGitHubService.commitPlaygroundMock.mock.calls[0];
      expect(call?.[0]).toBe('test-user-id'); // userId
      expect(call?.[1]).toBe('test-playground-id'); // playgroundId
      
      const backupData = call?.[2] as PlaygroundBackupData;
      expect(backupData?.nodes).toEqual(mockPlayground.jsonBlob.nodes);
      expect(backupData?.edges).toEqual(mockPlayground.jsonBlob.edges);
      expect(backupData?.title).toBe('Test Playground');
      expect(backupData?.metadata.ownerType).toBe('user');
    });

    it('should handle org owner type correctly', async () => {
      const orgPlayground = {
        ...mockPlayground,
        ownerType: 'org' as const,
      };

      mockGitHubService.commitPlaygroundMock.mockResolvedValueOnce({
        success: true,
        commitSha: 'org123',
        commitUrl: 'https://github.com/owner/repo/commit/org123',
      });

      await service.backupPlayground(
        mockDb as any,
        orgPlayground as any,
        'test-user-id'
      );

      const backupData = mockGitHubService.commitPlaygroundMock.mock.calls?.[0]?.[2] as PlaygroundBackupData;
      expect(backupData?.metadata.ownerType).toBe('organization');
    });

    it('should handle empty or invalid jsonBlob gracefully', async () => {
      const playgroundWithBadJson = {
        ...mockPlayground,
        jsonBlob: null,
      };

      mockGitHubService.commitPlaygroundMock.mockResolvedValueOnce({
        success: true,
        commitSha: 'empty123',
        commitUrl: 'https://github.com/owner/repo/commit/empty123',
      });

      await service.backupPlayground(
        mockDb as any,
        playgroundWithBadJson as any,
        'test-user-id'
      );

      const backupData = mockGitHubService.commitPlaygroundMock.mock.calls?.[0]?.[2] as PlaygroundBackupData;
      expect(backupData.nodes).toEqual([]);
      expect(backupData.edges).toEqual([]);
    });
  });
}); 