import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const academicRouter = router({
  // ============================================================================
  // CALENDAR EVENTS
  // ============================================================================

  /**
   * Create calendar event (admin only)
   */
  createEvent: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        eventDate: z.string().date(),
        eventTime: z.string().time().optional(),
        eventType: z.enum(["class", "exam", "holiday", "special"]),
        adminId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create events",
        });
      }

      await db.createCalendarEvent({
        title: input.title,
        description: input.description,
        eventDate: new Date(input.eventDate),
        eventTime: input.eventTime,
        eventType: input.eventType,
        createdByAdminId: input.adminId,
      });

      return {
        success: true,
        message: "Event created successfully",
      };
    }),

  /**
   * Get all calendar events
   */
  getAllEvents: publicProcedure.query(async () => {
    return await db.getAllCalendarEvents();
  }),

  /**
   * Get events by date
   */
  getEventsByDate: publicProcedure
    .input(z.object({ date: z.string().date() }))
    .query(async ({ input }) => {
      return await db.getCalendarEventsByDate(new Date(input.date));
    }),

  /**
   * Update calendar event (admin only)
   */
  updateEvent: publicProcedure
    .input(
      z.object({
        eventId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        eventDate: z.string().date().optional(),
        eventTime: z.string().time().optional(),
        eventType: z.enum(["class", "exam", "holiday", "special"]).optional(),
        adminId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update events",
        });
      }

      const updateData: any = {};
      if (input.title) updateData.title = input.title;
      if (input.description) updateData.description = input.description;
      if (input.eventDate) updateData.eventDate = new Date(input.eventDate);
      if (input.eventTime) updateData.eventTime = input.eventTime;
      if (input.eventType) updateData.eventType = input.eventType;

      await db.updateCalendarEvent(input.eventId, updateData);

      return {
        success: true,
        message: "Event updated successfully",
      };
    }),

  /**
   * Delete calendar event (admin only)
   */
  deleteEvent: publicProcedure
    .input(z.object({ eventId: z.number(), adminId: z.number() }))
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete events",
        });
      }

      await db.deleteCalendarEvent(input.eventId);

      return {
        success: true,
        message: "Event deleted successfully",
      };
    }),

  // ============================================================================
  // LIBRARY FILES
  // ============================================================================

  /**
   * Upload library file (admin only)
   */
  uploadFile: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileUrl: z.string(),
        fileKey: z.string(),
        category: z.enum(["material", "regulation", "map", "other"]),
        description: z.string().optional(),
        adminId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can upload files",
        });
      }

      await db.createLibraryFile({
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        fileKey: input.fileKey,
        category: input.category,
        description: input.description,
        uploadedByAdminId: input.adminId,
      });

      return {
        success: true,
        message: "File uploaded successfully",
      };
    }),

  /**
   * Get all library files
   */
  getAllFiles: publicProcedure.query(async () => {
    return await db.getAllLibraryFiles();
  }),

  /**
   * Get files by category
   */
  getFilesByCategory: publicProcedure
    .input(z.object({ category: z.enum(["material", "regulation", "map", "other"]) }))
    .query(async ({ input }) => {
      return await db.getLibraryFilesByCategory(input.category);
    }),

  /**
   * Update library file (admin only)
   */
  updateFile: publicProcedure
    .input(
      z.object({
        fileId: z.number(),
        fileName: z.string().optional(),
        description: z.string().optional(),
        adminId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update files",
        });
      }

      const updateData: any = {};
      if (input.fileName) updateData.fileName = input.fileName;
      if (input.description) updateData.description = input.description;

      await db.updateLibraryFile(input.fileId, updateData);

      return {
        success: true,
        message: "File updated successfully",
      };
    }),

  /**
   * Delete library file (admin only)
   */
  deleteFile: publicProcedure
    .input(z.object({ fileId: z.number(), adminId: z.number() }))
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete files",
        });
      }

      await db.deleteLibraryFile(input.fileId);

      return {
        success: true,
        message: "File deleted successfully",
      };
    }),

  /**
   * Search library files
   */
  searchFiles: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const allFiles = await db.getAllLibraryFiles();
      const query = input.query.toLowerCase();

      return allFiles.filter((file) => {
        return (
          file.fileName.toLowerCase().includes(query) ||
          (file.description && file.description.toLowerCase().includes(query))
        );
      });
    }),
});
