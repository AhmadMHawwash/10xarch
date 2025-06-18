/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { type inferProcedureInput } from '@trpc/server';
import { type AppRouter } from '@/server/api/root';
import { type Playground, playgrounds } from '@/server/db/schema';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { 
  setupTestEnvironment,
  createTestCaller,
  createMockPlayground,
  createMockUser,
} from '@/server/api/__tests__/test-utils';
import { TRPCError } from '@trpc/server';
import { getGitHubBackupService } from '@/server/api/services/github-backup';

// Mock the github-backup service to prevent environment validation
const mockGitHubService = {
  getVersionHistory: vi.fn(),
  restoreVersion: vi.fn(),
  commitPlayground: vi.fn(),
};

vi.mock('@/server/api/services/github-backup', () => ({
  getGitHubBackupService: vi.fn(() => mockGitHubService),
}));

// Mock the playground-backup service
vi.mock('@/server/api/services/playground-backup', () => ({
  playgroundBackupService: {
    backupPlayground: vi.fn(),
  },
}));

describe('playgroundsRouter', () => {
  const mockUserId = 'user_test_123';
  const otherUserId = 'user_other_456';
  let mockPlayground: Playground;
  let otherUserPlayground: Playground;
  let publicPlayground: Playground;
  let editablePlayground: Playground;

  beforeEach(async () => {
    setupTestEnvironment();
    // Re-create mock playgrounds before each test to get fresh UUIDs
    mockPlayground = createMockPlayground(mockUserId);
    otherUserPlayground = createMockPlayground(otherUserId);
    publicPlayground = { ...createMockPlayground('another_user_id'), isPublic: 1 };
    editablePlayground = { ...createMockPlayground(mockUserId), editorIds: ['editor_user_id'] };
  });

  afterEach(() => {
    vi.clearAllMocks(); // Clear all mocks after each test to ensure isolation
  });

  describe('getAll', () => {
    it('should return playgrounds for the user', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findMany.mockResolvedValueOnce([mockPlayground]);
      
      const result = await caller.playgrounds.getAll();
      expect(result.playgrounds).toEqual([mockPlayground]);
      expect(mockDb.query.playgrounds.findMany).toHaveBeenCalled();
    });

    it('should return playgrounds for a specific owner if ownerId and ownerType provided', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      const input: inferProcedureInput<AppRouter['playgrounds']['getAll']> = {
        ownerId: mockUserId,
        ownerType: 'user',
      };
      mockDb.query.playgrounds.findMany.mockResolvedValueOnce([mockPlayground]);

      const result = await caller.playgrounds.getAll(input);
      expect(result.playgrounds).toEqual([mockPlayground]);
      expect(mockDb.query.playgrounds.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.anything(), 
        orderBy: expect.anything(),
      }));
    });

    it('should throw UNAUTHORIZED if user is not authenticated', async () => {
      const { caller } = await createTestCaller(null); 
      try {
        await caller.playgrounds.getAll();
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('UNAUTHORIZED');
      }
    });
  });

  describe('getById', () => {
    it('should return a playground by id if user has access', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(mockPlayground);

      const result = await caller.playgrounds.getById(mockPlayground.id);
      expect(result.playground).toEqual(mockPlayground);
      expect(mockDb.query.playgrounds.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.anything(),
      }));
    });

    it('should throw NOT_FOUND if playground does not exist', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockPlayground = createMockPlayground(mockUserId); // ID for non-existent playground
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(null);
      try {
        await caller.playgrounds.getById(mockPlayground.id);
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('NOT_FOUND');
      }
    });

    it('should throw FORBIDDEN if user does not have access', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId); // Current user
      otherUserPlayground = createMockPlayground(otherUserId); // Playground owned by someone else
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(otherUserPlayground);
      try {
        await caller.playgrounds.getById(otherUserPlayground.id);
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('FORBIDDEN');
      }
    });

    it('should allow access to public playgrounds', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId); // Current user (can be anyone)
      otherUserPlayground = { ...createMockPlayground(otherUserId), isPublic: 1 }; // Public playground
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(otherUserPlayground);
      
      const result = await caller.playgrounds.getById(otherUserPlayground.id);
      expect(result.playground).toEqual(otherUserPlayground);
    });
  });

  describe('create', () => {
    const createInput: inferProcedureInput<AppRouter['playgrounds']['create']> = {
      title: 'New Test Playground',
      jsonBlob: { nodes: [], edges: [] },
      ownerType: 'user',
    };

    it('should create a new playground', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      const createdPlayground = {
        ...createMockPlayground(mockUserId),
        ...createInput,
        id: 'new-generated-uuid', // Example ID
      };
      mockDb.returning.mockResolvedValueOnce([createdPlayground]);
      // mockDb.query.users.findFirst.mockResolvedValueOnce(createMockUser(mockUserId)); // Default in createTestCaller

      const result = await caller.playgrounds.create(createInput);
      expect(result.playground).toEqual(expect.objectContaining(createInput));
      expect(result.playground?.id).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalledWith(playgrounds);
      expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
        ...createInput,
        ownerId: mockUserId, // Router should set this
        createdBy: mockUserId,
        updatedBy: mockUserId,
      }));
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED if user is not authenticated', async () => {
      const { caller } = await createTestCaller(null);
      try {
        await caller.playgrounds.create(createInput);
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('UNAUTHORIZED');
      }
    });

    it('should handle database errors during creation (e.g. user not in db yet)', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.returning.mockImplementationOnce(() => {
        const error = new Error('blah foreign key constraint blah');
        return Promise.reject(error);
      });

      try {
        await caller.playgrounds.create(createInput);
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        // The router now has a more generic message for this specific DB error.
        expect((error as TRPCError).code).toBe('INTERNAL_SERVER_ERROR');
        expect((error as TRPCError).message).toContain('creating the playground'); // More generic check
      }
    });
  });

  describe('update', () => {
    let updateInput: inferProcedureInput<AppRouter['playgrounds']['update']>;
    let updatedPlayground: Playground;

    beforeEach(() => {
      mockPlayground = createMockPlayground(mockUserId);
      updateInput = {
        id: mockPlayground.id,
        title: 'Updated Test Playground',
        // jsonBlob is intentionally left undefined here for this test case
      };
      updatedPlayground = { 
        ...mockPlayground, 
        ...updateInput, 
        jsonBlob: mockPlayground.jsonBlob, // if input.jsonBlob is undefined, it shouldn't change
        updatedAt: expect.any(Date) as Date, 
        updatedBy: mockUserId,
      };
    });

    it('should update an existing playground if user has edit access (owner)', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(mockPlayground); 
      // Construct the expected object for .returning() carefully
      const expectedReturnedPlayground = {
        ...mockPlayground, // Start with original
        title: updateInput.title, // Apply the update
        // jsonBlob remains original because it was not in updateInput
        updatedAt: expect.any(Date) as Date, // Will be set by router
        updatedBy: mockUserId, // Will be set by router
      };
      mockDb.returning.mockResolvedValueOnce([expectedReturnedPlayground]);
      
      const result = await caller.playgrounds.update(updateInput);

      // Check the final result from the procedure
      expect(result.playground).toEqual(expectedReturnedPlayground);
      
      expect(mockDb.update).toHaveBeenCalledWith(playgrounds);
      // Check what mockDb.set was called with
      // The router will set title, updatedAt, and updatedBy.
      // jsonBlob is not in updateInput, so it won't be in the set call for changed fields.
      expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
        title: updateInput.title,
        updatedBy: mockUserId,
        // Note: jsonBlob is NOT included here because it wasn't in updateInput
      }));
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND if playground to update does not exist', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(null); 
      try {
        await caller.playgrounds.update(updateInput);
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('NOT_FOUND');
      }
    });

    it('should throw FORBIDDEN if user does not have edit access', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId); // Current user
      otherUserPlayground = createMockPlayground(otherUserId); // Owned by someone else
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(otherUserPlayground);
      try {
        await caller.playgrounds.update({ ...updateInput, id: otherUserPlayground.id });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('FORBIDDEN');
      }
    });

    it('should allow editor to update playground', async () => {
      const editorUserId = 'editor_user_789';
      const playgroundOwnedByMockUser = createMockPlayground(mockUserId);
      playgroundOwnedByMockUser.editorIds = [editorUserId]; // Add editor

      const { caller, db: mockDb } = await createTestCaller(editorUserId); 
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(playgroundOwnedByMockUser); 
      
      const specificUpdateInput = { id: playgroundOwnedByMockUser.id, title: "Updated by Editor", jsonBlob: { some: "data"} };
      // Construct the expected returned playground for the editor update
      const updatedPlaygroundByEditor = {
         ...playgroundOwnedByMockUser, 
         title: specificUpdateInput.title,
         jsonBlob: specificUpdateInput.jsonBlob,
         updatedAt: expect.any(Date) as Date, 
         updatedBy: editorUserId 
        };
      mockDb.returning.mockResolvedValueOnce([updatedPlaygroundByEditor]);

      const result = await caller.playgrounds.update(specificUpdateInput);
      expect(result.playground).toEqual(updatedPlaygroundByEditor); // Check the full returned object
      
      expect(mockDb.update).toHaveBeenCalledWith(playgrounds);
      // Check what mockDb.set was called with by the editor
      expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
        title: specificUpdateInput.title,
        jsonBlob: specificUpdateInput.jsonBlob,
        updatedBy: editorUserId,
        // id is not part of the set call, it's in the where clause
      }));
    });
  });

  describe('delete', () => {
    it('should delete a playground if user is the owner', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(mockPlayground);
      mockDb.returning.mockResolvedValueOnce([mockPlayground]);

      const result = await caller.playgrounds.delete(mockPlayground.id);
      expect(result.success).toBe(true);
      expect(result.deletedId).toBe(mockPlayground.id);
      expect(mockDb.delete).toHaveBeenCalledWith(playgrounds);
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND if playground does not exist', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(null);

      try {
        await caller.playgrounds.delete(mockPlayground.id);
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('NOT_FOUND');
      }
    });

    it('should throw FORBIDDEN if user is not the owner', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      otherUserPlayground = createMockPlayground(otherUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(otherUserPlayground);

      try {
        await caller.playgrounds.delete(otherUserPlayground.id);
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('FORBIDDEN');
      }
    });
  });

  describe('getVersionHistory', () => {
    const mockVersionHistory = [
      {
        commitSha: 'commit1',
        message: 'Update playground: Test Playground',
        author: 'Test User',
        date: '2024-01-01T00:00:00Z',
        url: 'https://github.com/test-owner/test-repo/commit/commit1',
      },
      {
        commitSha: 'commit2',
        message: 'Create playground: Test Playground',
        author: 'Test User',
        date: '2023-12-31T00:00:00Z',
        url: 'https://github.com/test-owner/test-repo/commit/commit2',
      },
    ];

    beforeEach(() => {
      // Configure the GitHub service mock
      mockGitHubService.getVersionHistory.mockResolvedValue(mockVersionHistory);
    });

    it('should return version history for playground owner', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(mockPlayground);

      const result = await caller.playgrounds.getVersionHistory({
        playgroundId: mockPlayground.id,
        limit: 20,
      });

      expect(result.versions).toEqual(mockVersionHistory);
      expect(mockDb.query.playgrounds.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(),
        })
      );
    });

    it('should return version history for playground with edit access', async () => {
      const { caller, db: mockDb } = await createTestCaller('editor_user_id');
      editablePlayground = { ...createMockPlayground(mockUserId), editorIds: ['editor_user_id'] };
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(editablePlayground);

      const result = await caller.playgrounds.getVersionHistory({
        playgroundId: editablePlayground.id,
        limit: 20,
      });

      expect(result.versions).toEqual(mockVersionHistory);
    });

    it('should return version history for public playground', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      publicPlayground = { ...createMockPlayground(otherUserId), isPublic: 1 };
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(publicPlayground);

      const result = await caller.playgrounds.getVersionHistory({
        playgroundId: publicPlayground.id,
        limit: 20,
      });

      expect(result.versions).toEqual(mockVersionHistory);
    });

    it('should throw NOT_FOUND if playground does not exist', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      const nonExistentId = crypto.randomUUID(); // Use valid UUID
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(null);

      try {
        await caller.playgrounds.getVersionHistory({
          playgroundId: nonExistentId,
          limit: 20,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('NOT_FOUND');
      }
    });

    it('should throw FORBIDDEN if user does not have access', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      otherUserPlayground = { ...createMockPlayground(otherUserId), isPublic: 0 };
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(otherUserPlayground);

      try {
        await caller.playgrounds.getVersionHistory({
          playgroundId: otherUserPlayground.id,
          limit: 20,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('FORBIDDEN');
      }
    });

    it('should throw SERVICE_UNAVAILABLE if GitHub backup service is not available', async () => {
      // Mock getGitHubBackupService to return null for this test
      vi.mocked(getGitHubBackupService).mockReturnValueOnce(null);

      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(mockPlayground);

      try {
        await caller.playgrounds.getVersionHistory({
          playgroundId: mockPlayground.id,
          limit: 20,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('SERVICE_UNAVAILABLE');
      }
    });

    it('should return empty array if GitHub service returns empty history', async () => {
      // Configure the mock to return empty array for this test
      mockGitHubService.getVersionHistory.mockResolvedValueOnce([]);

      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(mockPlayground);

      const result = await caller.playgrounds.getVersionHistory({
        playgroundId: mockPlayground.id,
        limit: 20,
      });

      expect(result.versions).toEqual([]);
    });

    it('should use default limit when not specified', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(mockPlayground);

      await caller.playgrounds.getVersionHistory({
        playgroundId: mockPlayground.id,
      });

      expect(mockGitHubService.getVersionHistory).toHaveBeenCalledWith(
        mockPlayground.ownerId,
        mockPlayground.id,
        20 // default limit
      );
    });
  });

  describe('restoreVersion', () => {
    const mockRestoredData = {
      id: 'test-playground-id',
      title: 'Restored Playground Title',
      description: 'Restored playground description',
      nodes: [
        {
          id: 'restored-node1',
          type: 'SystemComponentNode',
          position: { x: 200, y: 200 },
          data: { label: 'Restored Node' },
        },
      ],
      edges: [
        {
          id: 'restored-edge1',
          source: 'restored-node1',
          target: 'restored-node2',
        },
      ],
      metadata: {
        ownerId: mockUserId,
        ownerType: 'user',
        updatedBy: mockUserId,
        updatedAt: '2024-01-01T00:00:00Z',
        isPublic: false,
        tags: 'restored,test',
      },
    };

    const restoredPlayground = {
      ...mockPlayground,
      title: mockRestoredData.title,
      description: mockRestoredData.description,
      jsonBlob: { nodes: mockRestoredData.nodes, edges: mockRestoredData.edges },
      lastBackupCommitSha: 'commit-sha-123',
      backupStatus: 'success' as const,
      updatedAt: expect.any(Date) as Date,
      updatedBy: mockUserId,
    };

    beforeEach(() => {
      // Configure the GitHub service mock for restore version
      mockGitHubService.restoreVersion.mockResolvedValue(mockRestoredData);
    });

    it('should successfully restore playground for owner', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(mockPlayground);
      
      // Mock the transaction to return the expected result
      mockDb.transaction.mockImplementationOnce(async (fn: any) => {
        // Simulate the transaction callback returning the restored playground
        return restoredPlayground;
      });

      const result = await caller.playgrounds.restoreVersion({
        playgroundId: mockPlayground.id,
        commitSha: 'commit-sha-123',
      });

      expect(result.playground).toEqual(restoredPlayground);
      expect(mockDb.transaction).toHaveBeenCalled();
    });

    it('should successfully restore playground for user with edit access', async () => {
      const { caller, db: mockDb } = await createTestCaller('editor_user_id');
      editablePlayground = { ...createMockPlayground(mockUserId), editorIds: ['editor_user_id'] };
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(editablePlayground);
      const restoredEditablePlayground = { ...restoredPlayground, ...editablePlayground };
      
      // Mock the transaction to return the expected result
      mockDb.transaction.mockImplementationOnce(async (fn: any) => {
        return restoredEditablePlayground;
      });

      const result = await caller.playgrounds.restoreVersion({
        playgroundId: editablePlayground.id,
        commitSha: 'commit-sha-123',
      });

      expect(result.playground).toEqual(restoredEditablePlayground);
    });

    it('should throw NOT_FOUND if playground does not exist', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      const nonExistentId = crypto.randomUUID(); // Use valid UUID
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(null);

      try {
        await caller.playgrounds.restoreVersion({
          playgroundId: nonExistentId,
          commitSha: 'commit-sha-123',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('NOT_FOUND');
      }
    });

    it('should throw FORBIDDEN if user does not have edit access', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      otherUserPlayground = createMockPlayground(otherUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(otherUserPlayground);

      try {
        await caller.playgrounds.restoreVersion({
          playgroundId: otherUserPlayground.id,
          commitSha: 'commit-sha-123',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('FORBIDDEN');
      }
    });

    it('should throw SERVICE_UNAVAILABLE if GitHub backup service is not available', async () => {
      // Mock getGitHubBackupService to return null for this test
      vi.mocked(getGitHubBackupService).mockReturnValueOnce(null);

      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(mockPlayground);

      try {
        await caller.playgrounds.restoreVersion({
          playgroundId: mockPlayground.id,
          commitSha: 'commit-sha-123',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('SERVICE_UNAVAILABLE');
      }
    });

    it('should throw NOT_FOUND if version cannot be restored', async () => {
      // Configure the mock to return null for this test
      mockGitHubService.restoreVersion.mockResolvedValueOnce(null);

      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(mockPlayground);

      try {
        await caller.playgrounds.restoreVersion({
          playgroundId: mockPlayground.id,
          commitSha: 'invalid-commit-sha',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('NOT_FOUND');
        expect((error as TRPCError).message).toBe('Version not found or could not be restored');
      }
    });

    it('should throw INTERNAL_SERVER_ERROR if database update fails', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(mockPlayground);
      
      // Mock the transaction to return null (simulating failed update)
      mockDb.transaction.mockImplementationOnce(async (fn: any) => {
        return null;
      });

      try {
        await caller.playgrounds.restoreVersion({
          playgroundId: mockPlayground.id,
          commitSha: 'commit-sha-123',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('INTERNAL_SERVER_ERROR');
        expect((error as TRPCError).message).toBe('Failed to update playground with restored data');
      }
    });

    it('should handle GitHub service errors gracefully', async () => {
      // Configure the mock to reject for this test
      mockGitHubService.restoreVersion.mockRejectedValueOnce(new Error('GitHub API Error'));

      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(mockPlayground);

      try {
        await caller.playgrounds.restoreVersion({
          playgroundId: mockPlayground.id,
          commitSha: 'commit-sha-123',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('INTERNAL_SERVER_ERROR');
        expect((error as TRPCError).message).toBe('Failed to restore version');
      }
    });

    it('should use transaction for database updates', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(mockPlayground);
      
      // Mock the transaction to return the expected result
      mockDb.transaction.mockImplementationOnce(async (fn: any) => {
        return restoredPlayground;
      });

      await caller.playgrounds.restoreVersion({
        playgroundId: mockPlayground.id,
        commitSha: 'commit-sha-123',
      });

      // Verify transaction was used
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });
}); 