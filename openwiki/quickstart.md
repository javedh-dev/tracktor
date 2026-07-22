# Tracktor — OpenWiki Quickstart

Tracktor is an open-source vehicle management web application. It lets a single user or household track fuel consumption, maintenance history, insurance and pollution-under-control (PUCC) certificates, reminders, and dashboard analytics for one or more vehicles.

> **Stability note:** The project is under active development and README marks it as not yet stable for production. Keep backups of `DB_PATH` and `UPLOADS_DIR`.

## What this wiki covers

This wiki is a navigation layer over the source code and the existing `docs/` guides. It is aimed at engineers who need to understand the architecture, find the right file quickly, and change things safely.

- [Architecture overview](./architecture/overview.md)
- [Routing and API surface](./architecture/routing-and-api.md)
- [Domain and data models](./domain/data-models.md)
- [Feature toggles workflow](./workflows/feature-toggles.md)
- [Authentication workflow](./workflows/authentication.md)
- [Operations runbook](./operations/runbook.md)
- [Testing guidance](./testing.md)

## Tech stack

| Layer       | Technology                              |
| ----------- | --------------------------------------- |
| Framework   | SvelteKit 2 + Svelte 5 runes            |
| Styling     | Tailwind CSS v4                         |
| Build / dev | Vite 8                                  |
| i18n        | inlang / Paraglide JS                   |
| ORM / DB    | Drizzle ORM + SQLite (`@libsql/client`) |
| Auth        | Bcrypt + custom DB sessions             |
| Cron        | `node-cron` for scheduled notifications |
| PDF         | `pdfkit` for maintenance log export     |
| Container   | Docker / Docker Compose                 |

Source of truth: `package.json`, `svelte.config.js`, `vite.config.js`, `drizzle.config.js`.

## Run the project locally

```bash
# Install dependencies (pnpm is required)
pnpm install

# Start the dev server (uses SQLite at ./tracktor.dev.db)
pnpm dev

# Or the local variant without --host
pnpm local
```

The dev server exposes the app on the configured host/port (default `localhost:5173` unless overridden). The production build uses `HOST`/`PORT` env vars and defaults to `0.0.0.0:3000` in Docker.

## Useful commands

```bash
pnpm build              # Production build into ./build
pnpm preview            # Preview production build
pnpm check              # svelte-kit sync + svelte-check
pnpm lint               # ESLint + Prettier check
pnpm format             # Auto-fix and format
pnpm test               # Run Vitest once
pnpm test:watch         # Run Vitest in watch mode
pnpm db:generate        # Generate Drizzle migration
pnpm db:migrate         # Run Drizzle migrations
pnpm db:seed            # Seed demo data
pnpm clean              # Remove build artifacts, DBs, uploads, logs
```

## Key directories

- `src/routes/` — pages, layouts, and API endpoints.
- `src/lib/components/` — UI components split into `ui/`, `app/`, `layout/`, `feature/`.
- `src/lib/domain/` — Zod schemas and TypeScript interfaces for business entities.
- `src/lib/services/` — client-side service orchestration and API callers.
- `src/lib/stores/` — Svelte 5 runes-based stores (config, vehicle, auth, theme, sheet, etc.).
- `src/server/services/` — server-side business logic (auth, vehicles, fuel, maintenance, etc.).
- `src/server/db/` — Drizzle schema, DB connection, migrations, seeders, patches.
- `src/server/middlewares/` — request middleware (auth, CORS, rate limit, logging).
- `src/server/utils/` — shared server helpers (route error handling, sessions, file utilities).
- `messages/` — translation source files.
- `migrations/` — Drizzle migration SQL and metadata.
- `docs/` — user-facing setup and feature docs.
- `.github/workflows/` — CI, Docker publish, and OpenWiki update automation.

## Recent changes worth knowing

As of `HEAD` (`0674858`) and the current working tree:

- Dashboard config loading moved from a client-side `+layout.ts` to a server `+layout.server.ts`; the dashboard layout now receives `rawConfigs`, typed `configs`, `vehicles`, and `user` in `data`.
- `configStore.setConfigs(...)` and `vehicleStore.setVehicles(...)` were added so the dashboard layout can hydrate stores directly from server data instead of triggering extra client fetches.
- A `+page.server.ts` was added to `/login` to gate registration and redirect already-authenticated users.
- Recent merged work added fuel-log `rate` and `distanceDriven` fields, maintenance-log PDF export, dependency/chart upgrades, and broader i18n translations.

See `git log --oneline` and `git diff HEAD` for the exact delta.

## Where to start reading code

1. `src/hooks.server.ts` — request pipeline, DB init, middleware chain.
2. `src/routes/dashboard/+layout.server.ts` — how every authenticated page is bootstrapped.
3. `src/lib/domain/` — business entities and validation rules.
4. `src/server/services/` — server business logic for the area you are changing.
5. `src/routes/api/.../+server.ts` — HTTP contract for each resource.

## Agent notes

- The repo uses ESM only (`"type": "module"`).
- Aliases are defined in `svelte.config.js`; prefer them over deep relative paths.
- Svelte 5 runes are used in newer `.svelte` and `.svelte.ts` files.
- Strict TypeScript is expected; avoid `any` unless the surrounding code already uses it.
- ESLint fails on unused imports.
- Run `pnpm check` and `pnpm lint` before finishing changes.
- Database changes require a Drizzle migration; see [Operations runbook](./operations/runbook.md).
