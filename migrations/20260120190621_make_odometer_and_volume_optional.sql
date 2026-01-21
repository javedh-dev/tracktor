-- Migration: Make odometer and fuelAmount optional in fuel_logs table

PRAGMA foreign_keys=off;
--> statement-breakpoint
CREATE TABLE fuel_logs_new (
    `id` TEXT PRIMARY KEY,
    `vehicle_id` TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    `date` TEXT NOT NULL,
    odometer INTEGER,
    fuel_amount REAL,
    cost REAL NOT NULL,
    filled tinyint(1) NOT NULL,
    missed_last tinyint(1) NOT NULL,
    notes TEXT,
    attachment TEXT,
    created_at TEXT,
    updated_at TEXT
);

--> statement-breakpoint
INSERT INTO fuel_logs_new(id, vehicle_id, date, odometer, fuel_amount, cost, filled, missed_last, notes, attachment, created_at, updated_at) 
SELECT id, vehicle_id, date, odometer, fuel_amount, cost, filled, missed_last, notes, attachment, created_at, updated_at FROM fuel_logs;

--> statement-breakpoint
DROP TABLE fuel_logs;

--> statement-breakpoint
ALTER TABLE fuel_logs_new RENAME TO fuel_logs;
--> statement-breakpoint
PRAGMA foreign_keys=on;
