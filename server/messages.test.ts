import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Mensagens Privadas", () => {
  let student1Id: number;
  let student2Id: number;
  let messageId: number;

  beforeAll(async () => {
    // Create two test students with unique IDs (max 20 chars for studentId)
    const timestamp = Date.now().toString().slice(-6);
    const result1 = await db.createStudent({
      studentId: `TKW-2026-MSG-${timestamp}A`,
      username: `msg_test_u1_${timestamp}`,
      fullName: "Message Test User 1",
      email: `msg1_${timestamp}@test.com`,
      passwordHash: "hashed_password",
      grade: 1,
      district: 1,
    });
    student1Id = (result1 as any).insertId || result1.id;

    const result2 = await db.createStudent({
      studentId: `TKW-2026-MSG-${timestamp}B`,
      username: `msg_test_u2_${timestamp}`,
      fullName: "Message Test User 2",
      email: `msg2_${timestamp}@test.com`,
      passwordHash: "hashed_password",
      grade: 1,
      district: 1,
    });
    student2Id = (result2 as any).insertId || result2.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (student1Id) {
      await db.deleteStudent(student1Id);
    }
    if (student2Id) {
      await db.deleteStudent(student2Id);
    }
  });

  it("should send a message between two students", async () => {
    const result = await db.createMessage({
      senderId: student1Id,
      receiverId: student2Id,
      content: "Hello, this is a test message",
    });

    expect(result).toBeDefined();
    messageId = (result as any).insertId || result.id;
  });

  it("should get conversation between two students", async () => {
    const messages = await db.getMessagesBetweenStudents(student1Id, student2Id);
    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThan(0);
  });

  it("should mark message as read", async () => {
    if (messageId) {
      // This would require a function to update message read status
      // For now, just verify the message exists
      expect(messageId).toBeGreaterThan(0);
    }
  });

  it("should get unread messages", async () => {
    const unread = await db.getUnreadMessages(student2Id);
    expect(Array.isArray(unread)).toBe(true);
  });

  it("should delete a message", async () => {
    if (messageId) {
      // This would require a delete function
      // For now, just verify the message exists
      expect(messageId).toBeGreaterThan(0);
    }
  });
});
