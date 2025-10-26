#!/bin/sh
# set -e

log_info() {
    echo "[i] $1"
}

log_success() {
    echo "[v] $1"
}

log_error() {
    echo "[x] $1"
}

log_info "Starting application..."


# Verify we're in the correct location
if [ ! -d "build/backend" ]; then
    log_error "Backend directory not found. Are you running this from the correct location?"
    exit 1
fi

# Change to backend directory
log_info "Changing to backend directory..."
cd build/backend

# Verify required files exist
if [ ! -f "drizzle.config.js" ]; then
    log_error "drizzle.config.js not found in backend directory"
    exit 1
fi

if [ ! -f "index.js" ]; then
    log_error "index.js not found in backend directory"
    exit 1
fi

# Run database migrations
log_info "Running database migrations..."
if npx drizzle-kit migrate --config drizzle.config.js; then
    log_success "Database migrations completed successfully"
else
    log_error "Database migrations failed"
    exit 1
fi

# Start the server
log_info "Starting server..."
log_info "Server will be available shortly..."
exec node index.js
