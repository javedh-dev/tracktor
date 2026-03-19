Tracktor repository instructions for agentic coding work.

## Svelte MCP Usage

Use the Svelte MCP server for any Svelte, SvelteKit, or `.svelte`/
`.svelte.ts` work.

### 1. `list-sections`

Use this first to discover docs sections. Always start Svelte tasks here.

### 2. `get-documentation`

After `list-sections`, inspect `use_cases` and fetch all relevant sections at
once when possible.

### 3. `svelte-autofixer`

Use this whenever writing or editing Svelte code. Iterate until clean.

### 4. `playground-link`

Only use after the user asks for a playground link. Never use it for code
already written to the repo.

## Project Snapshot

- Tracktor is a vehicle management app built with SvelteKit, Svelte 5, Vite,
  Tailwind CSS, SQLite, and Drizzle ORM.
- i18n uses inlang / Paraglide.
- TypeScript is the default, with strict checking enabled.

## Key Paths

- `src/routes/` pages, layouts, and endpoints.
- `src/lib/components/` reusable UI.
- `src/lib/domain/` business rules and models.
- `src/lib/services/` orchestration and data access.
- `src/lib/helper/` shared helpers.
- `src/lib/config/` app config and feature toggles.
- `src/server/` server-only helpers.
- `messages/`, `project.inlang/`, `migrations/` for i18n and DB work.

## Core Commands

- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Preview: `pnpm preview`
- Check: `pnpm check`
- Watch check: `pnpm check:watch`
- Lint: `pnpm lint`
- Format: `pnpm format`
- Test: `pnpm test`
- Test watch: `pnpm test:watch`
- Coverage: `pnpm test:coverage`
- DB: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`
- Clean: `pnpm clean`

## Single-Test Commands

- Run one file: `pnpm test -- path/to/file.test.ts`
- Run one file directly: `pnpm vitest --run path/to/file.test.ts`
- Run by name: `pnpm test -- -t "test name"`
- Run a focused pattern: `pnpm vitest --run -t "test name"`
- Run a folder: `pnpm vitest --run src/__tests__/feature`

## Tooling Expectations

- Use `pnpm` for package commands.
- Prefer repo scripts over raw binaries.
- Run `pnpm check` and `pnpm lint` before finishing.
- For test or logic changes, run the narrowest relevant test first.

## Code Style

- Use ESM only; the repo is `type: module`.
- Keep TypeScript strict; avoid `any` unless the surrounding code already uses it.
- Remove unused imports; ESLint fails on them.
- Prefer small, composable functions and clear names.
- Use `camelCase` for values/functions, `PascalCase` for components/types,
  and `SCREAMING_SNAKE_CASE` for constants.
- Keep route/server code aligned with SvelteKit conventions.
- Prefer aliases from `svelte.config.js` over long relative paths.
- Group imports: external, aliases, then local.

## Formatting Rules

- Follow the existing Prettier + ESLint setup.
- Let `pnpm format` handle spacing, wrapping, and ordering.
- Match the repo's quote and semicolon style.
- Add comments only when something is non-obvious.

## Svelte Conventions

- Assume Svelte 5 semantics where the file already uses them.
- Use runes only where the project already expects them.
- Keep props and events simple.
- Prefer derived values/helpers over complex template logic.
- Split busy `.svelte` markup into smaller components.

## TypeScript Conventions

- Keep `strict`-compatible types in mind.
- Prefer inference for obvious locals; annotate public APIs and shared helpers.
- Use `unknown` for untrusted data.
- Narrow before accessing API/request/JSON values.
- Preserve file-name casing.

## Error Handling

- Fail fast on invalid inputs.
- Prefer existing response helpers over ad hoc shapes.
- Return clear, actionable error messages.
- Log enough context to debug, but never leak secrets or raw user data.
- Prefer typed branches and validation over broad catch-alls.

## Testing Guidance

- Keep tests close to the behavior they cover.
- Name tests clearly so `-t` and file filters stay useful.
- Add regression tests for bug fixes when practical.
- Prefer deterministic tests with minimal external dependencies.

## Repo-Specific Rules

- Respect boundaries under `src/lib/domain`, `src/lib/services`, and
  `src/lib/components`.
- Keep translation changes in `messages/` aligned with inlang.
- Use the Drizzle migration workflow for schema changes.
- Do not edit generated or ignored directories unless required.

## Existing Guidance To Preserve

- Copy the intent of `.github/copilot-instructions.md`.
- If `.cursor/rules/` or `.cursorrules` exist, incorporate them too.
- Keep changes consistent with the repo architecture and docs.

## When In Doubt

- Read the nearest module, test, or route first.
- Match patterns in the same folder.
- Prefer the smallest safe change.
- Validate with checks/tests before handing work back.
