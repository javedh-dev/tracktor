#!/bin/sh

log_info() {
    echo "[i] $1"
}

log_success() {
    echo "[v] $1"
}

log_info "Cleaning project..."
rm -rf node_modules
rm -rf build
rm -rf .svelte-kit
rm -rf *.db
rm -rf uploads
rm -rf logs
rm -rf coverage
log_success "Project cleaned"
