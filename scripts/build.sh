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

log_info "Building SvelteKit application..."

# Install dependencies
if pnpm install; then
    log_success "Dependencies installed"
else
    log_error "Failed to install dependencies"
    exit 1
fi

# Build application
if pnpm build; then
    log_success "Build completed successfully"
else
    log_error "Build failed"
    exit 1
fi
