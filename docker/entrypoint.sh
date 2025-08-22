#!/bin/sh
set -e

echo "Starting application..."

# Change to backend directory
cd /app/backend

# Run database migrations
echo "Running database migrations..."
if node dist/db/migrate.js migrate; then
    echo "✓ Database migrations completed successfully"
else
    echo "✗ Database migrations failed"
    exit 1
fi

# Start the server
echo "Starting server..."
exec node dist/index.js