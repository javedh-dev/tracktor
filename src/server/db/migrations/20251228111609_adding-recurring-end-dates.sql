-- Add recurrence fields to insurances and Make end_date nullable in insurances

PRAGMA foreign_keys=OFF;

--> statement-breakpoint
CREATE TABLE insurances_new (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT, -- now nullable
  recurrence_type TEXT NOT NULL DEFAULT 'none',
  recurrence_interval INTEGER NOT NULL DEFAULT 1,
  cost REAL NOT NULL,
  notes TEXT,
  attachment TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
INSERT INTO insurances_new (
  id, vehicle_id, provider, policy_number, start_date, end_date,
  recurrence_type, recurrence_interval, cost, notes, attachment,
  created_at, updated_at
)
SELECT
  id, vehicle_id, provider, policy_number, start_date, end_date,
  'none', 1, cost, notes, attachment,
  created_at, updated_at
FROM insurances;
--> statement-breakpoint
DROP TABLE insurances;
--> statement-breakpoint
ALTER TABLE insurances_new RENAME TO insurances;
--> statement-breakpoint

-- Make expiry_date nullable in pollution_certificates
CREATE TABLE pollution_certificates_new (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  expiry_date TEXT, -- now nullable
  recurrence_type TEXT NOT NULL DEFAULT 'none',
  recurrence_interval INTEGER NOT NULL DEFAULT 1,
  testing_center TEXT NOT NULL,
  notes TEXT,
  attachment TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
INSERT INTO pollution_certificates_new (
  id, vehicle_id, certificate_number, issue_date, expiry_date,
  recurrence_type, recurrence_interval, testing_center, notes,
  attachment, created_at, updated_at
)
SELECT
  id, vehicle_id, certificate_number, issue_date, expiry_date,
  'none', 1, testing_center, notes,
  attachment, created_at, updated_at
FROM pollution_certificates;
--> statement-breakpoint
DROP TABLE pollution_certificates;
--> statement-breakpoint
ALTER TABLE pollution_certificates_new RENAME TO pollution_certificates;
--> statement-breakpoint

-- Add recurrence_end_date to reminders
CREATE TABLE reminders_new (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  due_date TEXT NOT NULL,
  remind_schedule TEXT NOT NULL,
  recurrence_type TEXT NOT NULL DEFAULT 'none',
  recurrence_interval INTEGER NOT NULL DEFAULT 1,
  recurrence_end_date TEXT, -- nullable end date
  note TEXT,
  is_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
INSERT INTO reminders_new (
  id, vehicle_id, type, due_date, remind_schedule,
  recurrence_type, recurrence_interval, recurrence_end_date,
  note, is_completed, created_at, updated_at
)
SELECT
  id, vehicle_id, type, due_date, remind_schedule,
  'none', 1, NULL,
  note, is_completed, created_at, updated_at
FROM reminders;
--> statement-breakpoint
DROP TABLE reminders;
--> statement-breakpoint
ALTER TABLE reminders_new RENAME TO reminders;
--> statement-breakpoint

PRAGMA foreign_keys=ON;