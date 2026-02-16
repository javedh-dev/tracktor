CREATE TABLE `notification_providers` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `type` text NOT NULL,
  `config` text NOT NULL,
  `is_enabled` integer DEFAULT true NOT NULL,
  `is_default` integer DEFAULT false NOT NULL,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
