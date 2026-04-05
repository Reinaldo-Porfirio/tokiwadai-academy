import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Grupos de Mensagens", () => {
  let student1Id: number;
  let student2Id: number;
  let student3Id: number;
  let groupId: number;

  beforeAll(async () => {
    // Create three test students with unique IDs (max 20 chars for studentId)
    const timestamp = Date.now().toString().slice(-5);
    const result1 = await db.createStudent({
      studentId: `TKW-2026-GRP-${timestamp}1`,
      username: `grp_test_u1_${timestamp}`,
      fullName: "Group Test User 1",
      email: `grp1_${timestamp}@test.com`,
      passwordHash: "hashed_password",
      grade: 1,
      district: 1,
    });
    student1Id = (result1 as any).insertId || result1.id;

    const result2 = await db.createStudent({
      studentId: `TKW-2026-GRP-${timestamp}2`,
      username: `grp_test_u2_${timestamp}`,
      fullName: "Group Test User 2",
      email: `grp2_${timestamp}@test.com`,
      passwordHash: "hashed_password",
      grade: 1,
      district: 1,
    });
    student2Id = (result2 as any).insertId || result2.id;

    const result3 = await db.createStudent({
      studentId: `TKW-2026-GRP-${timestamp}3`,
      username: `grp_test_u3_${timestamp}`,
      fullName: "Group Test User 3",
      email: `grp3_${timestamp}@test.com`,
      passwordHash: "hashed_password",
      grade: 1,
      district: 1,
    });
    student3Id = (result3 as any).insertId || result3.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (student1Id) {
      await db.deleteStudent(student1Id);
    }
    if (student2Id) {
      await db.deleteStudent(student2Id);
    }
    if (student3Id) {
      await db.deleteStudent(student3Id);
    }
  });

  it("should create a message group", async () => {
    const result = await db.createMessageGroup({
      name: "Test Group",
      description: "A test group for testing",
      createdByStudentId: student1Id,
    });

    expect(result).toBeDefined();
    groupId = (result as any).insertId || result.id;
    expect(groupId).toBeGreaterThan(0);
  });

  it("should add members to a group", async () => {
    if (groupId) {
      const result1 = await db.addGroupMember(groupId, student1Id);
      const result2 = await db.addGroupMember(groupId, student2Id);
      const result3 = await db.addGroupMember(groupId, student3Id);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result3).toBeDefined();
    }
  });

  it("should get group members", async () => {
    if (groupId) {
      const members = await db.getGroupMembers(groupId);
      expect(Array.isArray(members)).toBe(true);
      expect(members.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("should send a message to a group", async () => {
    if (groupId) {
      const result = await db.createGroupMessage({
        groupId,
        senderId: student1Id,
        content: "Hello group, this is a test message",
      });

      expect(result).toBeDefined();
    }
  });

  it("should get group messages", async () => {
    if (groupId) {
      const messages = await db.getGroupMessages(groupId);
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeGreaterThan(0);
    }
  });

  it("should remove a member from a group", async () => {
    if (groupId) {
      const result = await db.removeGroupMember(groupId, student3Id);
      expect(result).toBeDefined();
    }
  });

  it("should delete a group", async () => {
    if (groupId) {
      const result = await db.deleteMessageGroup(groupId);
      expect(result).toBeDefined();
    }
  });
});
