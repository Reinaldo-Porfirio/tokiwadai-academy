CREATE TABLE `admins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(64) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admins_id` PRIMARY KEY(`id`),
	CONSTRAINT `admins_username_unique` UNIQUE(`username`),
	CONSTRAINT `admin_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `backup_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`backup_type` enum('database','files') NOT NULL,
	`status` enum('pending','completed','failed') DEFAULT 'pending',
	`backup_url` varchar(500),
	`file_size` decimal(15,2),
	`error_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `backup_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `calendar_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`event_date` date NOT NULL,
	`event_time` time,
	`event_type` enum('class','exam','holiday','special') NOT NULL DEFAULT 'class',
	`created_by_admin_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendar_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`student_id` int NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `library_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_url` varchar(500) NOT NULL,
	`file_key` varchar(500) NOT NULL,
	`category` enum('material','regulation','map','other') NOT NULL DEFAULT 'other',
	`description` text,
	`uploaded_by_admin_id` int NOT NULL,
	`uploaded_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `library_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`student_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `likes_id` PRIMARY KEY(`id`),
	CONSTRAINT `post_student_unique` UNIQUE(`post_id`,`student_id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sender_id` int NOT NULL,
	`receiver_id` int NOT NULL,
	`content` text NOT NULL,
	`is_read` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`type` enum('message','event','post_like','post_comment') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`related_id` int,
	`is_read` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`content` text NOT NULL,
	`image_url` varchar(500),
	`likes_count` int DEFAULT 0,
	`comments_count` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` varchar(20) NOT NULL,
	`username` varchar(64) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`birth_date` date,
	`grade` int NOT NULL,
	`district` int NOT NULL,
	`bio` text,
	`profile_picture` varchar(500),
	`is_suspended` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_student_id_unique` UNIQUE(`student_id`),
	CONSTRAINT `students_username_unique` UNIQUE(`username`),
	CONSTRAINT `students_email_unique` UNIQUE(`email`),
	CONSTRAINT `student_id_unique` UNIQUE(`student_id`),
	CONSTRAINT `username_unique` UNIQUE(`username`),
	CONSTRAINT `email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` int NOT NULL DEFAULT 1,
	`school_name` varchar(255) DEFAULT 'Tokiwadai Academy',
	`current_year` int DEFAULT 2026,
	`logo_url` varchar(500),
	`map_image_url` varchar(500),
	`theme_color` varchar(7) DEFAULT '#0066cc',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `openId_unique` UNIQUE(`openId`);