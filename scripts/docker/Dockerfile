# Stage 1: Build application
FROM node:22-alpine AS builder
WORKDIR /app

# Copy source code
COPY . .

# Set build environment
ENV API_BASE_URL=/
ENV PUBLIC_DEMO_MODE=false
ENV NODE_ENV=production

RUN npm run build


# Stage 2: Final production image
FROM node:22-alpine AS runtime
WORKDIR /app

# Install drizzle-kit globally for migrations (alternative approach)
# RUN npm install -g drizzle-kit@^0.31.4

# Copy built application
COPY --from=builder /app/build ./build

# Make directory for database data for no volume attachment
RUN mkdir -p /data/uploads

# Copy and set up start script
COPY --from=builder /app/scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Set runtime environment
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/data/tracktor.db
ENV UPLOADS_DIR=/data/uploads
ENV LOGS_DIR=/data/logs
# This should be updated with each release
ENV APP_VERSION=0.4.2

ENTRYPOINT ["/app/start.sh"]
