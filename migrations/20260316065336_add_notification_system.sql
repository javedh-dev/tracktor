CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`type` text NOT NULL,
	`channel` text DEFAULT 'information' NOT NULL,
	`notification_key` text,
	`message` text NOT NULL,
	`source` text NOT NULL,
	`due_date` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`cleared_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `notification_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`config` text NOT NULL,
	`channels` text DEFAULT '["reminder","alert","information"]' NOT NULL,
	`is_enabled` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
