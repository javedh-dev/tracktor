# Stage 1: Build application
FROM node:22-alpine AS builder
WORKDIR /app

# Copy source code
COPY . .

# Set build environment
ENV NODE_ENV=production
ENV TRACKTOR_DEMO_MODE=false

RUN npm run build


# Stage 2: Final production image
FROM node:22-alpine AS runtime
WORKDIR /app

# Copy built application
COPY --from=builder /app/build ./build

# Make directory for database and data for volume attachment
RUN mkdir -p /data/uploads
RUN mkdir -p /data/logs

# Copy and set up start script
COPY --from=builder /app/scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Set runtime environment
EXPOSE 3000
ENV NODE_ENV=production
ENV SERVER_PORT=3000
ENV DB_PATH=/data/tracktor.db
ENV UPLOADS_DIR=/data/uploads
ENV LOG_DIR=/data/logs
ENV LOG_LEVEL=info
# ENV APP_VERSION=0.4.2

ENTRYPOINT ["/app/start.sh"]
