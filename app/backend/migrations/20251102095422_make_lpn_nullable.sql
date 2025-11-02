-- Custom SQL migration file, put your code below! --
CREATE TABLE `vehicles_new` (
	`id` uuid PRIMARY KEY NOT NULL,
	`make` varchar(255) NOT NULL,
	`model` varchar(255) NOT NULL,
	`year` integer NOT NULL,
	`license_plate` varchar(255),
	`vin` varchar(255),
	`color` varchar(255),
	`odometer` integer,
	`image` varchar(255),
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL);
--> statement-breakpoint
INSERT INTO `vehicles_new` select * from vehicles;
--> statement-breakpoint
DROP TABLE vehicles;
--> statement-breakpoint
ALTER TABLE `vehicles_new` RENAME TO `vehicles`;
