#!/bin/sh
set -e

echo "Starting application..."

ls -alh

# Change to backend directory
cd backend

# Run database migrations
echo "Running database migrations..."
if npx drizzle-kit migrate --config drizzle.config.js; then
    echo "✓ Database migrations completed successfully"
else
    echo "✗ Database migrations failed"
    exit 1
fi

# Start the server
echo "Starting server..."
exec node index.js