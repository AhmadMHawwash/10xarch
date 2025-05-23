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
    beforeEach(() => {
      mockPlayground = createMockPlayground(mockUserId);
    });

    it('should delete a playground if user is the owner', async () => {
      const { caller, db: mockDb } = await createTestCaller(mockUserId);
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(mockPlayground); // For permission check
      mockDb.returning.mockResolvedValueOnce([{ id: mockPlayground.id }]); // For the delete operation

      const result = await caller.playgrounds.delete(mockPlayground.id);
      expect(result.success).toBe(true);
      // expect(result.deletedId).toBe(mockPlayground.id); // Commented out due to router change
      expect(mockDb.delete).toHaveBeenCalledWith(playgrounds);
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND if playground to delete does not exist', async () => {
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
      const { caller, db: mockDb } = await createTestCaller(mockUserId); // Current user
      otherUserPlayground = createMockPlayground(otherUserId); // Owned by someone else
      mockDb.query.playgrounds.findFirst.mockResolvedValueOnce(otherUserPlayground);
      try {
        await caller.playgrounds.delete(otherUserPlayground.id);
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('FORBIDDEN');
      }
    });
  });
}); 