-- Custom SQL migration file, put your code below! --
ALTER TABLE vehicles ADD COLUMN vehicle_type TEXT NOT NULL DEFAULT 'car';