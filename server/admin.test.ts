import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import * as auth from "./utils/auth";

describe("Admin Student Management", () => {
  let adminId: number;
  let studentId: number;

  beforeAll(async () => {
    // Create test admin
    const adminPassword = await auth.hashPassword("admin_test_123");
    // Note: In real tests, you'd use a test database
  });

  it("should create a new student", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.admin.createStudent({
      fullName: "Test Student",
      username: "teststudent",
      email: "test@example.com",
      password: "password123",
      birthDate: "2010-05-15",
      grade: 1,
      district: 5,
      adminId: 1,
    });

    expect(result.success).toBe(true);
    expect(result.studentId).toMatch(/^TKW-\d{4}-\d{5}$/);
  });

  it("should prevent duplicate usernames", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    // Try to create two students with same username
    try {
      await caller.admin.createStudent({
        fullName: "Student 1",
        username: "duplicate",
        email: "student1@example.com",
        password: "password123",
        birthDate: "2010-05-15",
        grade: 1,
        district: 1,
        adminId: 1,
      });

      await caller.admin.createStudent({
        fullName: "Student 2",
        username: "duplicate",
        email: "student2@example.com",
        password: "password123",
        birthDate: "2010-05-15",
        grade: 1,
        district: 1,
        adminId: 1,
      });

      expect.fail("Should have thrown error for duplicate username");
    } catch (error: any) {
      expect(error.code).toBe("CONFLICT");
    }
  });

  it("should list all students", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const students = await caller.admin.listStudents({
      adminId: 1,
    });

    expect(Array.isArray(students)).toBe(true);
    expect(students.length).toBeGreaterThan(0);
    expect(students[0]).toHaveProperty("studentId");
    expect(students[0]).toHaveProperty("fullName");
    expect(students[0]).toHaveProperty("status");
  });

  it("should suspend a student", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.admin.suspendStudent({
      studentId: 1,
      adminId: 1,
    });

    expect(result.success).toBe(true);
  });

  it("should reactivate a suspended student", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.admin.reactivateStudent({
      studentId: 1,
      adminId: 1,
    });

    expect(result.success).toBe(true);
  });

  it("should update student information", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.admin.updateStudent({
      studentId: 1,
      fullName: "Updated Name",
      email: "updated@example.com",
      grade: 3,
      district: 10,
      adminId: 1,
    });

    expect(result.success).toBe(true);
  });

  it("should delete a student", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.admin.deleteStudent({
      studentId: 1,
      adminId: 1,
    });

    expect(result.success).toBe(true);
  });

  it("should prevent non-admin from managing students", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    try {
      await caller.admin.listStudents({
        adminId: 999, // Non-existent admin
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });
});
