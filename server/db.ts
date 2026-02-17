import { eq, or, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  InsertStudent,
  students,
  InsertAdmin,
  admins,
  InsertPost,
  posts,
  InsertLike,
  likes,
  InsertComment,
  comments,
  InsertMessage,
  messages,
  InsertCalendarEvent,
  calendarEvents,
  InsertLibraryFile,
  libraryFiles,
  InsertNotification,
  notifications,
  messageGroups,
  InsertMessageGroup,
  groupMembers,
  InsertGroupMember,
  groupMessages,
  InsertGroupMessage,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// MANUS OAUTH USERS (for Manus platform integration)
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// STUDENTS (Tokiwadai Academy)
// ============================================================================

export async function createStudent(student: InsertStudent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(students).values(student);
  return result;
}

export async function getStudentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(students)
    .where(eq(students.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(students)
    .where(eq(students.username, username))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentByStudentId(studentId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(students)
    .where(eq(students.studentId, studentId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllStudents() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(students);
}

export async function updateStudent(id: number, data: Partial<InsertStudent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(students).set(data).where(eq(students.id, id));
}

export async function deleteStudent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(students).where(eq(students.id, id));
}

// ============================================================================
// ADMINS (Tokiwadai Academy)
// ============================================================================

export async function createAdmin(admin: InsertAdmin) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(admins).values(admin);
}

export async function getAdminByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(admins)
    .where(eq(admins.username, username))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAdminById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(admins)
    .where(eq(admins.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateAdmin(id: number, data: Partial<InsertAdmin>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(admins).set(data).where(eq(admins.id, id));
}

// ============================================================================
// POSTS (Mirror - Social Network)
// ============================================================================

export async function createPost(post: InsertPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(posts).values(post);
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllPosts(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  // Return posts in reverse chronological order (newest first)
  return await db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(posts).where(eq(posts.id, id));
}

export async function updatePost(id: number, data: Partial<InsertPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(posts).set(data).where(eq(posts.id, id));
}

export async function getLikesByPostId(postId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(likes)
    .where(eq(likes.postId, postId));
}

// ============================================================================
// LIKES
// ============================================================================

export async function createLike(like: InsertLike) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(likes).values(like);
}

export async function deleteLike(postId: number, studentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(likes)
    .where(
      eq(likes.postId, postId) && eq(likes.studentId, studentId)
    );
}

export async function getLikeByPostAndStudent(postId: number, studentId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(likes)
    .where(
      eq(likes.postId, postId) && eq(likes.studentId, studentId)
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllLikes() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(likes);
}

// ============================================================================
// COMMENTS
// ============================================================================

export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(comments).values(comment);
}

export async function getCommentsByPostId(postId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(comments)
    .where(eq(comments.postId, postId));
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(comments).where(eq(comments.id, id));
}

// ============================================================================
// MESSAGES
// ============================================================================

export async function createMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(messages).values(message);
}

export async function getMessagesBetweenStudents(
  studentId1: number,
  studentId2: number
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(messages)
    .where(
      or(
        and(eq(messages.senderId, studentId1), eq(messages.receiverId, studentId2)),
        and(eq(messages.senderId, studentId2), eq(messages.receiverId, studentId1))
      )
    )
    .orderBy(desc(messages.createdAt));
}

export async function getUnreadMessages(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(messages)
    .where(
      eq(messages.receiverId, studentId) && eq(messages.isRead, false)
    );
}

export async function markMessageAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(messages)
    .set({ isRead: true })
    .where(eq(messages.id, id));
}

// ============================================================================
// CALENDAR EVENTS
// ============================================================================

export async function createCalendarEvent(event: InsertCalendarEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(calendarEvents).values(event);
}

export async function getCalendarEventsByDate(date: Date) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(calendarEvents)
    .where(eq(calendarEvents.eventDate, date));
}

export async function getAllCalendarEvents() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(calendarEvents);
}

export async function updateCalendarEvent(
  id: number,
  data: Partial<InsertCalendarEvent>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(calendarEvents)
    .set(data)
    .where(eq(calendarEvents.id, id));
}

export async function deleteCalendarEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
}

// ============================================================================
// LIBRARY FILES
// ============================================================================

export async function createLibraryFile(file: InsertLibraryFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(libraryFiles).values(file);
}

export async function getAllLibraryFiles() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(libraryFiles);
}

export async function getLibraryFilesByCategory(category: "material" | "regulation" | "map" | "other") {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(libraryFiles)
    .where(eq(libraryFiles.category, category))
}

export async function updateLibraryFile(
  id: number,
  data: Partial<InsertLibraryFile>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(libraryFiles)
    .set(data)
    .where(eq(libraryFiles.id, id));
}

export async function deleteLibraryFile(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(libraryFiles).where(eq(libraryFiles.id, id));
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(notifications).values(notification);
}

export async function getNotificationsByStudentId(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.studentId, studentId));
}

export async function getUnreadNotifications(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(
      eq(notifications.studentId, studentId) && eq(notifications.isRead, false)
    );
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id));
}

export async function deleteNotification(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(notifications).where(eq(notifications.id, id));
}


// ============================================================================
// MESSAGE GROUPS (GROUP CHATS)
// ============================================================================

export async function createMessageGroup(group: InsertMessageGroup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(messageGroups).values(group);
}

export async function getMessageGroupById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(messageGroups)
    .where(eq(messageGroups.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getGroupsByStudentId(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(messageGroups)
    .innerJoin(groupMembers, eq(messageGroups.id, groupMembers.groupId))
    .where(eq(groupMembers.studentId, studentId));
}

export async function addGroupMember(member: InsertGroupMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(groupMembers).values(member);
}

export async function getGroupMembers(groupId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));
}

export async function removeGroupMember(groupId: number, studentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .delete(groupMembers)
    .where(
      and(eq(groupMembers.groupId, groupId), eq(groupMembers.studentId, studentId))
    );
}

export async function createGroupMessage(message: InsertGroupMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(groupMessages).values(message);
}

export async function getGroupMessages(groupId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(groupMessages)
    .where(eq(groupMessages.groupId, groupId))
    .orderBy(desc(groupMessages.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function deleteMessageGroup(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete all group members first
  await db.delete(groupMembers).where(eq(groupMembers.groupId, id));
  // Delete all group messages
  await db.delete(groupMessages).where(eq(groupMessages.groupId, id));
  // Delete the group
  return await db.delete(messageGroups).where(eq(messageGroups.id, id));
}
