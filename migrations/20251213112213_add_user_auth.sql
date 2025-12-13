-- Add users table for username/password authentication
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` text NOT NULL DEFAULT (datetime('now')),
	`updated_at` text NOT NULL DEFAULT (datetime('now'))
);
--> statement-breakpoint

-- Add unique index on username
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
--> statement-breakpoint

-- Add sessions table for session management
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` text NOT NULL DEFAULT (datetime('now')),
	`updated_at` text NOT NULL DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);