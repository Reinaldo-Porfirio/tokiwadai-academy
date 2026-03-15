import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const groupsRouter = router({
  /**
   * Create a new message group
   */
  createGroup: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().max(500).optional(),
        createdByStudentId: z.number(),
        memberIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify creator exists
      const creator = await db.getStudentById(input.createdByStudentId);
      if (!creator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      // Create group
      const group = await db.createMessageGroup({
        name: input.name,
        description: input.description,
        createdByStudentId: input.createdByStudentId,
      });

      // Add creator as member
      await db.addGroupMember(group.id, input.createdByStudentId);

      // Add other members if provided
      if (input.memberIds && input.memberIds.length > 0) {
        for (const memberId of input.memberIds) {
          // Verify member exists
          const member = await db.getStudentById(memberId);
          if (member) {
            await db.addGroupMember(group.id, memberId);
          }
        }
      }

      return {
        success: true,
        message: "Group created successfully",
        groupId: group.id,
      };
    }),

  /**
   * Get all groups for a student
   */
  getStudentGroups: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      return await db.getStudentGroups(input.studentId);
    }),

  /**
   * Get group details with members
   */
  getGroup: publicProcedure
    .input(z.object({ groupId: z.number() }))
    .query(async ({ input }) => {
      const group = await db.getMessageGroupById(input.groupId);

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      // Get members
      const members = await db.getGroupMembers(input.groupId);

      // Enrich members with student data
      const enrichedMembers = await Promise.all(
        members.map(async (member) => {
          const student = await db.getStudentById(member.studentId);
          return {
            ...member,
            student: student
              ? {
                  id: student.id,
                  fullName: student.fullName,
                  studentId: student.studentId,
                }
              : null,
          };
        })
      );

      return {
        ...group,
        members: enrichedMembers,
      };
    }),

  /**
   * Get group messages
   */
  getGroupMessages: publicProcedure
    .input(
      z.object({
        groupId: z.number(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const messages = await db.getGroupMessages(input.groupId, input.limit, input.offset);

      // Enrich messages with student data
      const enrichedMessages = await Promise.all(
        messages.map(async (message) => {
          const student = await db.getStudentById(message.senderId);
          return {
            ...message,
            sender: student
              ? {
                  id: student.id,
                  fullName: student.fullName,
                  studentId: student.studentId,
                }
              : null,
          };
        })
      );

      return enrichedMessages;
    }),

  /**
   * Send message to group
   */
  sendGroupMessage: publicProcedure
    .input(
      z.object({
        groupId: z.number(),
        senderId: z.number(),
        content: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ input }) => {
      // Verify group exists
      const group = await db.getMessageGroupById(input.groupId);
      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      // Verify sender is member of group
      const isMember = await db.isGroupMember(input.groupId, input.senderId);
      if (!isMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this group",
        });
      }

      // Create message
      await db.createGroupMessage({
        groupId: input.groupId,
        senderId: input.senderId,
        content: input.content,
      });

      return {
        success: true,
        message: "Message sent successfully",
      };
    }),

  /**
   * Add member to group
   */
  addMember: publicProcedure
    .input(
      z.object({
        groupId: z.number(),
        studentId: z.number(),
        addedByStudentId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify group exists
      const group = await db.getMessageGroupById(input.groupId);
      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      // Verify adder is member of group
      const isAdderMember = await db.isGroupMember(input.groupId, input.addedByStudentId);
      if (!isAdderMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this group",
        });
      }

      // Verify student exists
      const student = await db.getStudentById(input.studentId);
      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      // Check if already member
      const isAlreadyMember = await db.isGroupMember(input.groupId, input.studentId);
      if (isAlreadyMember) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Student is already a member of this group",
        });
      }

      // Add member
      await db.addGroupMember(input.groupId, input.studentId);

      return {
        success: true,
        message: "Member added successfully",
      };
    }),

  /**
   * Remove member from group
   */
  removeMember: publicProcedure
    .input(
      z.object({
        groupId: z.number(),
        studentId: z.number(),
        removedByStudentId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify group exists
      const group = await db.getMessageGroupById(input.groupId);
      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      // Verify remover is creator or member
      const isRemoverMember = await db.isGroupMember(input.groupId, input.removedByStudentId);
      if (!isRemoverMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this group",
        });
      }

      // Remove member
      await db.removeGroupMember(input.groupId, input.studentId);

      return {
        success: true,
        message: "Member removed successfully",
      };
    }),

  /**
   * Delete group (only creator)
   */
  deleteGroup: publicProcedure
    .input(
      z.object({
        groupId: z.number(),
        deletedByStudentId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify group exists
      const group = await db.getMessageGroupById(input.groupId);
      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      // Verify deleter is creator
      if (group.createdByStudentId !== input.deletedByStudentId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the group creator can delete the group",
        });
      }

      // Delete group
      await db.deleteMessageGroup(input.groupId);

      return {
        success: true,
        message: "Group deleted successfully",
      };
    }),

  /**
   * Update group info
   */
  updateGroup: publicProcedure
    .input(
      z.object({
        groupId: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().max(500).optional(),
        updatedByStudentId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify group exists
      const group = await db.getMessageGroupById(input.groupId);
      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      // Verify updater is creator
      if (group.createdByStudentId !== input.updatedByStudentId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the group creator can update the group",
        });
      }

      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;

      await db.updateMessageGroup(input.groupId, updateData);

      return {
        success: true,
        message: "Group updated successfully",
      };
    }),
});
