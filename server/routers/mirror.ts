import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const mirrorRouter = router({
  /**
   * Create a new post
   */

  
  createPost: publicProcedure
    .input(
      z.object({
        studentId: z.number(),
        content: z.string().min(1).max(500),
        imageUrl: z.string().optional(),
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

      // Create post
      const result = await db.createPost({
        studentId: input.studentId,
        content: input.content,
        imageUrl: input.imageUrl,
      });

      return {
        success: true,
        message: "Post created successfully",
      };
    }),

  /**
   * Get all posts (feed)
   */
  getFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const posts = await db.getAllPosts(input.limit, input.offset);

      // Enrich posts with student data
      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          const student = await db.getStudentById(post.studentId);
          const comments = await db.getCommentsByPostId(post.id);

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
          };
        })
      );

      return enrichedPosts;
    }),

  /**
   * Get single post with all details
   */
  getPost: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const post = await db.getPostById(input.postId);

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      const student = await db.getStudentById(post.studentId);
      const comments = await db.getCommentsByPostId(post.id);

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
        comments: await Promise.all(
          comments.map(async (comment) => {
            const commentStudent = await db.getStudentById(comment.studentId);
            return {
              ...comment,
              student: commentStudent
                ? {
                    id: commentStudent.id,
                    fullName: commentStudent.fullName,
                    studentId: commentStudent.studentId,
                  }
                : null,
            };
          })
        ),
      };
    }),

  /**
   * Delete a post
   */
  deletePost: publicProcedure
    .input(z.object({ postId: z.number(), studentId: z.number() }))
    .mutation(async ({ input }) => {
      const post = await db.getPostById(input.postId);

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      // Check if student owns the post
      if (post.studentId !== input.studentId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own posts",
        });
      }

      await db.deletePost(input.postId);

      return {
        success: true,
        message: "Post deleted successfully",
      };
    }),

  /**
   * Like a post
   */
  likePost: publicProcedure
    .input(z.object({ postId: z.number(), studentId: z.number() }))
    .mutation(async ({ input }) => {
      const post = await db.getPostById(input.postId);

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      // Check if already liked
      const existingLike = await db.getLikeByPostAndStudent(
        input.postId,
        input.studentId
      );

      if (existingLike) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Already liked this post",
        });
      }

      // Create like
      await db.createLike({
        postId: input.postId,
        studentId: input.studentId,
      });

      // Update post likes count
      const updatedPost = await db.getPostById(input.postId);
      const allLikes = await db.getAllPosts(1000, 0); // Get all posts to count likes
      const postLikes = allLikes.filter((p) => p.id === input.postId);

      return {
        success: true,
        message: "Post liked successfully",
      };
    }),

  /**
   * Unlike a post
   */
  unlikePost: publicProcedure
    .input(z.object({ postId: z.number(), studentId: z.number() }))
    .mutation(async ({ input }) => {
      const like = await db.getLikeByPostAndStudent(
        input.postId,
        input.studentId
      );

      if (!like) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Like not found",
        });
      }

      await db.deleteLike(input.postId, input.studentId);

      return {
        success: true,
        message: "Post unliked successfully",
      };
    }),

  /**
   * Add comment to post
   */
  addComment: publicProcedure
    .input(
      z.object({
        postId: z.number(),
        studentId: z.number(),
        content: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ input }) => {
      const post = await db.getPostById(input.postId);

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      await db.createComment({
        postId: input.postId,
        studentId: input.studentId,
        content: input.content,
      });

      return {
        success: true,
        message: "Comment added successfully",
      };
    }),

  /**
   * Delete comment
   */
  deleteComment: publicProcedure
    .input(z.object({ commentId: z.number(), studentId: z.number() }))
    .mutation(async ({ input }) => {
      const comment = await db.getCommentsByPostId(input.commentId);

      if (comment.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      const targetComment = comment[0];

      // Check if student owns the comment
      if (targetComment.studentId !== input.studentId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own comments",
        });
      }

      await db.deleteComment(input.commentId);

      return {
        success: true,
        message: "Comment deleted successfully",
      };
    }),

  /**
   * Search posts by content or author
   */
  search: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const allPosts = await db.getAllPosts(1000, 0);
      const query = input.query.toLowerCase();

      const filtered = allPosts.filter((post) => {
        return post.content.toLowerCase().includes(query);
      });

      // Enrich posts with student data
      return await Promise.all(
        filtered.map(async (post) => {
          const student = await db.getStudentById(post.studentId);
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
          };
        })
      );
    }),

  /**
   * Get posts by student
   */
  getByStudent: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const allPosts = await db.getAllPosts(1000, 0);
      const studentPosts = allPosts.filter(
        (post) => post.studentId === input.studentId
      );

      return await Promise.all(
        studentPosts.map(async (post) => {
          const student = await db.getStudentById(post.studentId);
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
          };
        })
      );
    }),

  /**
   * Get mirror statistics (for admin dashboard)
   */
  getStats: publicProcedure.query(async () => {
    const allPosts = await db.getAllPosts(10000, 0);
    const totalPosts = allPosts.length;

    // Count all comments
    let totalComments = 0;
    for (const post of allPosts) {
      const comments = await db.getCommentsByPostId(post.id);
      totalComments += comments.length;
    }

    return {
      totalPosts,
      totalComments,
    };
  }),
});
