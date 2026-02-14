# AGENTS.md - Tracktor Project Guide for AI Coding Agents

## Project Overview

**Tracktor** is a full-stack SvelteKit web application for vehicle management (fuel, maintenance, insurance, documents).

- **Frontend:** SvelteKit (Svelte 5), Tailwind CSS v4, shadcn-svelte components
- **Backend:** SvelteKit server routes, SQLite database via Drizzle ORM
- **Language:** TypeScript (strict mode) with ES modules
- **Build Tool:** Vite
- **Package Manager:** pnpm (required)
- **Testing:** Vitest with jsdom
- **i18n:** Paraglide (inlang) - translations in `messages/`, generated code in `src/lib/paraglide/`

---

## Build, Lint, and Test Commands

### Development

```bash
pnpm install              # Install dependencies (required: pnpm)
pnpm dev                  # Start dev server with --host
pnpm build                # Production build
pnpm preview              # Preview production build
pnpm start                # Start production server (node build)
```

### Testing

```bash
pnpm test                 # Run all tests once
pnpm test:watch           # Run tests in watch mode
pnpm test:coverage        # Generate coverage report

# Run a single test file
pnpm vitest src/__tests__/specific-file.test.ts

# Run tests matching a pattern
pnpm vitest --run -t "test name pattern"
```

### Code Quality

```bash
pnpm lint                 # Run ESLint + Prettier check
pnpm format               # Fix ESLint issues + format with Prettier
pnpm check                # TypeScript/Svelte type checking
pnpm check:watch          # Type checking in watch mode
```

### Database

```bash
pnpm db:generate          # Generate Drizzle migrations
pnpm db:migrate           # Run database migrations
pnpm db:seed              # Seed database with test data
```

---

## Project Architecture

### Directory Structure

```
src/
├── __tests__/              # Vitest test files
├── hooks.server.ts         # Server hooks & middleware chain
├── lib/
│   ├── components/
│   │   ├── ui/            # shadcn-svelte base components (alias: $ui)
│   │   ├── app/           # App-specific reusable components (alias: $appui)
│   │   ├── layout/        # Layout components (alias: $layout)
│   │   └── feature/       # Feature-specific components (alias: $feature)
│   ├── config/            # Client config (env.ts, themes)
│   ├── constants/         # Application constants
│   ├── domain/            # Domain models with Zod schemas
│   ├── helper/            # Helper utilities (api, format, csv, etc.)
│   ├── paraglide/         # Generated i18n files (DO NOT EDIT MANUALLY)
│   ├── services/          # Client-side API services (alias: $services)
│   ├── stores/            # Svelte stores (alias: $stores)
│   ├── types/             # TypeScript type definitions
│   └── utils/             # General client utilities
├── routes/                # SvelteKit routes & API endpoints
│   ├── (auth)/           # Auth routes (grouped layout)
│   ├── dashboard/        # Dashboard routes
│   └── api/              # API endpoints (+server.ts files)
└── server/                # Server-side code (alias: $server)
    ├── config/           # Server configuration
    ├── db/               # Database schema, migrations, seeders
    ├── exceptions/       # Custom AppError class
    ├── middlewares/      # Express-style middlewares
    ├── services/         # Server-side business logic
    └── utils/            # Server utilities
```

### Path Aliases (use these for imports)

- `$lib` → `./src/lib`
- `$ui` → `./src/lib/components/ui`
- `$appui` → `./src/lib/components/app`
- `$layout` → `./src/lib/components/layout`
- `$feature` → `./src/lib/components/feature`
- `$stores` → `./src/lib/stores`
- `$services` → `./src/lib/services`
- `$helper` → `./src/lib/helper`
- `$server` → `./src/server`

---

## Code Style Guidelines

### Formatting (Prettier + ESLint)

- **Indentation:** Tabs (NOT spaces)
- **Quotes:** Single quotes for strings
- **Line Width:** 100 characters max
- **Trailing Commas:** None
- **Semicolons:** Required (automatic insertion by Prettier)
- **File Naming:** kebab-case for files, PascalCase for Svelte components

### TypeScript

- **Strict Mode:** Always enabled - no `any` compromises unless absolutely necessary
- **Type Annotations:** Explicit types for function parameters and return values
- **Interfaces vs Types:** Use `type` for domain models, `interface` for contracts
- **Imports:** Use path aliases (`$lib/`, `$server/`, etc.) over relative paths
- **Null Handling:** Use optional chaining (`?.`) and nullish coalescing (`??`)

### Svelte 5 Patterns

```typescript
// Use Svelte 5 runes (modern syntax)
let count = $state(0);                    // Reactive state
let doubled = $derived(count * 2);        // Computed values
$effect(() => console.log(count));        // Side effects
let { prop = 'default' } = $props();      // Component props

// Component snippets for composition
{#snippet header()}
  <h1>Title</h1>
{/snippet}
```

### Naming Conventions

- **Variables/Functions:** camelCase (`getUserById`, `vehicleData`)
- **Components:** PascalCase (`VehicleCard.svelte`, `FuelLogForm.svelte`)
- **Constants:** UPPER_SNAKE_CASE for true constants (`MAX_RETRIES`)
- **Types/Interfaces:** PascalCase (`Vehicle`, `ApiResponse<T>`)
- **Database Tables:** snake_case (handled by Drizzle config)
- **Files:** kebab-case (`vehicle.service.ts`, `fuel-log-form.svelte`)

### Imports Organization

```typescript
// 1. External libraries
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// 2. SvelteKit imports
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// 3. Internal absolute imports (use path aliases)
import { db } from '$server/db';
import type { Vehicle } from '$lib/domain/vehicle';
import * as m from '$lib/paraglide/messages';

// 4. Relative imports (only for same directory)
import { helperFunction } from './utils';
```

### Error Handling

```typescript
// Server-side: Use AppError class
import { AppError, Status } from '$server/exceptions/AppError';

throw new AppError('Resource not found', Status.NOT_FOUND);

// Client-side: Use try-catch with proper typing
try {
	const result = await apiService.getData();
} catch (err) {
	const error = err as Error;
	console.error('Failed to fetch:', error.message);
}

// SvelteKit: Use error() helper in load functions
import { error } from '@sveltejs/kit';
throw error(404, 'Vehicle not found');
```

### Database Patterns (Drizzle ORM)

```typescript
// Use query builder for complex queries
const vehicle = await db.query.vehicleTable.findFirst({
	where: (v, { eq }) => eq(v.id, vehicleId),
	with: { fuelLogs: true }
});

// Use select for simple queries
const vehicles = await db
	.select()
	.from(schema.vehicleTable)
	.where(eq(schema.vehicleTable.userId, userId));

// Always use transactions for multi-step operations
await db.transaction(async (tx) => {
	await tx.insert(schema.vehicleTable).values(newVehicle);
	await tx.insert(schema.fuelLogTable).values(initialLog);
});
```

### Validation (Zod)

- Define schemas in `src/lib/domain/` with Zod
- Use for both runtime validation and TypeScript type inference
- Example: `vehicleSchema`, `fuelLogSchema`, `userSchema`

### State Management

- Use Svelte 5 runes (`$state`, `$derived`, `$effect`) for local component state
- Use stores in `src/lib/stores/` for global/shared state
- Store pattern: Class-based with runes, export singleton instance

### Logging

```typescript
// Server-side only (winston logger)
import logger from '$server/config/logger';

logger.info('Operation successful', { vehicleId, userId });
logger.error('Database error', { error: err.message });
```

---

## Testing Guidelines

- Place tests in `src/__tests__/` (currently minimal coverage - contributions welcome!)
- Use descriptive test names: `test('should calculate mileage correctly for partial fills', ...)`
- Use `describe` blocks to group related tests
- Mock external dependencies (database, API calls)
- Test both happy paths and error cases

---

## Important Conventions

### Feature Toggles

- Documented in `docs/feature-toggles.md`
- Controlled via `src/lib/config/`
- Use `<FeatureGate feature="featureName">` component for conditional rendering

### Internationalization (i18n)

```typescript
// Import messages (generated, DO NOT EDIT src/lib/paraglide/)
import * as m from '$lib/paraglide/messages';

// Use in code
const title = m.dashboard_title();

// Use in Svelte templates
<h1>{m.vehicles_list_title()}</h1>
```

### Environment Variables

- Client-side: Define in `src/lib/config/env.ts`, prefix with `TRACKTOR_`
- Server-side: Define in `src/lib/config/env.server.ts`, use `dotenv`
- See `.env.example` for all available variables

### Authentication

- Server-side session validation in `hooks.server.ts`
- Password hashing with bcrypt
- Session tokens with `@oslojs/crypto`

### CI/CD Pipeline (GitHub Actions)

1. Compile i18n messages
2. Lint check (`pnpm lint`)
3. Type check (`pnpm check`)
4. Run tests (`pnpm test`)
5. Build (`pnpm build`)

---

## DO NOT

- ❌ Edit generated files in `src/lib/paraglide/` or `src/lib/components/ui/` manually
- ❌ Use spaces for indentation (tabs only)
- ❌ Use relative imports for cross-directory imports (use path aliases)
- ❌ Add trailing commas
- ❌ Skip type annotations on exported functions
- ❌ Commit `.env` files (use `.env.example` as template)
- ❌ Use `console.log` in production code (use `logger` on server)
- ❌ Skip validation on user inputs (always use Zod schemas)

---

## References

- [README.md](./README.md) - Project overview and setup
- [docs/](./docs/) - Detailed documentation (installation, auth, features)
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Original Copilot rules
- [project.inlang/](./project.inlang/) - i18n configuration
