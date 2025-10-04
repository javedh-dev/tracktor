log_info() {
    echo "[ℹ] $1"
}

log_success() {
    echo "[✓] $1"
}

log_error() {
    echo "[✗] $1"
}

log_info "Cleaning root directory..."
rm -rf node_modules
rm -rf dist
rm -rf build
rm -rf package-lock.json
log_success "Root directory cleaned"

log_info "Cleaning backend and frontend directories..."
cd app/backend || exit
rm -rf node_modules
rm -rf dist
rm -rf build
npm run clean

cd ../..
cd app/frontend || exit
rm -rf node_modules
rm -rf dist
rm -rf build
npm run clean
cd ../..
log_success "Backend and frontend directories cleaned"
