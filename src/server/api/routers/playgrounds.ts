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
  ownerId: z.string().optional(), // ownerId in input is for *filtering* if admin, actual owner is from ctx
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
  filter: z.enum(["all", "shared_with_me", "shared_with_others"]).optional().default("all"),
});

export const playgroundsRouter = createTRPCRouter({
  // Get all playgrounds accessible by the user
  getAll: protectedProcedure
    .input(listPlaygroundsSchema.optional())
    .query(async ({ ctx, input }) => {
      const { userId } = await auth(); // Use userId from Clerk auth
      if (!userId) {
        // This case should ideally be caught by protectedProcedure already,
        // but as a safeguard or if context changes:
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Filter by owner if specified in input (e.g., an admin viewing specific user's playgrounds)
      if (input?.ownerType && input?.ownerId) {
        // Here, we might add an additional permission check if only admins can use this filter.
        // For now, assuming if ownerId is provided, it's a valid request.
        const results = await ctx.db.query.playgrounds.findMany({
          where: and(
            eq(playgrounds.ownerType, input.ownerType),
            eq(playgrounds.ownerId, input.ownerId),
          ),
          orderBy: [desc(playgrounds.updatedAt)],
        });
        return { playgrounds: results };
      } else {
        // Apply filter based on user's request
        let whereCondition;
        
        switch (input?.filter) {
          case "shared_with_me":
            whereCondition = or(
              sql`${userId} = ANY(${playgrounds.editorIds})`, // User is an editor
              sql`${userId} = ANY(${playgrounds.viewerIds})`, // User is a viewer
            );
            break;
          case "shared_with_others":
            whereCondition = and(
              eq(playgrounds.ownerType, "user"),
              eq(playgrounds.ownerId, userId),
              or(
                sql`array_length(${playgrounds.editorIds}, 1) > 0`,
                sql`array_length(${playgrounds.viewerIds}, 1) > 0`,
              ),
            );
            break;
          default: // "all"
            whereCondition = or(
              and(
                // User is the owner
                eq(playgrounds.ownerType, "user"),
                eq(playgrounds.ownerId, userId),
              ),
              sql`${userId} = ANY(${playgrounds.editorIds})`, // User is an editor
              sql`${userId} = ANY(${playgrounds.viewerIds})`, // User is a viewer
              eq(playgrounds.isPublic, 1), // Playground is public
            );
        }

        const results = await ctx.db.query.playgrounds.findMany({
          where: whereCondition,
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

      const hasAccess =
        (playground.ownerType === "user" && playground.ownerId === userId) ||
        (playground.editorIds?.includes?.(userId) ?? false) ||
        (playground.viewerIds?.includes?.(userId) ?? false) ||
        playground.isPublic === 1;

      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this playground",
        });
      }

      if (!playground.currentVisitorIds?.includes(userId)) {
        const currentVisitorIds = playground.currentVisitorIds
          ? [...playground.currentVisitorIds, userId]
          : [userId];
        try {
          await ctx.db
            .update(playgrounds)
            .set({ currentVisitorIds })
            .where(eq(playgrounds.id, input));
        } catch (e) {
          // Log error, but don't fail the read operation if visitor update fails
          console.error("Failed to update currentVisitorIds:", e);
        }
      }
      return { playground };
    }),

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

      let determinedOwnerId: string;
      if (input.ownerType === "user") {
        determinedOwnerId = userId;
      } else if (input.ownerType === "org") {
        if (!input.ownerId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ownerId is required when ownerType is 'org'",
          });
        }
        determinedOwnerId = input.ownerId;
      } else {
        // This case should be prevented by Zod validation of input.ownerType
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid ownerType specified.",
        });
      }

      try {
        const [newPlayground] = await ctx.db
          .insert(playgrounds)
          .values({
            title: input.title,
            jsonBlob: input.jsonBlob,
            ownerType: input.ownerType,
            ownerId: determinedOwnerId, // Now guaranteed to be a string
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
        if (
          error instanceof Error &&
          error.message.includes("violates foreign key constraint")
        ) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR", // Could be more specific like BAD_REQUEST or CONFLICT
            message:
              "User account not yet set up in the database. Please sign out and sign in again.",
          });
        }
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while creating the playground",
        });
      }
    }),

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

      const existingPlayground = await ctx.db.query.playgrounds.findFirst({
        where: eq(playgrounds.id, input.id),
      });

      if (!existingPlayground) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playground not found",
        });
      }

      const hasEditAccess =
        (existingPlayground.ownerType === "user" &&
          existingPlayground.ownerId === userId) ||
        existingPlayground.editorIds?.includes(userId);

      if (!hasEditAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to edit this playground",
        });
      }

      const updateValues: Partial<typeof playgrounds.$inferInsert> = {};
      if (input.title !== undefined) updateValues.title = input.title;
      if (input.jsonBlob !== undefined) updateValues.jsonBlob = input.jsonBlob;
      if (input.editorIds !== undefined)
        updateValues.editorIds = input.editorIds;
      if (input.viewerIds !== undefined)
        updateValues.viewerIds = input.viewerIds;
      if (input.isPublic !== undefined) updateValues.isPublic = input.isPublic;
      if (input.description !== undefined)
        updateValues.description = input.description;
      if (input.tags !== undefined) updateValues.tags = input.tags;

      // Only update if there are actual changes beyond audit fields
      const keysToUpdate = Object.keys(updateValues);
      if (keysToUpdate.length > 0) {
        updateValues.updatedAt = new Date();
        updateValues.updatedBy = userId;

        const [updatedPlayground] = await ctx.db
          .update(playgrounds)
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
      } else {
        // No actual data fields to update, return the existing playground
        return { playground: existingPlayground };
      }
    }),

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

      const existingPlayground = await ctx.db.query.playgrounds.findFirst({
        where: eq(playgrounds.id, input),
      });

      if (!existingPlayground) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playground not found",
        });
      }

      // For user-owned playgrounds, only the owner can delete.
      // For org-owned, different rules might apply (e.g., org admin), not handled here yet.
      if (
        existingPlayground.ownerType === "user" &&
        existingPlayground.ownerId !== userId
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can delete a user-owned playground",
        });
      }
      // Add more complex permission for org-owned playgrounds if necessary

      const deletedItems = await ctx.db
        .delete(playgrounds)
        .where(eq(playgrounds.id, input))
        .returning({ id: playgrounds.id });

      if (!deletedItems || deletedItems.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to delete playground or playground not found after delete attempt.",
        });
      }
      const firstDeletedItem = deletedItems[0];
      if (!firstDeletedItem) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve details of the deleted playground.",
        });
      }
      return { success: true, deletedId: firstDeletedItem.id };
    }),

  // Search users by email for sharing
  searchUsers: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const { userId } = await auth();
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const foundUsers = await ctx.db.query.users.findMany({
        where: eq(users.email, input.email),
        columns: {
          id: true,
          email: true,
        },
      });

      return { users: foundUsers };
    }),

  // Update sharing permissions for a playground
  updateSharing: protectedProcedure
    .input(z.object({
      playgroundId: playgroundIdSchema,
      editorIds: z.array(z.string()),
      viewerIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = await auth();
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const existingPlayground = await ctx.db.query.playgrounds.findFirst({
        where: eq(playgrounds.id, input.playgroundId),
      });

      if (!existingPlayground) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playground not found",
        });
      }

      // Only the owner can update sharing permissions
      if (
        existingPlayground.ownerType === "user" &&
        existingPlayground.ownerId !== userId
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can update sharing permissions",
        });
      }

      const [updatedPlayground] = await ctx.db
        .update(playgrounds)
        .set({
          editorIds: input.editorIds,
          viewerIds: input.viewerIds,
          updatedAt: new Date(),
          updatedBy: userId,
        })
        .where(eq(playgrounds.id, input.playgroundId))
        .returning();

      if (!updatedPlayground) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update sharing permissions",
        });
      }

      return { playground: updatedPlayground };
    }),
});
