import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Mensagens Privadas", () => {
  let student1Id: number;
  let student2Id: number;
  let messageId: number;

  beforeAll(async () => {
    // Create two test students
    const result1 = await db.createStudent({
      studentId: "TKW-2026-MSG-001",
      username: "msg_test_user1",
      fullName: "Message Test User 1",
      email: "msg1@test.com",
      passwordHash: "hashed_password",
      grade: 1,
      district: 1,
    });
    student1Id = result1.id;

    const result2 = await db.createStudent({
      studentId: "TKW-2026-MSG-002",
      username: "msg_test_user2",
      fullName: "Message Test User 2",
      email: "msg2@test.com",
      passwordHash: "hashed_password",
      grade: 1,
      district: 1,
    });
    student2Id = result2.id;
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
    messageId = result.id;
  });

  it("should get messages between two students", async () => {
    const messages = await db.getMessagesBetweenStudents(student1Id, student2Id);
    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].content).toBe("Hello, this is a test message");
  });

  it("should get unread messages for a student", async () => {
    const unreadMessages = await db.getUnreadMessages(student2Id);
    expect(Array.isArray(unreadMessages)).toBe(true);
    expect(unreadMessages.length).toBeGreaterThan(0);
  });

  it("should mark a message as read", async () => {
    await db.markMessageAsRead(messageId);
    const messages = await db.getMessagesBetweenStudents(student1Id, student2Id);
    const message = messages.find((m) => m.id === messageId);
    expect(message?.isRead).toBe(true);
  });

  it("should send multiple messages", async () => {
    await db.createMessage({
      senderId: student2Id,
      receiverId: student1Id,
      content: "Reply to your message",
    });

    const messages = await db.getMessagesBetweenStudents(student1Id, student2Id);
    expect(messages.length).toBeGreaterThanOrEqual(2);
  });
});
