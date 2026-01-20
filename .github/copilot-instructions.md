# Copilot Instructions for Tracktor

## Project Overview

- **Tracktor** is a SvelteKit-based web app for comprehensive vehicle management: fuel, maintenance, insurance, and regulatory tracking.
- **Frontend:** SvelteKit (Svelte 5), Tailwind CSS.  
  **Backend:** SvelteKit server routes, SQLite (via Drizzle ORM).
- **i18n:** Managed via [inlang](https://inlang.com) with config in `project.inlang/` and translation files in `messages/`.

## Key Architecture & Patterns

- **Domain logic** is organized under `src/lib/domain/` (e.g., vehicles, reminders, documents).
- **UI components** are in `src/lib/components/` (subfolders: `app/`, `feature/`, `layout/`, `ui/`).
- **API/server logic**: `src/routes/api/` and `src/server/` (config, db, services, middlewares).
- **Config/constants**: `src/lib/config/`, `src/lib/constants/`.
- **Feature toggles**: Controlled via config in `src/lib/config/` and documented in `docs/feature-toggles.md`.
- **i18n**: Use `src/lib/paraglide/` and `messages/` for translations. Reference `project.inlang/settings.json` for locale/plugin setup.

## Developer Workflows

- **Install dependencies:** `pnpm install`
- **Run dev server:** `pnpm dev`
- **Build for production:** `pnpm build`
- **Run tests:** `pnpm test` (see `src/__tests__/`)
- **Lint:** `pnpm lint`
- **Format:** `pnpm format`
- **Migrations:** SQL files in `migrations/`, managed by Drizzle ORM. See `drizzle.config.js`.
- **Docker:** Use `Dockerfile` for container builds. See `docs/installation.md` for details.

## Project Conventions

- **Type safety:** Use TypeScript throughout (`.ts`, `.svelte`).
- **State management:** Svelte stores in `src/lib/stores/`.
- **Utilities/helpers:** `src/lib/utils/`, `src/server/utils/`.
- **Testing:** Place tests in `src/__tests__/`.
- **Environment config:** See `src/lib/config/env.ts` and `docs/environment.md`.
- **Authentication:** See `docs/authentication.md` and `src/server/services/`.
- **Changelogs:** Versioned in `changelogs/`.

## Integration Points

- **i18n:** Managed by inlang, configured in `project.inlang/settings.json`.
- **Database:** SQLite via Drizzle ORM, config in `server/db/` and `drizzle.config.js`.
- **Feature toggles:** See `src/lib/config/` and `docs/feature-toggles.md`.

## Examples

- Add a new vehicle: see `src/lib/domain/vehicle.ts` and related UI in `src/lib/components/feature/`.
- Add a translation: update `messages/en.json` and reference in `project.inlang/settings.json`.
- Add a migration: create a new SQL file in `migrations/` and update Drizzle config.

## References

- [README.md](../README.md) — project intro, features, and docs
- [project.inlang/README.md](../project.inlang/README.md) — i18n setup
- [docs/](../docs/) — guides for installation, auth, env, toggles, contributing

---

For more, see the linked documentation files. Keep changes consistent with the above structure and conventions.
