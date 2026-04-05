import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Mirror - Rede Social", () => {
  let studentId: number;
  let postId: number;

  beforeAll(async () => {
    // Create a test student with unique ID (max 20 chars for studentId)
    const timestamp = Date.now().toString().slice(-8);
    const result = await db.createStudent({
      studentId: `TKW-2026-${timestamp}`,
      username: `mirror_test_${timestamp}`,
      fullName: "Mirror Test User",
      email: `mirror_${timestamp}@test.com`,
      passwordHash: "hashed_password",
      grade: 1,
      district: 1,
    });
    // Get the ID from the insert result
    studentId = (result as any).insertId || result.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (studentId) {
      await db.deleteStudent(studentId);
    }
  });

  it("should create a post", async () => {
    const result = await db.createPost({
      studentId,
      content: "This is a test post",
      imageUrl: null,
    });

    expect(result).toBeDefined();
    postId = (result as any).insertId || result.id;
    expect(postId).toBeGreaterThan(0);
  });

  it("should get all posts", async () => {
    const posts = await db.getAllPosts(10, 0);
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
  });

  it("should get a single post", async () => {
    const post = await db.getPostById(postId);
    expect(post).toBeDefined();
    expect(post?.id).toBe(postId);
    expect(post?.content).toBe("This is a test post");
  });

  it("should add a like to a post", async () => {
    const result = await db.createLike({
      postId,
      studentId,
    });

    expect(result).toBeDefined();
  });

  it("should get likes for a post", async () => {
    const likes = await db.getLikesByPostId(postId);
    expect(Array.isArray(likes)).toBe(true);
    expect(likes.length).toBeGreaterThan(0);
  });

  it("should remove a like from a post", async () => {
    await db.removeLike(postId, studentId);
    const likes = await db.getLikesByPostId(postId);
    const hasLike = likes.some((like) => like.studentId === studentId);
    expect(hasLike).toBe(false);
  });

  it("should add a comment to a post", async () => {
    const result = await db.createComment({
      postId,
      studentId,
      content: "This is a test comment",
    });

    expect(result).toBeDefined();
  });

  it("should get comments for a post", async () => {
    const comments = await db.getCommentsByPostId(postId);
    expect(Array.isArray(comments)).toBe(true);
    expect(comments.length).toBeGreaterThan(0);
    expect(comments[0].content).toBe("This is a test comment");
  });

  it("should delete a post", async () => {
    await db.deletePost(postId);
    const post = await db.getPostById(postId);
    expect(post).toBeUndefined();
  });
});
