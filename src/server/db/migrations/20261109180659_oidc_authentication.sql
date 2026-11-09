CREATE TABLE `oidc_identities` (
	`issuer` text NOT NULL,
	`subject` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`issuer`, `subject`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `oidc_user_issuer_unique` ON `oidc_identities` (`user_id`,`issuer`);--> statement-breakpoint
CREATE TABLE `oidc_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`nonce` text NOT NULL,
	`code_verifier` text NOT NULL,
	`expires_at` integer NOT NULL,
	`user_id` text,
	`session_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
