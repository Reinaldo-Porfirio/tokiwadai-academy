import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const messagesRouter = router({
  /**
   * Send a message
   */
  sendMessage: publicProcedure
    .input(
      z.object({
        senderId: z.number(),
        receiverId: z.number(),
        content: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ input }) => {
      // Verify both students exist
      const sender = await db.getStudentById(input.senderId);
      const receiver = await db.getStudentById(input.receiverId);

      if (!sender || !receiver) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      if (input.senderId === input.receiverId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot send message to yourself",
        });
      }

      // Create message
      await db.createMessage({
        senderId: input.senderId,
        receiverId: input.receiverId,
        content: input.content,
      });

      return {
        success: true,
        message: "Message sent successfully",
      };
    }),

  /**
   * Get conversation between two students
   */
  getConversation: publicProcedure
    .input(
      z.object({
        studentId1: z.number(),
        studentId2: z.number(),
      })
    )
    .query(async ({ input }) => {
      const messages = await db.getMessagesBetweenStudents(
        input.studentId1,
        input.studentId2
      );

      // Enrich messages with student data
      return await Promise.all(
        messages.map(async (message) => {
          const sender = await db.getStudentById(message.senderId);
          return {
            ...message,
            sender: sender
              ? {
                  id: sender.id,
                  fullName: sender.fullName,
                  studentId: sender.studentId,
                }
              : null,
          };
        })
      );
    }),

  /**
   * Get unread messages for a student
   */
  getUnread: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const messages = await db.getUnreadMessages(input.studentId);

      // Group by sender and get latest message from each
      const grouped: { [key: number]: typeof messages[0] } = {};
      for (const message of messages) {
        if (!grouped[message.senderId]) {
          grouped[message.senderId] = message;
        }
      }

      // Enrich with student data
      return await Promise.all(
        Object.values(grouped).map(async (message) => {
          const sender = await db.getStudentById(message.senderId);
          return {
            ...message,
            sender: sender
              ? {
                  id: sender.id,
                  fullName: sender.fullName,
                  studentId: sender.studentId,
                  profilePicture: sender.profilePicture,
                }
              : null,
          };
        })
      );
    }),

  /**
   * Mark message as read
   */
  markAsRead: publicProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ input }) => {
      await db.markMessageAsRead(input.messageId);

      return {
        success: true,
        message: "Message marked as read",
      };
    }),

  /**
   * Get all conversations for a student
   */
  getConversations: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      // Get all messages where student is sender or receiver
      const allMessages = await db.getAllPosts(10000, 0); // Get all messages (workaround)

      // For now, return empty - this would need a proper query in db.ts
      return [];
    }),

  /**
   * Get conversation list with latest message
   */
  getConversationList: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const unreadMessages = await db.getUnreadMessages(input.studentId);

      // Get unique senders
      const senderSet = new Set(unreadMessages.map((m) => m.senderId));
      const senderIds = Array.from(senderSet);

      // Enrich with student data
      return await Promise.all(
        senderIds.map(async (senderId: number) => {
          const sender = await db.getStudentById(senderId);
          const unreadCount = unreadMessages.filter(
            (m) => m.senderId === senderId
          ).length;

          return {
            senderId,
            sender: sender
              ? {
                  id: sender.id,
                  fullName: sender.fullName,
                  studentId: sender.studentId,
                  profilePicture: sender.profilePicture,
                }
              : null,
            unreadCount,
          };
        })
      );
    }),

  /**
   * Search for students to message
   */
  searchStudents: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const allStudents = await db.getAllStudents();
      const query = input.query.toLowerCase();

      const filtered = allStudents.filter((student) => {
        return (
          student.fullName.toLowerCase().includes(query) ||
          student.username.toLowerCase().includes(query) ||
          student.studentId.toLowerCase().includes(query)
        );
      });

      return filtered.map(({ passwordHash, ...student }) => student);
    }),
});
