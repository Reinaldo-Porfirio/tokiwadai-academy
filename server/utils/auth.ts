import bcrypt from "bcryptjs";
import * as db from "../db";

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a unique student ID in format TKW-[YEAR]-[NUMBER]
 * Example: TKW-2026-00001
 */
export async function generateStudentId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  // Get all students from current year
  const allStudents = await db.getAllStudents();
  const currentYearStudents = allStudents.filter((s) => {
    const year = parseInt(s.studentId.split("-")[1]);
    return year === currentYear;
  });

  // Get the next number
  const nextNumber = currentYearStudents.length + 1;
  const paddedNumber = String(nextNumber).padStart(5, "0");

  return `TKW-${currentYear}-${paddedNumber}`;
}

/**
 * Validate student ID format
 */
export function isValidStudentIdFormat(studentId: string): boolean {
  const regex = /^TKW-\d{4}-\d{5}$/;
  return regex.test(studentId);
}

/**
 * Validate password strength (minimum 8 characters)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate username (alphanumeric, 3-32 characters)
 */
export function isValidUsername(username: string): boolean {
  const regex = /^[a-zA-Z0-9_]{3,32}$/;
  return regex.test(username);
}
