-- Custom SQL migration file, put your code below! --
ALTER TABLE vehicles ADD COLUMN fuel_type TEXT NOT NULL DEFAULT 'petrol';