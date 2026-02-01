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
        throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
      }
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
      }

      const updateData: any = {};
      if (input.bio !== undefined) updateData.bio = input.bio;
      if (input.profilePicture !== undefined) updateData.profilePicture = input.profilePicture;
      if (input.password !== undefined) {
        updateData.passwordHash = await auth.hashPassword(input.password);
      }

      await db.updateStudent(input.studentId, updateData);
      return { success: true };
    }),

  /**
   * Get all students (for admin panel)
   */
  getAll: publicProcedure.query(async () => {
    const students = await db.getAllStudents();
    return students.map(({ passwordHash, ...student }) => student);
  }),

  /**
   * ADMIN ONLY: Update follower count
   * NOTA: Se der erro no 'followersCount', você precisa adicionar essa coluna no seu Prisma
   */
  updateFollowers: publicProcedure
    .input(z.object({ studentId: z.number(), count: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateStudent(input.studentId, { ["followersCount" as any]: input.count });
      return { success: true };
    }),
    
    

  /**
   * Get student by username
   */
  getByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const student = await db.getStudentByUsername(input.username);
      if (!student) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
      }
      const { passwordHash, ...studentData } = student;
      return studentData;
    }),

  /**
   * Search students by name or username
   */
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const allStudents = await db.getAllStudents();
      return allStudents.filter(s => 
        s.fullName.toLowerCase().includes(input.query.toLowerCase()) ||
        s.studentId.toLowerCase().includes(input.query.toLowerCase())
      ).map(({ passwordHash, ...s }) => s);
    }),

  /**
   * Get student statistics (for admin dashboard)
   */
  getStats: publicProcedure.query(async () => {
    const students = await db.getAllStudents();
    return {
      totalStudents: students.length,
      activeStudents: students.filter(s => !s.isSuspended).length,
      suspendedStudents: students.filter(s => s.isSuspended).length,
    };
  }),

  /**
   * Upload profile photo
   */
  uploadProfilePhoto: publicProcedure
    .input(z.object({ studentId: z.number(), imageData: z.string() }))
    .mutation(async ({ input }) => {
      const base64Data = input.imageData.includes(",") ? input.imageData.split(",")[1] : input.imageData;
      const buffer = Buffer.from(base64Data, "base64");
      const fileKey = `students/${input.studentId}/profile-${Date.now()}.jpg`;
      const { url } = await storagePut(fileKey, buffer, "image/jpeg");

      await db.updateStudent(input.studentId, { profilePicture: url });
      return { success: true, url };
    }),

  /**
   * Upload post image
   */
  uploadPostImage: publicProcedure
    .input(z.object({ studentId: z.number(), imageData: z.string() }))
    .mutation(async ({ input }) => {
      const base64Data = input.imageData.includes(",") ? input.imageData.split(",")[1] : input.imageData;
      const buffer = Buffer.from(base64Data, "base64");
      const fileKey = `posts/${input.studentId}/image-${Date.now()}.jpg`;
      const { url } = await storagePut(fileKey, buffer, "image/jpeg");
      return { success: true, url };
    }),
});