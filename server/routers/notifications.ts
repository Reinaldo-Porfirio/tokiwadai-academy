import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const notificationsRouter = router({
  /**
   * Create a notification
   */
  create: publicProcedure
    .input(
      z.object({
        studentId: z.number(),
        type: z.enum(["message", "event", "post_like", "post_comment"]),
        title: z.string(),
        content: z.string().optional(),
        relatedId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify student exists
      const student = await db.getStudentById(input.studentId);
      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      await db.createNotification({
        studentId: input.studentId,
        type: input.type,
        title: input.title,
        content: input.content,
        relatedId: input.relatedId,
      });

      return {
        success: true,
        message: "Notification created successfully",
      };
    }),

  /**
   * Get all notifications for a student
   */
  getAll: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      return await db.getNotificationsByStudentId(input.studentId);
    }),

  /**
   * Get unread notifications for a student
   */
  getUnread: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      return await db.getUnreadNotifications(input.studentId);
    }),

  /**
   * Mark notification as read
   */
  markAsRead: publicProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      await db.markNotificationAsRead(input.notificationId);

      return {
        success: true,
        message: "Notification marked as read",
      };
    }),

  /**
   * Delete notification
   */
  delete: publicProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteNotification(input.notificationId);

      return {
        success: true,
        message: "Notification deleted successfully",
      };
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .mutation(async ({ input }) => {
      const notifications = await db.getUnreadNotifications(input.studentId);

      for (const notification of notifications) {
        await db.markNotificationAsRead(notification.id);
      }

      return {
        success: true,
        message: "All notifications marked as read",
      };
    }),

  /**
   * Get notification count
   */
  getUnreadCount: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const unread = await db.getUnreadNotifications(input.studentId);
      return {
        count: unread.length,
      };
    }),
});
