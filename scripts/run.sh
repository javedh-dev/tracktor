#!/bin/bash

# Function to cleanup background processes
cleanup() {
    echo "Stopping all processes..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
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
dotenvx run -f environment/$1.env -- npm run db:migrate:dev

# Start backend in background and store PID
dotenvx run -f environment/$1.env -- npm run dev --workspace=@tracktor/backend &
BACKEND_PID=$!

# Start frontend in background and store PID
dotenvx run -f environment/$1.env -- npm run dev --workspace=@tracktor/frontend &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop all processes"

# Wait for background processes
wait