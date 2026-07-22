-- Add attachment field to fuel_logs table for storing receipt files
ALTER TABLE `fuel_logs` ADD COLUMN `attachment` text;
--> statement-breakpoint

-- Add attachment field to maintenance_logs table for storing receipt/invoice files
ALTER TABLE `maintenance_logs` ADD COLUMN `attachment` text;
--> statement-breakpoint

-- Add attachment field to insurances table for storing policy documents
ALTER TABLE `insurances` ADD COLUMN `attachment` text;
--> statement-breakpoint

-- Add attachment field to pollution_certificates table for storing certificate documents
ALTER TABLE `pollution_certificates` ADD COLUMN `attachment` text;