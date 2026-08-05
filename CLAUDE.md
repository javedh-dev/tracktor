# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Svelte MCP Usage

Use the Svelte MCP server for any Svelte, SvelteKit, or `.svelte`/`.svelte.ts` work:

1. **`list-sections`** — call first to discover docs sections; always start Svelte tasks here.
2. **`get-documentation`** — after `list-sections`, inspect `use_cases` and fetch all relevant sections at once when possible.
3. **`svelte-autofixer`** — use whenever writing or editing Svelte code; iterate until clean.
4. **`playground-link`** — only after the user explicitly asks for one; never for code already written to the repo.

## Project Snapshot

Tracktor is a self-hosted vehicle management app (fuel, maintenance, insurance, PUCC/pollution certs, reminders) built with SvelteKit + Svelte 5, Tailwind CSS, SQLite (via `@libsql/client`), and Drizzle ORM. i18n uses inlang/Paraglide. TypeScript is strict throughout.

## Core Commands

- Install: `pnpm install`
- Dev server: `pnpm dev` (host mode) / `pnpm local` (localhost only)
- Build: `pnpm build` / Preview build: `pnpm preview`
- Type/svelte check: `pnpm check` (watch: `pnpm check:watch`)
- Lint: `pnpm lint` (eslint + prettier check) / Autofix: `pnpm format`
- Test: `pnpm test` (watch: `pnpm test:watch`, coverage: `pnpm test:coverage`)
- DB: `pnpm db:generate` (drizzle migration from schema changes), `pnpm db:migrate`, `pnpm db:seed`
- Clean: `pnpm clean` (removes build artifacts, db file, node_modules, etc.)

Always run `pnpm check` and `pnpm lint` before considering a change finished. ESLint fails the build on unused imports/vars.

### Single-Test Commands

- Run one file: `pnpm vitest --run path/to/file.test.ts`
- Run by test name: `pnpm vitest --run -t "test name"`
- Run a folder: `pnpm vitest --run src/__tests__/feature`

Note: test coverage is currently minimal (essentially a placeholder in `src/__tests__/index.test.ts`) — don't assume extensive existing test patterns exist for a given module.

## Architecture

### Path aliases (defined in `svelte.config.js`)

`$lib` → `src/lib`, `$ui` → `src/lib/components/ui`, `$appui` → `src/lib/components/app`, `$layout` → `src/lib/components/layout`, `$feature` → `src/lib/components/feature`, `$stores` → `src/lib/stores`, `$services` → `src/lib/services`, `$helper` → `src/lib/helper`, `$dashboard` → `src/lib/components/dashboard`, `$server` → `src/server`. Prefer these aliases over long relative paths.

### Two parallel "service" layers — don't confuse them

- **`src/lib/services/*.service.ts`** — browser/client-side code. Calls the app's own `/api/*` REST endpoints via `$lib/helper/api.helper` (`apiClient`) and returns a `Response<T>` shape (`{ status: 'OK' | 'ERROR', data?, error? }`). Used from `.svelte` pages/components.
- **`src/server/services/*Service.ts`** — server-only code. Talks directly to the Drizzle DB (`src/server/db`), does business logic, and is called from `+server.ts` route handlers (or `+page.server.ts`). Never import these from client-facing `.svelte` code.

`src/lib/domain/*` holds shared types/models and pure business rules (e.g. `domain/fuel/mileage.ts` mileage math) usable from both client and server code.

### Request pipeline

`src/hooks.server.ts` runs one-time app init (ensure directories, `initializeDatabase()` — runs Drizzle migrations, seeding, then patches — and starts the notification scheduler cron) and wires a `MiddlewareChain` (`src/server/middlewares`, chain-of-responsibility pattern via `BaseMiddleware`/`setNext`): `CorsMiddleware` → `AuthMiddleware` → `RateLimitMiddleware` → `LoggingMiddleware`. `AuthMiddleware` checks session cookie/Bearer token against `authService`, bypassing `/api/auth`, `/api/health`, `/api/config/branding`, and everything when `TRACKTOR_DISABLE_AUTH`/`env.DISABLE_AUTH` is set.

### Data layer

- Drizzle schema lives in `src/server/db/schema/*.ts` (one file per domain entity: `vehicle`, `fuel-log`, `insurance`, `maintenance-logs`, `pucc`, `reminder`, `notification`, `notification-provider`, `config`, `audit`, `auth`).
- SQLite dialect, `snake_case` column casing, migrations generated to `src/server/db/migrations` via `pnpm db:generate` — never hand-edit generated migrations.
- One-off data fixups live under `src/server/db/patch` and run via `applyPatches()` at startup, after migrations/seeding.

### Routes

- `src/routes/(app)/*` — authenticated app pages (dashboard, fuel, maintenance, insurance, pollution, reminders, vehicles, expenses, reports, settings), sharing the app shell (`AppSidebar`, `+layout.svelte`).
- `src/routes/(auth)/*` — login/register, outside the app shell.
- `src/routes/api/*` — REST endpoints as `+server.ts` files; vehicle-scoped resources nest under `api/vehicles/[id]/...`.

The app recently moved from a `/dashboard/*` nested-route structure to top-level feature routes (`/fuel`, `/insurance`, `/maintenance`, `/pollution`, `/reminders`) with a single sidebar app shell — the old `dashboard/(feature)` routes are being removed in favor of this flatter structure with fleet-wide/vehicle-selector support baked into each page.

### UI components

`src/lib/components/ui` is a shadcn-svelte install (`components.json`, baseColor `zinc`, registry `shadcn-svelte.com`) built on `bits-ui` + `tailwind-variants` — treat it as generated/vendored (it's excluded from lint) and prefer composing it from `$feature`/`$dashboard`/`$appui` rather than editing it directly. Charts use `layerchart`/`d3-*`.

### Feature toggles

Features (Fuel Log, Maintenance, PUCC, Reminders, Insurance, Overview) are stored as string `'true'/'false'` values in the `configs` table under keys like `featureFuelLog`, and gated in the UI with the `FeatureGate` component (`feature="fuelLog"` or `requireAll={[...]}`). See `docs/feature-toggles.md`.

## Code Style

- ESM only (`"type": "module"`); use `pnpm`, not raw `npm`/`yarn`/`npx`.
- `camelCase` for values/functions, `PascalCase` for components/types, `SCREAMING_SNAKE_CASE` for constants.
- Group imports: external, then aliases, then local relative.
- Assume Svelte 5 runes mode where a file already uses it; keep props/events simple; prefer derived values/helpers over complex template logic; split busy `.svelte` markup into smaller components.
- Fail fast on invalid inputs; prefer existing response/error helpers (`$server/exceptions/AppError`, `service-response.helper.ts`) over ad hoc shapes; narrow `unknown` before accessing API/request/JSON values.
- Respect the boundaries between `src/lib/domain`, `src/lib/services`, `src/server/services`, and `src/lib/components` described above.
- Keep translation changes in `messages/` aligned with inlang; regenerate via the Paraglide vite plugin (runs automatically through `vite dev`/`vite build`).
- Add comments only when something is genuinely non-obvious.
