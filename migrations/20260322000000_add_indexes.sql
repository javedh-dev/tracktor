CREATE INDEX IF NOT EXISTS idx_notifications_vehicle_id ON notifications (vehicle_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_notification_key ON notifications (notification_key);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_vehicle_id ON fuel_logs (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_insurances_vehicle_id ON insurances (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_vehicle_id ON maintenance_logs (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_pollution_certificates_vehicle_id ON pollution_certificates (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reminders_vehicle_id ON reminders (vehicle_id);
