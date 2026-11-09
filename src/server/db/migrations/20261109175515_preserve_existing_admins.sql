-- Preserve the full access that every existing account had before fleet permissions.
UPDATE `users` SET `role` = 'admin';
