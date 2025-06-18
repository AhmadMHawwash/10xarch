/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { describe, expect, test, vi, beforeEach } from 'vitest';
import { setupTestEnvironment } from '../../__tests__/test-utils';

// Setup environment before any other imports that validate env
setupTestEnvironment();

import { TRPCError } from '@trpc/server';
import { createTestCaller, createMockPlayground, createMockUser } from '../../__tests__/test-utils';

describe('Playground Sharing Router Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchUsers', () => {
    test('returns user when found by email', async () => {
      const { caller, db } = await createTestCaller('test-user');
      
      // Set up findMany mock if it doesn't exist
      if (!(db.query.users as any).findMany) {
        (db.query.users as any).findMany = vi.fn();
      }
      
      // Mock user found in database
      const mockUser = createMockUser('target-user-123');
      (db.query.users as any).findMany.mockResolvedValueOnce([{
        id: mockUser.id,
        email: mockUser.email,
      }]);
      
      // Call the function
      const result = await caller.playgrounds.searchUsers({ email: 'target@example.com' });
      
      // Check expectations
      expect(result.users).toHaveLength(1);
      expect(result.users[0]).toEqual({
        id: mockUser.id,
        email: mockUser.email,
      });
    });

    test('returns empty array when user not found', async () => {
      const { caller, db } = await createTestCaller('test-user');
      
      // Set up findMany mock if it doesn't exist
      if (!(db.query.users as any).findMany) {
        (db.query.users as any).findMany = vi.fn();
      }
      
      // Mock no user found
      (db.query.users as any).findMany.mockResolvedValueOnce([]);
      
      const result = await caller.playgrounds.searchUsers({ email: 'nonexistent@example.com' });
      
      expect(result.users).toHaveLength(0);
    });

    test('throws unauthorized error for unauthenticated user', async () => {
      const { caller } = await createTestCaller(null);
      
      await expect(caller.playgrounds.searchUsers({ email: 'test@example.com' }))
        .rejects.toThrow(TRPCError);
    });
  });

  describe('updateSharing', () => {
    test('updates sharing permissions as owner', async () => {
      const ownerId = 'owner-123';
      const { caller, db } = await createTestCaller(ownerId);
      
      // Mock playground owned by the same user ID as auth
      const mockPlayground = createMockPlayground(ownerId);
      db.query.playgrounds.findFirst.mockResolvedValueOnce(mockPlayground);
      
      // Mock updated playground
      const updatedPlayground = {
        ...mockPlayground,
        editorIds: ['editor-1', 'editor-2'],
        viewerIds: ['viewer-1'],
        updatedAt: new Date(),
        updatedBy: ownerId,
      };
      db.returning.mockResolvedValueOnce([updatedPlayground]);
      
      const result = await caller.playgrounds.updateSharing({
        playgroundId: mockPlayground.id,
        editorIds: ['editor-1', 'editor-2'],
        viewerIds: ['viewer-1'],
      });
      
      expect(result.playground.editorIds).toEqual(['editor-1', 'editor-2']);
      expect(result.playground.viewerIds).toEqual(['viewer-1']);
      expect(db.update).toHaveBeenCalled();
      expect(db.set).toHaveBeenCalledWith({
        editorIds: ['editor-1', 'editor-2'],
        viewerIds: ['viewer-1'],
        updatedAt: expect.any(Date),
        updatedBy: ownerId,
      });
    });

    test('throws forbidden error for non-owner', async () => {
      const ownerId = 'owner-123';
      const nonOwnerId = 'non-owner-456';
      const { caller, db } = await createTestCaller(nonOwnerId);
      
      // Mock playground owned by someone else
      const mockPlayground = createMockPlayground(ownerId);
      db.query.playgrounds.findFirst.mockResolvedValueOnce(mockPlayground);
      
      await expect(caller.playgrounds.updateSharing({
        playgroundId: mockPlayground.id,
        editorIds: ['editor-1'],
        viewerIds: [],
      })).rejects.toThrow(TRPCError);
    });

    test('throws not found error for non-existent playground', async () => {
      const { caller, db } = await createTestCaller('test-user');
      
      // Mock playground not found
      db.query.playgrounds.findFirst.mockResolvedValueOnce(null);
      
      await expect(caller.playgrounds.updateSharing({
        playgroundId: '550e8400-e29b-41d4-a716-446655440000',
        editorIds: [],
        viewerIds: [],
      })).rejects.toThrow(TRPCError);
    });
  });

  describe('getAll with sharing filters', () => {
    test('filters playgrounds shared with me', async () => {
      const userId = 'test-user';
      const { caller, db } = await createTestCaller(userId);
      
      // Mock playgrounds shared with user
      const sharedPlayground = createMockPlayground('other-owner');
      sharedPlayground.editorIds = [userId];
      sharedPlayground.viewerIds = [];
      db.query.playgrounds.findMany.mockResolvedValueOnce([sharedPlayground]);
      
      const result = await caller.playgrounds.getAll({ filter: 'shared_with_me' });
      
      expect(result.playgrounds).toHaveLength(1);
      expect(result.playgrounds[0]!.id).toBe(sharedPlayground.id);
    });

    test('filters playgrounds shared with others', async () => {
      const userId = 'owner-123';
      const { caller, db } = await createTestCaller(userId);
      
      // Mock playground owned by user and shared with others
      const sharedPlayground = createMockPlayground(userId);
      sharedPlayground.editorIds = ['user-1', 'user-2'];
      sharedPlayground.viewerIds = ['user-3'];
      db.query.playgrounds.findMany.mockResolvedValueOnce([sharedPlayground]);
      
      const result = await caller.playgrounds.getAll({ filter: 'shared_with_others' });
      
      expect(result.playgrounds).toHaveLength(1);
      expect(result.playgrounds[0]!.editorIds).toHaveLength(2);
      expect(result.playgrounds[0]!.viewerIds).toHaveLength(1);
    });

    test('returns all accessible playgrounds with "all" filter', async () => {
      const userId = 'test-user';
      const { caller, db } = await createTestCaller(userId);
      
      // Mock multiple playgrounds
      const ownedPlayground = createMockPlayground(userId);
      const sharedPlayground = createMockPlayground('other-owner');
      sharedPlayground.viewerIds = [userId];
      db.query.playgrounds.findMany.mockResolvedValueOnce([
        ownedPlayground,
        sharedPlayground,
      ]);
      
      const result = await caller.playgrounds.getAll({ filter: 'all' });
      
      expect(result.playgrounds).toHaveLength(2);
    });
  });

  describe('getById with sharing permissions', () => {
    test('allows access to shared playground for editor', async () => {
      const editorUserId = 'editor-123';
      const ownerId = 'owner-456';
      const { caller, db } = await createTestCaller(editorUserId);
      
      // Mock playground shared with editor
      const playground = createMockPlayground(ownerId);
      playground.editorIds = [editorUserId];
      playground.viewerIds = [];
      db.query.playgrounds.findFirst.mockResolvedValueOnce(playground);
      
      // Mock update for visitor tracking
      const updatedPlayground = {
        ...playground,
        currentVisitorIds: [editorUserId, ownerId],
      };
      db.returning.mockResolvedValueOnce([updatedPlayground]);
      
      const result = await caller.playgrounds.getById(playground.id);
      
      expect(result.playground.id).toBe(playground.id);
      expect(db.update).toHaveBeenCalled(); // For visitor tracking
    });

    test('allows access to shared playground for viewer', async () => {
      const viewerUserId = 'viewer-123';
      const ownerId = 'owner-456';
      const { caller, db } = await createTestCaller(viewerUserId);
      
      // Mock playground shared with viewer
      const playground = createMockPlayground(ownerId);
      playground.editorIds = [];
      playground.viewerIds = [viewerUserId];
      db.query.playgrounds.findFirst.mockResolvedValueOnce(playground);
      db.returning.mockResolvedValueOnce([playground]);
      
      const result = await caller.playgrounds.getById(playground.id);
      
      expect(result.playground.id).toBe(playground.id);
    });

    test('denies access to non-shared playground', async () => {
      const unauthorizedUserId = 'unauthorized-123';
      const ownerId = 'owner-456';
      const { caller, db } = await createTestCaller(unauthorizedUserId);
      
      // Mock playground not shared with user
      const playground = createMockPlayground(ownerId);
      playground.editorIds = [];
      playground.viewerIds = [];
      playground.isPublic = 0;
      db.query.playgrounds.findFirst.mockResolvedValueOnce(playground);
      
      await expect(caller.playgrounds.getById(playground.id))
        .rejects.toThrow(TRPCError);
    });

    test('allows access to public playground', async () => {
      const anyUserId = 'any-user-123';
      const ownerId = 'owner-456';
      const { caller, db } = await createTestCaller(anyUserId);
      
      // Mock public playground
      const playground = createMockPlayground(ownerId);
      playground.isPublic = 1;
      playground.editorIds = [];
      playground.viewerIds = [];
      db.query.playgrounds.findFirst.mockResolvedValueOnce(playground);
      db.returning.mockResolvedValueOnce([playground]);
      
      const result = await caller.playgrounds.getById(playground.id);
      
      expect(result.playground.id).toBe(playground.id);
      expect(result.playground.isPublic).toBe(1);
    });
  });
}); 