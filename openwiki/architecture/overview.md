---
type: "Reference"
title: "Architecture Overview"
openwiki_generated: true
---

# Architecture Overview

Tracktor is a conventional SvelteKit application with the server-side rendering path used for bootstrapping authenticated state, and API routes used for mutations. Business logic is split between client-side stores/services and server-side services that wrap Drizzle ORM queries.

## High-level layers

```
Browser
  │
  ▼
SvelteKit pages + layouts  (src/routes/)
  │
  ├─ Client stores       (src/lib/stores/*.svelte.ts)
  ├─ Client services     (src/lib/services/*.ts)
  └─ UI components       (src/lib/components/)
       │
       ▼
SvelteKit API routes     (src/routes/api/**/+server.ts)
       │
       ▼
Server middleware chain  (src/server/middlewares/)
       │
       ▼
Server services          (src/server/services/)
       │
       ▼
Drizzle ORM + SQLite     (src/server/db/)
```

## Request lifecycle

1. `src/hooks.server.ts` runs for every request.
   - Logs startup banner and an env snapshot once.
   - Ensures `UPLOADS_DIR` and `LOG_DIR` exist.
   - Runs Drizzle migrations, optional seeding, and DB patches.
   - Starts the notification scheduler.
   - Applies the middleware chain: CORS → Auth → Rate Limit → Logging.
   - Wraps unhandled errors with `HandleServerError`.
2. For API routes, the `AuthMiddleware` validates the session cookie (or `Authorization: Bearer ...` header) and sets `event.locals.user`.
3. The route handler parses input, calls a server service, and returns JSON.
4. On the client, Svelte 5 runes-based stores call the API through helpers in `src/lib/helper/api.helper.ts` and update local state.

## Server-side rendering bootstrap

Authenticated pages rely on server `load` functions to avoid a flash of unauthenticated content:

- `src/routes/+page.server.ts` redirects `/` to `/dashboard` when already logged in or auth is disabled, otherwise to `/login`.
- `src/routes/(auth)/login/+page.server.ts` redirects to `/register` if no users exist yet, and to `/dashboard` if the session is valid.
- `src/routes/dashboard/+layout.server.ts` validates the session, then fetches `rawConfigs` and `vehicles` in parallel and returns them to the layout.
- `src/routes/dashboard/+layout.svelte` hydrates `configStore`, `vehicleStore`, and `authStore` from `data` in an `$effect.pre`.

This is a recent change: the previous client-only `src/routes/dashboard/+layout.ts` was removed and replaced by the server layout load.

## Code organization

### Client

| Directory                     | Purpose                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/components/ui/`      | Shadcn-svelte-style primitive components (button, input, table, chart, skeleton, etc.).                                         |
| `src/lib/components/app/`     | App-level composites (TabContainer, FeatureTabShell, LabelWithIcon).                                                            |
| `src/lib/components/layout/`  | Layout chrome (Header, DashboardNav, AppSheet, Notifications).                                                                  |
| `src/lib/components/feature/` | Domain-specific components: `fuel/`, `maintenance/`, `insurance/`, `pucc/`, `reminders/`, `overview/`, `settings/`, `vehicle/`. |
| `src/lib/domain/`             | Zod schemas and TypeScript interfaces for every business entity.                                                                |
| `src/lib/services/`           | Client-side orchestration (API calls, autocomplete, file handling).                                                             |
| `src/lib/helper/`             | Shared helpers: API client, formatting, CSV parsing, feature flags, HTTP helpers.                                               |
| `src/lib/stores/`             | Svelte 5 runes stores for global UI state.                                                                                      |

### Server

| Directory                 | Purpose                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/server/db/schema/`   | Drizzle table definitions.                                                                                      |
| `src/server/db/seeders/`  | Demo data seeding.                                                                                              |
| `src/server/db/patch/`    | Post-migration patches applied after `seedData()`.                                                              |
| `src/server/services/`    | Business logic for auth, vehicles, fuel, maintenance, insurance, PUCC, reminders, notifications, config, files. |
| `src/server/middlewares/` | `BaseMiddleware`, `MiddlewareChain`, and concrete middlewares.                                                  |
| `src/server/exceptions/`  | `AppError` and HTTP-status mapping.                                                                             |
| `src/server/utils/`       | Error handling, route wrappers, session utilities, filesystem helpers.                                          |
| `src/server/config/`      | Logger, app version, and other runtime config.                                                                  |

## Conventions

- **ESM only** (`"type": "module"` in `package.json`).
- **Aliases** from `svelte.config.js` are preferred over `../../../` relative paths.
- **Svelte 5 runes** are used in newer components and stores; legacy store usage is being phased out.
- **Strict TypeScript** is expected; annotate public APIs and shared helpers.
- **Zod** is the canonical validation library for domain entities.
- **Responses** use the `ApiResponse` shape defined in `src/lib/response.ts` and the server helpers in `src/server/services/service-response.helper.ts`.

## Extension points

- New features usually need: a DB schema file, a domain file, a server service, an API route, a client service/store, and feature-gate wiring.
- New notification providers implement the interface used by `src/server/services/notificationDispatchService.ts` and are configured through `src/lib/domain/notification-provider.ts`.
- New i18n keys go in `messages/*.json` and are consumed through `$lib/paraglide/messages`.

## Source references

- Entry pipeline: `src/hooks.server.ts`
- Middleware base: `src/server/middlewares/base.ts`
- Auth middleware: `src/server/middlewares/auth.ts`
- Env config: `src/lib/config/env.server.ts`
- DB init: `src/server/db/init.ts`
- App version: `src/server/config/appVersion.ts`
