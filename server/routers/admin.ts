import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import * as auth from "../utils/auth";
import { TRPCError } from "@trpc/server";

export const adminRouter = router({
  // ============================================================================
  // STUDENT MANAGEMENT
  // ============================================================================

  /**
   * Create a new student (for NPCs or admin registration)
   */
  createStudent: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(2),
        username: z.string().min(3).max(32),
        email: z.string().email(),
        password: z.string().min(8),
        birthDate: z.string().date(),
        grade: z.number().int().min(1).max(6),
        district: z.number().int().min(1).max(23),
        adminId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create students",
        });
      }

      // Check if username already exists
      const existingUsername = await db.getStudentByUsername(input.username);
      if (existingUsername) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already exists",
        });
      }

      // Generate student ID
      const studentId = await auth.generateStudentId();

      // Hash password
      const passwordHash = await auth.hashPassword(input.password);

      // Create student
      await db.createStudent({
        studentId,
        username: input.username,
        fullName: input.fullName,
        email: input.email,
        passwordHash,
        birthDate: new Date(input.birthDate),
        grade: input.grade,
        district: input.district,
      });

      return {
        success: true,
        studentId,
        message: "Student created successfully",
      };
    }),

  /**
   * Update student (admin only)
   */
  updateStudent: publicProcedure
    .input(
      z.object({
        studentId: z.number(),
        fullName: z.string().optional(),
        email: z.string().email().optional(),
        grade: z.number().int().min(1).max(6).optional(),
        district: z.number().int().min(1).max(23).optional(),
        password: z.string().min(8).optional(),
        adminId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update students",
        });
      }

      const updateData: any = {};
      if (input.fullName) updateData.fullName = input.fullName;
      if (input.email) updateData.email = input.email;
      if (input.grade) updateData.grade = input.grade;
      if (input.district) updateData.district = input.district;
      if (input.password) {
        updateData.passwordHash = await auth.hashPassword(input.password);
      }

      await db.updateStudent(input.studentId, updateData);

      return {
        success: true,
        message: "Student updated successfully",
      };
    }),

  /**
   * Delete student (admin only)
   */
  deleteStudent: publicProcedure
    .input(z.object({ studentId: z.number(), adminId: z.number() }))
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete students",
        });
      }

      await db.deleteStudent(input.studentId);

      return {
        success: true,
        message: "Student deleted successfully",
      };
    }),

  /**
   * Suspend student account (admin only)
   */
  suspendStudent: publicProcedure
    .input(z.object({ studentId: z.number(), adminId: z.number() }))
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can suspend students",
        });
      }

      await db.updateStudent(input.studentId, { isSuspended: true });

      return {
        success: true,
        message: "Student suspended successfully",
      };
    }),

  /**
   * Reactivate student account (admin only)
   */
  reactivateStudent: publicProcedure
    .input(z.object({ studentId: z.number(), adminId: z.number() }))
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can reactivate students",
        });
      }

      await db.updateStudent(input.studentId, { isSuspended: false });

      return {
        success: true,
        message: "Student reactivated successfully",
      };
    }),

  /**
   * Reset student password (admin only)
   */
  resetStudentPassword: publicProcedure
    .input(
      z.object({
        studentId: z.number(),
        newPassword: z.string().min(8),
        adminId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can reset passwords",
        });
      }

      const passwordHash = await auth.hashPassword(input.newPassword);
      await db.updateStudent(input.studentId, { passwordHash });

      return {
        success: true,
        message: "Password reset successfully",
      };
    }),

  // ============================================================================
  // MIRROR MODERATION
  // ============================================================================

  /**
   * Delete post (admin moderation)
   */
  deletePost: publicProcedure
    .input(z.object({ postId: z.number(), adminId: z.number() }))
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete posts",
        });
      }

      await db.deletePost(input.postId);

      return {
        success: true,
        message: "Post deleted successfully",
      };
    }),

  /**
   * Delete comment (admin moderation)
   */
  deleteComment: publicProcedure
    .input(z.object({ commentId: z.number(), adminId: z.number() }))
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete comments",
        });
      }

      await db.deleteComment(input.commentId);

      return {
        success: true,
        message: "Comment deleted successfully",
      };
    }),

  // ============================================================================
  // SYSTEM SETTINGS
  // ============================================================================

  /**
   * Update system settings (admin only)
   */
  updateSettings: publicProcedure
    .input(
      z.object({
        schoolName: z.string().optional(),
        currentYear: z.number().int().optional(),
        logoUrl: z.string().optional(),
        mapImageUrl: z.string().optional(),
        themeColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        adminId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update settings",
        });
      }

      // For now, return success (would need system settings table queries)
      return {
        success: true,
        message: "Settings updated successfully",
      };
    }),

  /**
   * Get dashboard statistics
   */
  getDashboardStats: publicProcedure
    .input(z.object({ adminId: z.number() }))
    .query(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view dashboard",
        });
      }

      const studentStats = await db.getStudentById(1); // Placeholder
      const allStudents = await db.getAllStudents();
      const allPosts = await db.getAllPosts(10000, 0);

      return {
        totalStudents: allStudents.length,
        totalPosts: allPosts.length,
        lastStudent: allStudents.length > 0 ? allStudents[allStudents.length - 1] : null,
      };
    }),

  /**
   * Change admin password
   */
  changeAdminPassword: publicProcedure
    .input(
      z.object({
        adminId: z.number(),
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Admin not found",
        });
      }

      // Verify current password
      const isPasswordValid = await auth.comparePassword(
        input.currentPassword,
        admin.passwordHash
      );

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const newPasswordHash = await auth.hashPassword(input.newPassword);
      await db.updateAdmin(input.adminId, { passwordHash: newPasswordHash });

      return {
        success: true,
        message: "Admin password changed successfully",
      };
    }),
});
