import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as auth from "./utils/auth";
import * as db from "./db";

describe("Authentication and Student ID Generation", () => {
  describe("Password hashing and comparison", () => {
    it("should hash a password", async () => {
      const password = "testPassword123";
      const hash = await auth.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should compare password correctly", async () => {
      const password = "testPassword123";
      const hash = await auth.hashPassword(password);

      const isValid = await auth.comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should not match incorrect password", async () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword456";
      const hash = await auth.hashPassword(password);

      const isValid = await auth.comparePassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe("Student ID generation", () => {
    it("should generate valid student ID format", async () => {
      const studentId = await auth.generateStudentId();

      expect(studentId).toMatch(/^TKW-\d{4}-\d{5}$/);
    });

    it("should include current year in student ID", async () => {
      const studentId = await auth.generateStudentId();
      const currentYear = new Date().getFullYear();

      expect(studentId).toContain(`TKW-${currentYear}`);
    });

    it("should validate student ID format correctly", () => {
      const validId = "TKW-2026-00001";
      const invalidId1 = "TKW-2026-1"; // Too few digits
      const invalidId2 = "TKW-26-00001"; // Wrong year format
      const invalidId3 = "INVALID-2026-00001"; // Wrong prefix

      expect(auth.isValidStudentIdFormat(validId)).toBe(true);
      expect(auth.isValidStudentIdFormat(invalidId1)).toBe(false);
      expect(auth.isValidStudentIdFormat(invalidId2)).toBe(false);
      expect(auth.isValidStudentIdFormat(invalidId3)).toBe(false);
    });
  });

  describe("Password validation", () => {
    it("should accept valid password", () => {
      const validPassword = "ValidPass123";
      expect(auth.isValidPassword(validPassword)).toBe(true);
    });

    it("should reject password less than 8 characters", () => {
      const shortPassword = "Short12";
      expect(auth.isValidPassword(shortPassword)).toBe(false);
    });

    it("should accept exactly 8 character password", () => {
      const eightCharPassword = "EightChr";
      expect(auth.isValidPassword(eightCharPassword)).toBe(true);
    });
  });

  describe("Email validation", () => {
    it("should validate correct email format", () => {
      expect(auth.isValidEmail("test@example.com")).toBe(true);
      expect(auth.isValidEmail("user.name@domain.co.uk")).toBe(true);
    });

    it("should reject invalid email format", () => {
      expect(auth.isValidEmail("invalid.email")).toBe(false);
      expect(auth.isValidEmail("@example.com")).toBe(false);
      expect(auth.isValidEmail("user@")).toBe(false);
    });
  });

  describe("Username validation", () => {
    it("should accept valid username", () => {
      expect(auth.isValidUsername("user123")).toBe(true);
      expect(auth.isValidUsername("valid_user")).toBe(true);
      expect(auth.isValidUsername("abc")).toBe(true);
    });

    it("should reject username less than 3 characters", () => {
      expect(auth.isValidUsername("ab")).toBe(false);
    });

    it("should reject username with invalid characters", () => {
      expect(auth.isValidUsername("user@name")).toBe(false);
      expect(auth.isValidUsername("user-name")).toBe(false);
      expect(auth.isValidUsername("user name")).toBe(false);
    });

    it("should reject username longer than 32 characters", () => {
      const longUsername = "a".repeat(33);
      expect(auth.isValidUsername(longUsername)).toBe(false);
    });

    it("should accept username exactly 32 characters", () => {
      const maxUsername = "a".repeat(32);
      expect(auth.isValidUsername(maxUsername)).toBe(true);
    });
  });
});
