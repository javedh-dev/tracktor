# Stage 1: Build the application
FROM node:22-alpine AS builder

ARG APP_VERSION

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and pnpm workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Prune development dependencies to keep the image small
RUN pnpm prune --prod

# Stage 2: Create the production image
FROM node:22-alpine

ARG APP_VERSION

# Run as a dedicated, unprivileged user rather than root
RUN addgroup -S tracktor && adduser -S tracktor -G tracktor

# Set working directory
WORKDIR /app

# Copy built artifacts from builder stage, owned by the app user
COPY --from=builder --chown=tracktor:tracktor /app/build ./build
COPY --from=builder --chown=tracktor:tracktor /app/node_modules ./node_modules
COPY --from=builder --chown=tracktor:tracktor /app/package.json ./package.json
COPY --from=builder --chown=tracktor:tracktor /app/src/server/db/migrations ./migrations

# Expose the port the app runs on
EXPOSE 3000

# Create data directories, owned by the app user so it can write to them at runtime
RUN mkdir -p /data/logs /data/uploads && chown -R tracktor:tracktor /data

# Set environment variables
ENV APP_VERSION=${APP_VERSION}
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DB_PATH=/data/tracktor.db
ENV LOG_LEVEL=info
ENV LOG_DIR=/data/logs
ENV UPLOADS_DIR=/data/uploads
# Matches the documented local-dev default (.env.example); override with -e BODY_SIZE_LIMIT=...
# for larger fleets/attachments. An unbounded limit lets an authenticated user exhaust disk.
ENV BODY_SIZE_LIMIT=10mb

USER tracktor

# Let orchestrators (Docker, Compose, Kubernetes) detect a hung process via the app's own
# health endpoint instead of only inferring liveness from the container staying up.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Start the application
CMD ["node", "build"]
