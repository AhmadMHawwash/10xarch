import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { playgrounds, users } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { z } from "zod";

// Shared schemas
const playgroundIdSchema = z.string().uuid();

// Schema for creating a playground
const createPlaygroundSchema = z.object({
  title: z.string().min(1).max(100),
  jsonBlob: z.record(z.unknown()),
  ownerType: z.enum(["user", "org"]),
  ownerId: z.string().optional(),
  editorIds: z.array(z.string()).optional(),
  viewerIds: z.array(z.string()).optional(),
  isPublic: z.number().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
});

// Schema for updating a playground
const updatePlaygroundSchema = z.object({
  id: playgroundIdSchema,
  title: z.string().min(1).max(100).optional(),
  jsonBlob: z.record(z.unknown()).optional(),
  editorIds: z.array(z.string()).optional(),
  viewerIds: z.array(z.string()).optional(),
  isPublic: z.number().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
});

// Schema for listing playgrounds
const listPlaygroundsSchema = z.object({
  ownerType: z.enum(["user", "org"]).optional(),
  ownerId: z.string().optional(),
  includeShared: z.boolean().optional().default(true),
});

export const playgroundsRouter = createTRPCRouter({
  // Get all playgrounds accessible by the user
  getAll: protectedProcedure
    .input(listPlaygroundsSchema.optional())
    .query(async ({ ctx, input }) => {
      const { userId } = await auth();
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Filter by owner if specified
      if (input?.ownerType && input?.ownerId) {
        const results = await ctx.db.query.playgrounds.findMany({
          where: and(
            eq(playgrounds.ownerType, input.ownerType),
            eq(playgrounds.ownerId, input.ownerId)
          ),
          orderBy: [desc(playgrounds.updatedAt)],
        });
        return { playgrounds: results };
      } else {
        // Default to showing user's own playgrounds and shared with them
        const results = await ctx.db.query.playgrounds.findMany({
          where: or(
            // User is the owner
            and(
              eq(playgrounds.ownerType, "user"),
              eq(playgrounds.ownerId, userId)
            ),
            // User is an editor
            sql`${userId} = ANY(${playgrounds.editorIds})`,
            // User is a viewer
            sql`${userId} = ANY(${playgrounds.viewerIds})`,
            // Playground is public
            eq(playgrounds.isPublic, 1)
          ),
          orderBy: [desc(playgrounds.updatedAt)],
        });
        return { playgrounds: results };
      }
    }),

  // Get a single playground by ID
  getById: protectedProcedure
    .input(playgroundIdSchema)
    .query(async ({ ctx, input }) => {
      const { userId } = await auth();
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const playground = await ctx.db.query.playgrounds.findFirst({
        where: eq(playgrounds.id, input),
      });

      if (!playground) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playground not found",
        });
      }

      // Check if user has access to this playground
      const hasAccess = 
        // User is the owner
        (playground.ownerType === "user" && playground.ownerId === userId) ||
        // User is an editor
        ((playground.editorIds?.includes?.(userId)) ?? false) ||
        // User is a viewer
        ((playground.viewerIds?.includes?.(userId)) ?? false) ||
        // Playground is public
        playground.isPublic === 1;

      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this playground",
        });
      }

      // Track current visitor
      if (!playground.currentVisitorIds?.includes(userId)) {
        const currentVisitorIds = playground.currentVisitorIds ? 
          [...playground.currentVisitorIds, userId] : 
          [userId];

        await ctx.db.update(playgrounds)
          .set({ currentVisitorIds })
          .where(eq(playgrounds.id, input));
      }

      return { playground };
    }),

  // Create a new playground
  create: protectedProcedure
    .input(createPlaygroundSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = await auth();
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      try {
        // Create the playground
        const [newPlayground] = await ctx.db.insert(playgrounds)
          .values({
            title: input.title,
            jsonBlob: input.jsonBlob,
            ownerType: input.ownerType,
            ownerId: userId,
            createdBy: userId,
            updatedBy: userId,
            editorIds: input.editorIds ?? [],
            viewerIds: input.viewerIds ?? [],
            currentVisitorIds: [userId],
            isPublic: input.isPublic ?? 0,
            description: input.description,
            tags: input.tags,
          })
          .returning();

        if (!newPlayground) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create playground",
          });
        }

        return { playground: newPlayground };
      } catch (error) {
        console.error("Detailed error creating playground:", error);
        
        // Handle foreign key constraint violations specifically
        if (error instanceof Error && error.message.includes("violates foreign key constraint")) {
          console.error("Foreign key violation details:", {
            message: error.message,
            userId
          });
          
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User account not yet set up in the database. Please sign out and sign in again.",
          });
        }
        
        // Rethrow TRPC errors
        if (error instanceof TRPCError) {
          throw error;
        }
        
        // General error
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while creating the playground",
        });
      }
    }),

  // Update an existing playground
  update: protectedProcedure
    .input(updatePlaygroundSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = await auth();
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Check if playground exists and user has edit access
      const existingPlayground = await ctx.db.query.playgrounds.findFirst({
        where: eq(playgrounds.id, input.id),
      });

      if (!existingPlayground) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playground not found",
        });
      }

      // Check if user has edit access (owner or editor)
      const hasEditAccess = 
        (existingPlayground.ownerType === "user" && existingPlayground.ownerId === userId) ||
        existingPlayground.editorIds?.includes(userId);

      if (!hasEditAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to edit this playground",
        });
      }

      // Prepare update values
      const updateValues = {
        ...input.title && { title: input.title },
        ...input.jsonBlob && { jsonBlob: input.jsonBlob },
        ...input.editorIds && { editorIds: input.editorIds },
        ...input.viewerIds && { viewerIds: input.viewerIds },
        ...input.isPublic !== undefined && { isPublic: input.isPublic },
        ...input.description !== undefined && { description: input.description },
        ...input.tags !== undefined && { tags: input.tags },
        updatedBy: userId,
        updatedAt: new Date(),
      };

      // Update the playground
      const [updatedPlayground] = await ctx.db.update(playgrounds)
        .set(updateValues)
        .where(eq(playgrounds.id, input.id))
        .returning();

      if (!updatedPlayground) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update playground",
        });
      }

      return { playground: updatedPlayground };
    }),

  // Delete a playground
  delete: protectedProcedure
    .input(playgroundIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = await auth();
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Check if playground exists and user is the owner
      const existingPlayground = await ctx.db.query.playgrounds.findFirst({
        where: eq(playgrounds.id, input),
      });

      if (!existingPlayground) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playground not found",
        });
      }

      // Only the owner can delete a playground
      if (!(existingPlayground.ownerType === "user" && existingPlayground.ownerId === userId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can delete a playground",
        });
      }

      // Delete the playground
      await ctx.db.delete(playgrounds)
        .where(eq(playgrounds.id, input));

      return { success: true };
    }),

  // Leave a playground (remove from current visitors)
  leave: protectedProcedure
    .input(playgroundIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = await auth();
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const playground = await ctx.db.query.playgrounds.findFirst({
        where: eq(playgrounds.id, input),
      });

      if (!playground) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playground not found",
        });
      }

      // Remove user from current visitors
      if (playground.currentVisitorIds?.includes(userId)) {
        const currentVisitorIds = playground.currentVisitorIds.filter(id => id !== userId);

        await ctx.db.update(playgrounds)
          .set({ currentVisitorIds })
          .where(eq(playgrounds.id, input));
      }

      return { success: true };
    }),
}); 