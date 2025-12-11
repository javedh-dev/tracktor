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

log_info "Cleaning root directory..."
rm -rf node_modules
rm -rf dist
rm -rf build
rm -rf package-lock.json
rm -rf pnpm-lock.yaml
log_success "Root directory cleaned"

log_info "Cleaning backend and frontend directories..."
cd app/backend || exit
rm -rf node_modules
rm -rf dist
rm -rf build
pnpm run clean

cd ../..
cd app/frontend || exit
rm -rf node_modules
rm -rf dist
rm -rf build
pnpm run clean
cd ../..
log_success "Backend and frontend directories cleaned"
