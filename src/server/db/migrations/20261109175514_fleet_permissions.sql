CREATE TABLE `uploads` (
	`filename` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

--> statement-breakpoint
CREATE TABLE `vehicle_assignments` (
	`user_id` text NOT NULL,
	`vehicle_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `vehicle_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);

--> statement-breakpoint
ALTER TABLE `users` ADD `role` text DEFAULT 'driver' NOT NULL;
--> statement-breakpoint
ALTER TABLE `users` ADD `is_active` integer DEFAULT true NOT NULL;