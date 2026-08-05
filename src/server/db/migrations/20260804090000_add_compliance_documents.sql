CREATE TABLE `compliance_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`type` text NOT NULL,
	`other_label` text,
	`document_number` text NOT NULL,
	`issuer` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`recurrence_type` text DEFAULT 'none' NOT NULL,
	`recurrence_interval` integer DEFAULT 1 NOT NULL,
	`cost` real,
	`notes` text,
	`attachment` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_compliance_documents_vehicle_id` ON `compliance_documents` (`vehicle_id`);
--> statement-breakpoint
CREATE INDEX `idx_compliance_documents_type` ON `compliance_documents` (`type`);
