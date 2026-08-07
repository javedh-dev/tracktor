DROP TABLE IF EXISTS `migrations`;
--> statement-breakpoint
DROP TABLE IF EXISTS `config`;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `auth` (
	`id` integer PRIMARY KEY NOT NULL,
	`hash` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `configs` (
	`key` varchar(255) PRIMARY KEY NOT NULL,
	`value` varchar(255) NOT NULL,
	`description` varchar(255),
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `fuel_logs` (
	`id` uuid PRIMARY KEY NOT NULL,
	`vehicle_id` uuid NOT NULL,
	`date` date NOT NULL,
	`odometer` integer NOT NULL,
	`fuel_amount` float NOT NULL,
	`cost` float NOT NULL,
	`filled` tinyint(1) NOT NULL,
	`missed_last` tinyint(1) NOT NULL,
	`notes` varchar(255),
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `insurances` (
	`id` uuid PRIMARY KEY NOT NULL,
	`vehicle_id` uuid NOT NULL,
	`provider` varchar(255) NOT NULL,
	`policy_number` varchar(255) NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`cost` float NOT NULL,
	`notes` varchar(255),
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `maintenance_logs` (
	`id` uuid PRIMARY KEY NOT NULL,
	`vehicle_id` uuid NOT NULL,
	`date` date NOT NULL,
	`odometer` integer NOT NULL,
	`service_center` varchar(255) NOT NULL,
	`cost` float NOT NULL,
	`notes` varchar(255),
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `pollution_certificates` (
	`id` uuid PRIMARY KEY NOT NULL,
	`vehicle_id` uuid NOT NULL,
	`certificate_number` varchar(255) NOT NULL,
	`issue_date` date NOT NULL,
	`expiry_date` date NOT NULL,
	`testing_center` varchar(255) NOT NULL,
	`notes` varchar(255),
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `vehicles` (
	`id` uuid PRIMARY KEY NOT NULL,
	`make` varchar(255) NOT NULL,
	`model` varchar(255) NOT NULL,
	`year` integer NOT NULL,
	`license_plate` varchar(255) NOT NULL,
	`vin` varchar(255),
	`color` varchar(255),
	`odometer` integer,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
