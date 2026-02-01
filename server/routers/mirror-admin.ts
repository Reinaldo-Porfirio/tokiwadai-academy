import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const mirrorAdminRouter = router({
  /**
   * Get all posts for admin moderation
   */
  getAllPostsForAdmin: publicProcedure
    .input(
      z.object({
        adminId: z.number(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access this",
        });
      }

      const posts = await db.getAllPosts(input.limit, input.offset);

      // Enrich posts with student data and like count
      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          const student = await db.getStudentById(post.studentId);
          const comments = await db.getCommentsByPostId(post.id);
          const likes = await db.getLikesByPostId(post.id);

          return {
            ...post,
            student: student
              ? {
                  id: student.id,
                  fullName: student.fullName,
                  studentId: student.studentId,
                  profilePicture: student.profilePicture,
                }
              : null,
            commentsCount: comments.length,
            likesCount: likes.length,
            likes: likes,
          };
        })
      );

      return enrichedPosts;
    }),

  /**
   * Update post likes count (admin only)
   */
  updatePostLikes: publicProcedure
    .input(
      z.object({
        postId: z.number(),
        likesCount: z.number().int().min(0),
        adminId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update likes",
        });
      }

      const post = await db.getPostById(input.postId);
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      // Update post with new likes count
      await db.updatePost(input.postId, {
        likesCount: input.likesCount,
      });

      return {
        success: true,
        message: `Post likes updated to ${input.likesCount}`,
      };
    }),

  /**
   * Delete post (admin moderation)
   */
  deletePostAsAdmin: publicProcedure
    .input(
      z.object({
        postId: z.number(),
        adminId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete posts",
        });
      }

      const post = await db.getPostById(input.postId);
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      await db.deletePost(input.postId);

      return {
        success: true,
        message: `Post deleted by admin${input.reason ? `: ${input.reason}` : ""}`,
      };
    }),

  /**
   * Get student profile for admin editing
   */
  getStudentProfileForAdmin: publicProcedure
    .input(
      z.object({
        studentId: z.number(),
        adminId: z.number(),
      })
    )
    .query(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access this",
        });
      }

      const student = await db.getStudentById(input.studentId);
      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      // Remove password hash
      const { passwordHash, ...studentData } = student;
      return studentData;
    }),

  /**
   * Update student followers count (admin only)
   */
  updateStudentFollowers: publicProcedure
    .input(
      z.object({
        studentId: z.number(),
        followersCount: z.number().int().min(0),
        adminId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update followers",
        });
      }

      const student = await db.getStudentById(input.studentId);
      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      // Update student with new followers count
      await db.updateStudent(input.studentId, {
        followersCount: input.followersCount,
      });

      return {
        success: true,
        message: `Student followers updated to ${input.followersCount}`,
      };
    }),

  /**
   * Get all students for admin to edit followers
   */
  getAllStudentsForAdmin: publicProcedure
    .input(
      z.object({
        adminId: z.number(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access this",
        });
      }

      const students = await db.getAllStudents();

      // Remove password hashes and return with pagination
      const paginatedStudents = students
        .map(({ passwordHash, ...student }) => student)
        .slice(input.offset, input.offset + input.limit);

      return {
        students: paginatedStudents,
        total: students.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Get mirror statistics for admin dashboard
   */
  getMirrorStatsForAdmin: publicProcedure
    .input(z.object({ adminId: z.number() }))
    .query(async ({ input }) => {
      // Verify admin exists
      const admin = await db.getAdminById(input.adminId);
      if (!admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access this",
        });
      }

      const allPosts = await db.getAllPosts(10000, 0);
      const totalPosts = allPosts.length;

      // Count all comments and likes
      let totalComments = 0;
      let totalLikes = 0;

      for (const post of allPosts) {
        const comments = await db.getCommentsByPostId(post.id);
        const likes = await db.getLikesByPostId(post.id);
        totalComments += comments.length;
        totalLikes += likes.length;
      }

      const students = await db.getAllStudents();
      const totalFollowers = students.reduce(
        (sum, student) => sum + (student.followersCount || 0),
        0
      );

      return {
        totalPosts,
        totalComments,
        totalLikes,
        totalFollowers,
        averageLikesPerPost:
          totalPosts > 0 ? (totalLikes / totalPosts).toFixed(2) : 0,
        averageCommentsPerPost:
          totalPosts > 0 ? (totalComments / totalPosts).toFixed(2) : 0,
      };
    }),
});
