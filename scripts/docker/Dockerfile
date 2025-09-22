# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Copy package files for dependency installation
COPY package.json ./
COPY app/frontend/package.json ./app/frontend/
COPY app/backend/package.json ./app/backend/

# Install all dependencies with cache mount
# Handle npm optional dependency bug for ARM64 Alpine
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/app/.npm \
    npm install --include=dev

# Stage 2: Build application
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app ./app

# Copy source code
COPY . .

# Set build environment
ENV API_BASE_URL=/
ENV PUBLIC_DEMO_MODE=false
ENV NODE_ENV=production

# Build the application
RUN npm run build --workspaces

# Stage 3: Production dependencies only
FROM node:22-alpine AS prod-deps
WORKDIR /app

# Copy package files
COPY app/backend/package.json ./

# Install only production dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm install --omit=dev --ignore-scripts

# Stage 4: Final production image
FROM node:22-alpine AS runtime
WORKDIR /app

# Install drizzle-kit globally for migrations (alternative approach)
# RUN npm install -g drizzle-kit@^0.31.4

# Copy built application
COPY --from=builder /app/app/backend/build ./backend
COPY --from=builder /app/app/backend/migrations ./backend/migrations
COPY --from=builder /app/app/frontend/build ./frontend

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Make directory for database data for no volume attachment
RUN mkdir -p /data/

# Copy package.json files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/app/backend/package.json ./backend/

# Copy and set up start script
COPY --from=builder /app/scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Set runtime environment
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/data/tracktor.db

ENTRYPOINT ["/app/start.sh"]