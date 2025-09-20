# Stage 1: Build both frontend and backend
FROM node:22-alpine AS builder
WORKDIR /tmp
COPY ./ ./
RUN npm ci
ENV API_BASE_URL=/
ENV PUBLIC_DEMO_MODE=false
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Final production 
FROM node:22-alpine
WORKDIR /app

# Copy built backend from backend-builder stage
COPY --from=builder /tmp/app/backend/dist ./backend
COPY --from=builder /tmp/app/backend/src/db/migrations ./backend/src/db/migrations
COPY --from=builder /tmp/app/backend/package.json ./backend/package.json
# Copy built frontend from frontend-builder stage
COPY --from=builder /tmp/app/frontend/build ./frontend
COPY --from=builder /tmp/app/frontend/package.json ./package.json
WORKDIR /app/backend
RUN npm install

# Copy and set up entrypoint script
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/data/tracktor.db
ENTRYPOINT ["/app/entrypoint.sh"]
