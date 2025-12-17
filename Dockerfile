# Stage 1: Build the application
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

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

# Set working directory
WORKDIR /app

# Copy built artifacts from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/migrations ./migrations

# Expose the port the app runs on
EXPOSE 3000

# Create data directories
RUN mkdir -p /data
RUN mkdir -p /data/logs
RUN mkdir -p /data/uploads

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DB_PATH=/data/tracktor.db
ENV LOG_LEVEL=info
ENV LOG_DIR=/data/logs
ENV UPLOADS_DIR=/data/uploads
ENV BODY_SIZE_LIMIT=Infinity

# Start the application
CMD ["node", "build"]
