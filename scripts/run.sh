#!/bin/bash

# Function to cleanup background processes
cleanup() {
    echo "Stopping all processes..."

    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    # Kill any remaining child processes
    pkill -P $$
    exit 0
}

# Set up trap to catch interrupts
trap cleanup SIGINT SIGTERM EXIT

# Run database migration
pnpm db:migrate:dev

# Start backend and frontend
pnpm dev &
FRONTEND_PID=$!

echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop all processes"

# Wait for background processes
wait