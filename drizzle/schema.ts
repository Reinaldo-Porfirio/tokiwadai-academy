import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  date,
  time,
  decimal,
  unique,
} from "drizzle-orm/mysql-core";

/**
 * Manus OAuth users (for Manus platform integration)
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    openIdIdx: unique("openId_unique").on(table.openId),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Students table (Tokiwadai Academy)
 */
export const students = mysqlTable(
  "students",
  {
    id: int("id").autoincrement().primaryKey(),
    studentId: varchar("student_id", { length: 20 }).notNull().unique(), // TKW-2026-00001
    username: varchar("username", { length: 64 }).notNull().unique(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    birthDate: date("birth_date"),
    grade: int("grade").notNull(), // 1-6
    district: int("district").notNull(), // 1-23
    bio: text("bio"), // max 500 chars
    profilePicture: varchar("profile_picture", { length: 500 }), // S3 URL
    isSuspended: boolean("is_suspended").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    studentIdIdx: unique("student_id_unique").on(table.studentId),
    usernameIdx: unique("username_unique").on(table.username),
    emailIdx: unique("email_unique").on(table.email),
  })
);

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

/**
 * Admin users table
 */
export const admins = mysqlTable(
  "admins",
  {
    id: int("id").autoincrement().primaryKey(),
    username: varchar("username", { length: 64 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    usernameIdx: unique("admin_username_unique").on(table.username),
  })
);

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = typeof admins.$inferInsert;

/**
 * Mirror posts (social network)
 */
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("student_id").notNull(),
  content: text("content").notNull(), // max 500 chars
  imageUrl: varchar("image_url", { length: 500 }), // S3 URL
  likesCount: int("likes_count").default(0),
  commentsCount: int("comments_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const postsRelations = {
  student: {
    type: "one" as const,
    field: "studentId",
    references: students.id,
  },
};

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

/**
 * Likes on posts
 */
export const likes = mysqlTable(
  "likes",
  {
    id: int("id").autoincrement().primaryKey(),
    postId: int("post_id").notNull(),
    studentId: int("student_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    postStudentUnique: unique("post_student_unique").on(
      table.postId,
      table.studentId
    ),
  })
);

export type Like = typeof likes.$inferSelect;
export type InsertLike = typeof likes.$inferInsert;

/**
 * Comments on posts
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("post_id").notNull(),
  studentId: int("student_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Private messages between students
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("sender_id").notNull(),
  receiverId: int("receiver_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Calendar events
 */
export const calendarEvents = mysqlTable("calendar_events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: date("event_date").notNull(),
  eventTime: time("event_time"), // optional
  eventType: mysqlEnum("event_type", ["class", "exam", "holiday", "special"])
    .default("class")
    .notNull(),
  createdByAdminId: int("created_by_admin_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;

/**
 * Library files
 */
export const libraryFiles = mysqlTable("library_files", {
  id: int("id").autoincrement().primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: varchar("file_url", { length: 500 }).notNull(), // S3 URL
  fileKey: varchar("file_key", { length: 500 }).notNull(), // S3 key for deletion
  category: mysqlEnum("category", [
    "material",
    "regulation",
    "map",
    "other",
  ])
    .default("other")
    .notNull(),
  description: text("description"),
  uploadedByAdminId: int("uploaded_by_admin_id").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export type LibraryFile = typeof libraryFiles.$inferSelect;
export type InsertLibraryFile = typeof libraryFiles.$inferInsert;

/**
 * System settings
 */
export const systemSettings = mysqlTable("system_settings", {
  id: int("id").primaryKey().default(1),
  schoolName: varchar("school_name", { length: 255 }).default(
    "Tokiwadai Academy"
  ),
  currentYear: int("current_year").default(new Date().getFullYear()),
  logoUrl: varchar("logo_url", { length: 500 }), // S3 URL
  mapImageUrl: varchar("map_image_url", { length: 500 }), // S3 URL
  themeColor: varchar("theme_color", { length: 7 }).default("#0066cc"), // hex color
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = typeof systemSettings.$inferInsert;

/**
 * Notifications for students
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("student_id").notNull(),
  type: mysqlEnum("type", [
    "message",
    "event",
    "post_like",
    "post_comment",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  relatedId: int("related_id"), // ID of related post, message, event, etc
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Backup logs
 */
export const backupLogs = mysqlTable("backup_logs", {
  id: int("id").autoincrement().primaryKey(),
  backupType: mysqlEnum("backup_type", ["database", "files"]).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default(
    "pending"
  ),
  backupUrl: varchar("backup_url", { length: 500 }), // S3 URL
  fileSize: decimal("file_size", { precision: 15, scale: 2 }), // in bytes
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type BackupLog = typeof backupLogs.$inferSelect;
export type InsertBackupLog = typeof backupLogs.$inferInsert;
