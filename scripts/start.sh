#!/bin/sh

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

# Verify build directory exists
if [ ! -d "build" ]; then
    log_error "Build directory not found. Run 'pnpm build' first."
    exit 1
fi

# Run database migrations
log_info "Running database migrations..."
if pnpm db:migrate; then
    log_success "Database migrations completed"
else
    log_error "Database migrations failed"
    exit 1
fi

# Start the server
log_info "Starting server..."
exec node build
