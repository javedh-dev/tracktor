# Operations Runbook

This page covers deployment, environment configuration, database operations, and runtime behavior.

## Environment variables

Defined and typed in `src/lib/config/env.server.ts`. Public variables must be prefixed with `TRACKTOR_` per `svelte.config.js`.

| Variable                | Default                                                                        | Purpose                                                  |
| ----------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `NODE_ENV`              | `dev`                                                                          | `dev`, `production`, or `test`.                          |
| `HOST`                  | `localhost`                                                                    | Bind host (production/build only).                       |
| `PORT`                  | `3000`                                                                         | Bind port (production/build only).                       |
| `BASE_URL`              | `""`                                                                           | Sub-path when behind a reverse proxy. No trailing slash. |
| `DB_PATH`               | `./tracktor.db` (prod), `./tracktor.dev.db` (dev), `./tracktor.test.db` (test) | SQLite file path.                                        |
| `UPLOADS_DIR`           | `./uploads`                                                                    | Uploaded files directory.                                |
| `CORS_ORIGINS`          | `*`                                                                            | Comma-separated allowed origins.                         |
| `TRACKTOR_DISABLE_AUTH` | `false`                                                                        | Disable auth entirely.                                   |
| `TRACKTOR_DEMO_MODE`    | `false`                                                                        | Enable demo mode banner and sample data.                 |
| `FORCE_DATA_SEED`       | `false`                                                                        | Overwrite data with demo seed (requires demo mode).      |
| `LOG_REQUESTS`          | `true`                                                                         | Enable HTTP request logging.                             |
| `LOG_LEVEL`             | `info`                                                                         | Log verbosity.                                           |
| `LOG_DIR`               | `./logs`                                                                       | Log directory.                                           |
| `HTTP_MODE`             | `http`                                                                         | Set to `https` for secure cookies.                       |
| `APP_VERSION`           | branch name (dev) / package version (prod)                                     | Override displayed version.                              |
| `TRACKTOR_API_BASE_URL` | —                                                                              | Optional external API base URL.                          |

> Do not commit secrets. The repo includes `.env.example` with placeholder values.

## Docker deployment

The `Dockerfile` is a two-stage build:

1. `builder` — installs dependencies with pnpm, runs `pnpm run build`, then prunes dev dependencies.
2. Runtime — copies `build/`, `node_modules/`, `package.json`, and `migrations/`, exposes port `3000`, and runs `node build`.

Default container paths:

- Database: `/data/tracktor.db`
- Logs: `/data/logs`
- Uploads: `/data/uploads`

Example `docker-compose.yml` is in `docs/installation.md`.

Build-time version:

```bash
docker build --build-arg APP_VERSION=1.4.1 -t tracktor .
```

`APP_VERSION` is read at runtime from the env var; `src/server/config/appVersion.ts` resolves branch name in dev and package version in production.

## Database lifecycle

On every server start, `src/hooks.server.ts` calls `initializeDatabase()`:

1. Run Drizzle migrations from `migrations/`.
2. Seed demo data if applicable (`seedData()` in `src/server/db/seeders/`).
3. Apply post-migration patches (`applyPatches()` in `src/server/db/patch/index.ts`).

Commands:

```bash
pnpm db:generate    # Generate a new migration from schema changes
pnpm db:migrate     # Run pending migrations
pnpm db:seed        # Run the demo seeder script
```

### Adding a schema change

1. Edit the relevant file in `src/server/db/schema/`.
2. Run `pnpm db:generate`.
3. Review the generated SQL in `migrations/`.
4. Run `pnpm db:migrate` locally.
5. Commit both schema and migration files.

### Patches

`src/server/db/patch/index.ts` is for idempotent fixes that should run after migrations and seeding. Use it sparingly and ensure it is safe to run multiple times.

## Demo mode

When `TRACKTOR_DEMO_MODE=true`:

- A banner is shown in `src/routes/+layout.svelte`.
- Demo credentials are shown in the banner unless auth is disabled.
- `seedData()` may insert sample vehicles, logs, and configs.
- `FORCE_DATA_SEED=true` causes seeding to overwrite existing data.

## Notification scheduler

A `node-cron` scheduler starts in `src/hooks.server.ts`:

- Reads `notificationProcessingEnabled` and `notificationProcessingSchedule` from configs.
- Default schedule is `0 9 * * *` (daily at 09:00).
- Calls `dispatchScheduledNotifications()` from `src/server/services/notificationDispatchService.ts`.
- Can be reloaded at runtime via `GET /api/cron/reload`.

If notification processing is disabled, the scheduler logs that fact and exits.

## Logs

Logs are written under `LOG_DIR`. The logger is configured in `src/server/config/logger.ts`. Request logging is controlled by `LOG_REQUESTS`.

## File uploads

Uploads are stored under `UPLOADS_DIR` and served via `/api/files/[filename]`. The file API is unauthenticated (`/api/files/...` is in the auth middleware bypass list) so attachments can be downloaded with a direct link; in production, serve Tracktor behind a reverse proxy and consider additional access controls.

## Backup checklist

Before updates, back up:

- The SQLite database file (`DB_PATH`).
- The uploads directory (`UPLOADS_DIR`).
- Any custom environment variables.

## Common commands

```bash
# Dev
pnpm dev

# Build / run production
pnpm build
pnpm start

# Checks
pnpm check
pnpm lint
pnpm format

# Tests
pnpm test

# Database
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Clean everything (destructive)
pnpm clean
```

## Source references

- Env config: `src/lib/config/env.server.ts`
- Dockerfile: `Dockerfile`
- DB init: `src/server/db/init.ts`
- DB connection: `src/server/db/index.ts`
- DB schema: `src/server/db/schema/`
- DB patches: `src/server/db/patch/index.ts`
- Seeders: `src/server/db/seeders/`
- Hooks/server startup: `src/hooks.server.ts`
- Notification scheduler: `src/server/services/notificationSchedulerService.ts`
- Logger: `src/server/config/logger.ts`
- User docs: `docs/installation.md`, `docs/environment.md`
