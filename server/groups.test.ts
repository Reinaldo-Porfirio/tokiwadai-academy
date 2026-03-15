import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Grupos de Mensagens", () => {
  let student1Id: number;
  let student2Id: number;
  let student3Id: number;
  let groupId: number;

  beforeAll(async () => {
    // Create three test students
    const result1 = await db.createStudent({
      studentId: "TKW-2026-GRP-001",
      username: "group_test_user1",
      fullName: "Group Test User 1",
      email: "grp1@test.com",
      passwordHash: "hashed_password",
      grade: 1,
      district: 1,
    });
    student1Id = result1.id;

    const result2 = await db.createStudent({
      studentId: "TKW-2026-GRP-002",
      username: "group_test_user2",
      fullName: "Group Test User 2",
      email: "grp2@test.com",
      passwordHash: "hashed_password",
      grade: 1,
      district: 1,
    });
    student2Id = result2.id;

    const result3 = await db.createStudent({
      studentId: "TKW-2026-GRP-003",
      username: "group_test_user3",
      fullName: "Group Test User 3",
      email: "grp3@test.com",
      passwordHash: "hashed_password",
      grade: 1,
      district: 1,
    });
    student3Id = result3.id;
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
      description: "This is a test group",
      createdByStudentId: student1Id,
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("Test Group");
    expect(result.createdByStudentId).toBe(student1Id);
    groupId = result.id;
  });

  it("should add a member to the group", async () => {
    await db.addGroupMember(groupId, student2Id);
    const isMember = await db.isGroupMember(groupId, student2Id);
    expect(isMember).toBe(true);
  });

  it("should get group members", async () => {
    const members = await db.getGroupMembers(groupId);
    expect(Array.isArray(members)).toBe(true);
    expect(members.length).toBeGreaterThanOrEqual(1);
  });

  it("should send a message to the group", async () => {
    const result = await db.createGroupMessage({
      groupId,
      senderId: student1Id,
      content: "Hello group, this is a test message",
    });

    expect(result).toBeDefined();
  });

  it("should get group messages", async () => {
    const messages = await db.getGroupMessages(groupId, 10, 0);
    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].content).toBe("Hello group, this is a test message");
  });

  it("should get student groups", async () => {
    const groups = await db.getStudentGroups(student1Id);
    expect(Array.isArray(groups)).toBe(true);
    expect(groups.length).toBeGreaterThan(0);
  });

  it("should remove a member from the group", async () => {
    await db.removeGroupMember(groupId, student2Id);
    const isMember = await db.isGroupMember(groupId, student2Id);
    expect(isMember).toBe(false);
  });

  it("should update group information", async () => {
    await db.updateMessageGroup(groupId, {
      name: "Updated Test Group",
      description: "Updated description",
    });

    const group = await db.getMessageGroupById(groupId);
    expect(group?.name).toBe("Updated Test Group");
    expect(group?.description).toBe("Updated description");
  });

  it("should delete a group", async () => {
    await db.deleteMessageGroup(groupId);
    const group = await db.getMessageGroupById(groupId);
    expect(group).toBeNull();
  });
});
