CREATE TABLE notifications (
    id uuid PRIMARY KEY,
    vehicle_id uuid NOT NULL,
    type text NOT NULL,
    message text NOT NULL,
    due_date DATE NOT NULL,
    source text NOT NULL,
    is_read tinyint(1) NOT NULL DEFAULT 0,
    created_at DATE NOT NULL,
    updated_at DATE NOT NULL,
    FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);
