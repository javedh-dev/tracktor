#!/bin/bash

# Function to cleanup background processes
cleanup() {
    echo "Stopping development server..."
    if [ ! -z "$DEV_PID" ]; then
        kill $DEV_PID 2>/dev/null
    fi
    pkill -P $$
    exit 0
}

# Set up trap to catch interrupts
trap cleanup SIGINT SIGTERM EXIT

# Run database migration
pnpm db:migrate

# Start development server
pnpm dev &
DEV_PID=$!

echo "Development server PID: $DEV_PID"
echo "Press Ctrl+C to stop the server"

# Wait for background processes
wait