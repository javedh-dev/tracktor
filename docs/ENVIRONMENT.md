# Environment Configuration

This document describes the environment variable configuration for the Tracktor application.

## Overview

Tracktor uses a unified environment variable system across all components (backend, frontend, and deployment). This ensures consistency and makes configuration management easier.

## Environment Files

### Centralized Configuration

All environment variables are managed from the root level:

- `.env.example` - Template with all available environment variables
- `.env` - Your local environment configuration (create from .env.example)

Both backend and frontend applications load their configuration from the root `.env` file, ensuring consistency across the entire application.

## Environment Variables

### Application Environment

| Variable   | Default       | Description                                             |
| ---------- | ------------- | ------------------------------------------------------- |
| `NODE_ENV` | `development` | Application environment (development, production, test) |

### Server Configuration

| Variable      | Default   | Description              |
| ------------- | --------- | ------------------------ |
| `SERVER_HOST` | `0.0.0.0` | Backend server host      |
| `SERVER_PORT` | `3000`    | Backend server port      |
| `CLIENT_HOST` | `0.0.0.0` | Frontend dev server host |
| `CLIENT_PORT` | `5173`    | Frontend dev server port |

### API Configuration

| Variable              | Default                 | Description                |
| --------------------- | ----------------------- | -------------------------- |
| `API_BASE_URL`        | `http://localhost:3000` | Base URL for API calls     |
| `API_BASE_URL` | `http://localhost:3000` | Public API URL (SvelteKit) |

### Database Configuration

| Variable        | Default         | Description               |
| --------------- | --------------- | ------------------------- |
| `DATABASE_PATH` | `./tracktor.db` | SQLite database file path |

### Application Features

| Variable           | Default | Description                  |
| ------------------ | ------- | ---------------------------- |
| `DEMO_MODE`        | `false` | Enable demo mode             |
| `PUBLIC_DEMO_MODE` | `false` | Public demo mode (SvelteKit) |

### Security Configuration

| Variable       | Default                                       | Description                            |
| -------------- | --------------------------------------------- | -------------------------------------- |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed CORS origins (comma-separated) |

### Logging Configuration

| Variable       | Default | Description                          |
| -------------- | ------- | ------------------------------------ |
| `LOG_LEVEL`    | `info`  | Log level (error, warn, info, debug) |
| `LOG_REQUESTS` | `true`  | Enable request logging               |

## Environment-Specific Configurations

### Development

```bash
NODE_ENV=development
SERVER_PORT=3000
CLIENT_PORT=5173
API_BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000
DEMO_MODE=false
```

### Production

```bash
NODE_ENV=production
SERVER_PORT=3000
SERVER_HOST=0.0.0.0
DATABASE_PATH=/data/tracktor.db
API_BASE_URL=https://your-domain.com
DEMO_MODE=false
LOG_LEVEL=warn
```

### Docker

The Docker configuration automatically sets production-appropriate values:

```yaml
environment:
  - NODE_ENV=production
  - SERVER_PORT=3000
  - SERVER_HOST=0.0.0.0
  - DATABASE_PATH=/data/tracktor.db
  - PUBLIC_DEMO_MODE=false
  - LOG_LEVEL=info
```

## Setup Instructions

1. **Use the setup script (recommended):**

   ```bash
   npm run setup
   ```

2. **Or manually copy the example file:**

   ```bash
   cp .env.example .env
   ```

3. **Edit the values as needed:**

   ```bash
   nano .env
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

## Best Practices

1. **Never commit `.env` files** - They contain sensitive configuration
2. **Always update `.env.example`** when adding new variables
3. **Use consistent naming** - Follow the established patterns
4. **Document new variables** - Update this file when adding variables
5. **Use appropriate defaults** - Ensure the app works out of the box

## SvelteKit Considerations

SvelteKit requires the `PUBLIC_` prefix for environment variables that need to be available in the browser. This is why we have both:

- `API_BASE_URL` (backend only)
- `API_BASE_URL` (frontend/browser accessible)

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change `SERVER_PORT` or `CLIENT_PORT` if ports are in use
2. **CORS errors**: Add your domain to `CORS_ORIGINS`
3. **API connection issues**: Verify `API_BASE_URL` matches your backend URL
4. **Database issues**: Check `DATABASE_PATH` permissions and directory existence

### Debugging

Enable debug logging:

```bash
LOG_LEVEL=debug
LOG_REQUESTS=true
```

Check environment loading:

```bash
# Backend
npm run dev:backend

# Frontend
npm run dev:frontend
```
