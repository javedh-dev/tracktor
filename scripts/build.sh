#!/bin/sh
# set -e

log_info() {
    echo "[i] $1"
}

log_success() {
    echo "[v] $1"
}

log_warning() {
    echo "[!] $1"
}

log_error() {
    echo "[x] $1"
}

log_info "Starting build process..."

# Clean previous build
log_info "Cleaning previous build artifacts..."
if [ -d "build" ]; then
    rm -rf build/
    log_success "Previous build directory removed"
fi


# Install dependencies
log_info "Cleaning Up..."
if pnpm run clean; then
    log_success "Clean Up successfully..."
else
    log_error "Failed to clean up"
    exit 1
fi
log_info "Installing Dependencies..."
NODE_ENV=development
if pnpm install; then
    log_success "Dependencies installed successfully"
else
    log_error "Failed to install dependencies"
    exit 1
fi

# Build workspaces
log_info "Building workspaces..."
NODE_ENV=production
if pnpm -r build; then
    log_success "Workspaces built successfully"
else
    log_error "Failed to build workspaces"
    exit 1
fi

# Create build directories
log_info "Creating build directories..."
mkdir -p build/frontend/ build/backend/
log_success "Build directories created"

# Copy frontend build
log_info "Copying frontend build artifacts..."
if [ -d "app/frontend/build" ] && [ "$(ls -A app/frontend/build)" ]; then
    cp -r app/frontend/build/* build/frontend/
    log_success "Frontend artifacts copied"
else
    log_warning "Frontend build directory is empty or doesn't exist"
fi

# Copy backend build
log_info "Copying backend build artifacts..."
if [ -d "app/backend/build" ] && [ "$(ls -A app/backend/build)" ]; then
    cp -r app/backend/build/* build/backend/
    log_success "Backend artifacts copied"
else
    log_error "Backend build directory is empty or doesn't exist"
    exit 1
fi

# Copy migrations
log_info "Copying database migrations..."
if [ -d "app/backend/migrations" ]; then
    cp -r app/backend/migrations build/backend/
    log_success "Database migrations copied"
else
    log_warning "No migrations directory found"
fi

# Copy start script
log_info "Copying start script..."
if [ -f "scripts/start.sh" ]; then
    cp scripts/start.sh build/
    chmod +x build/start.sh
    log_success "Start script copied and made executable"
else
    log_error "Start script not found"
    exit 1
fi

# Copy package files
log_info "Copying package configuration files..."
if [ -f "package.json" ]; then
    cp package.json build/
    log_success "Root package.json copied"
else
    log_error "Root package.json not found"
    exit 1
fi

if [ -f "app/backend/package.json" ]; then
    cp app/backend/package.json build/backend/package.json
    log_success "Backend package.json copied"
else
    log_error "Backend package.json not found"
    exit 1
fi

if [ -f "app/frontend/package.json" ]; then
    cp app/frontend/package.json build/frontend/package.json
    log_success "Frontend package.json copied"
else
    log_error "Frontend package.json not found"
    exit 1
fi

# Install production dependencies
log_info "Installing production dependencies in build directory..."
cd build/backend
if pnpm install --prod --ignore-scripts; then
    log_success "Production dependencies installed successfully"
else
    log_error "Failed to install production dependencies"
    exit 1
fi

cd ../..
log_success "Build process completed successfully!"
log_info "Build artifacts are available in the 'build/' directory"
