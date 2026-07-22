---
type: "Reference"
title: "Testing Guidance"
openwiki_generated: true
---

# Testing Guidance

Tracktor uses [Vitest](https://vitest.dev/) with [jsdom](https://github.com/jsdom/jsdom) for unit and component testing. Coverage is provided by `@vitest/coverage-v8`.

## Test setup

- Config: inferred from `vite.config.js`.
- Test directory: `src/__tests__/`.
- Current test file: `src/__tests__/index.test.ts` (a single placeholder test).

## Running tests

```bash
# Run all tests once
pnpm test

# Run in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run a single file
pnpm test -- path/to/file.test.ts
pnpm vitest --run path/to/file.test.ts

# Run tests matching a name
pnpm test -- -t "test name"
pnpm vitest --run -t "test name"

# Run all tests in a folder
pnpm vitest --run src/__tests__/feature
```

## Current coverage

As of this writing, the repository has a minimal test suite (`src/__tests__/index.test.ts` contains one trivial assertion). Most business logic is tested only through manual and integration usage.

## Where to add tests

When changing the following areas, add or extend tests in `src/__tests__/`:

- Domain helpers and Zod schemas: `src/lib/domain/`
- Formatting, CSV, feature helpers: `src/lib/helper/`
- Server services: `src/server/services/`
- API route validation and response shapes: `src/routes/api/`
- Svelte components: use `@testing-library/svelte` and jsdom.

## Testing conventions

- Keep tests deterministic and independent of external services.
- Name tests clearly so `vitest -t` filters stay useful.
- Use the test database path when testing service logic (`./tracktor.test.db` in `test` env via `src/lib/config/env.server.ts`).
- Prefer narrow unit tests for pure helpers; use component tests for UI behavior.
- When testing stores, instantiate a fresh store instance or reset state between tests to avoid shared runes state.

## Pre-commit checks

Run before finishing work:

```bash
pnpm check
pnpm lint
pnpm test
```

`pnpm check` runs `svelte-kit sync` and `svelte-check`, which catches type errors in `.svelte` files.

## Source references

- Test file: `src/__tests__/index.test.ts`
- Vite config: `vite.config.js`
- Package scripts: `package.json`
- Agent guidance: `AGENTS.md` (Testing Guidance section)
