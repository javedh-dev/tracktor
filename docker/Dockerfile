# Stage 1: Build the SvelteKit frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY app/frontend/package*.json ./
RUN npm install
COPY app/frontend/ ./
ENV PUBLIC_API_BASE_URL=/
ENV PUBLIC_DEMO_MODE=false
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Build the Node.js backend
FROM node:22-alpine AS backend-builder
WORKDIR /app/backend
COPY app/backend/package*.json ./
RUN npm install
COPY app/backend/ ./
ENV NODE_ENV=production
ENV DB_PATH=./vehicles.db
RUN npm run build

# Stage 3: Final production image
FROM node:22-alpine
WORKDIR /app

# Copy built backend from backend-builder stage
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package.json ./backend/package.json

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder /app/frontend/build ./backend/frontend/build

# Copy and set up entrypoint script
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

WORKDIR /app/backend

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/data/vehicles.db
ENTRYPOINT ["/app/entrypoint.sh"]
