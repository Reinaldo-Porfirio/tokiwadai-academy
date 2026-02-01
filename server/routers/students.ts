import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import * as auth from "../utils/auth";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../storage";

export const studentsRouter = router({
  

  /**
   * Get student profile by ID
   */
  getProfile: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const student = await db.getStudentById(input.studentId);

      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      // Remove password hash from response
      const { passwordHash, ...studentData } = student;
      return studentData;
    }),

  /**
   * Update student profile
   */
  updateProfile: publicProcedure
    .input(
      z.object({
        studentId: z.number(),
        bio: z.string().max(500).optional(),
        profilePicture: z.string().optional(),
        password: z.string().min(8).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const student = await db.getStudentById(input.studentId);

      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      const updateData: any = {};

      if (input.bio !== undefined) {
        if (input.bio.length > 500) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Bio must not exceed 500 characters",
          });
        }
        updateData.bio = input.bio;
      }

      if (input.profilePicture !== undefined) {
        updateData.profilePicture = input.profilePicture;
      }

      if (input.password !== undefined) {
        if (!auth.isValidPassword(input.password)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Password must be at least 8 characters",
          });
        }
        updateData.passwordHash = await auth.hashPassword(input.password);
      }

      await db.updateStudent(input.studentId, updateData);

      return {
        success: true,
        message: "Profile updated successfully",
      };
    }),

  /**
   * Get all students (for admin panel)
   */
  getAll: publicProcedure.query(async () => {
    const students = await db.getAllStudents();

    // Remove password hashes from response
    return students.map(({ passwordHash, ...student }) => student);
  }),

  /**
   * Get student by username
   */
  getByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const student = await db.getStudentByUsername(input.username);

      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      const { passwordHash, ...studentData } = student;
      return studentData;
    }),

  /**
   * Search students by name or username
   */
  search: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const allStudents = await db.getAllStudents();

      const filtered = allStudents.filter((student) => {
        const query = input.query.toLowerCase();
        return (
          student.fullName.toLowerCase().includes(query) ||
          student.username.toLowerCase().includes(query) ||
          student.studentId.toLowerCase().includes(query)
        );
      });

      // Remove password hashes
      return filtered.map(({ passwordHash, ...student }) => student);
    }),

  /**
   * Get student statistics (for admin dashboard)
   */
  getStats: publicProcedure.query(async () => {
    const students = await db.getAllStudents();
    const totalStudents = students.length;
    const suspendedStudents = students.filter((s) => s.isSuspended).length;
    const activeStudents = totalStudents - suspendedStudents;

    // Get latest student
    const latestStudent = students.length > 0 ? students[students.length - 1] : null;

    return {
      totalStudents,
      activeStudents,
      suspendedStudents,
      latestStudent: latestStudent
        ? {
            id: latestStudent.id,
            fullName: latestStudent.fullName,
            studentId: latestStudent.studentId,
            createdAt: latestStudent.createdAt,
          }
        : null,
    };
  }),

  /**
   * Upload profile photo
   */
  uploadProfilePhoto: publicProcedure
    .input(
      z.object({
        studentId: z.number(),
        imageData: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const buffer = Buffer.from(input.imageData, "base64");
        const sizeMB = buffer.length / (1024 * 1024);
        
        if (sizeMB > 5) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Image too large. Maximum: 5MB",
          });
        }

        const fileKey = `students/${input.studentId}/profile-${Date.now()}.jpg`;
        const { url } = await storagePut(fileKey, buffer, "image/jpeg");

        await db.updateStudent(input.studentId, {
          profilePicture: url,
        });

        return {
          success: true,
          url,
          message: "Profile photo updated successfully",
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Error uploading photo",
        });
      }
    }),

  /**
   * Upload post image
   */
  uploadPostImage: publicProcedure
    .input(
      z.object({
        studentId: z.number(),
        imageData: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const buffer = Buffer.from(input.imageData, "base64");
        const sizeMB = buffer.length / (1024 * 1024);
        
        if (sizeMB > 10) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Image too large. Maximum: 10MB",
          });
        }

        const fileKey = `posts/${input.studentId}/image-${Date.now()}.jpg`;
        const { url } = await storagePut(fileKey, buffer, "image/jpeg");

        return {
          success: true,
          url,
          message: "Image uploaded successfully",
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Error uploading image",
        });
      }
    }),
});
