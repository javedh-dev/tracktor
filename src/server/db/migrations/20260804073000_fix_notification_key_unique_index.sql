-- Migration 20260322000000_add_indexes silently failed to create this unique index on some
-- databases (likely due to duplicate notification_key rows present at the time), while still being
-- recorded as applied — leaving `syncVehicleNotifications`'s ON CONFLICT (notification_key) upsert
-- with no matching unique constraint to target. Re-create it defensively.
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_notification_key ON notifications (notification_key);
