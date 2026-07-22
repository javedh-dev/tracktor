---
type: "Reference"
title: "Feature Toggles Workflow"
openwiki_generated: true
---

# Feature Toggles Workflow

Tracktor can disable entire feature areas from the Settings page. Toggles are stored in the `configs` table and consumed by both server and client code.

## Available features

| Feature key          | UI route                 | Area               |
| -------------------- | ------------------------ | ------------------ |
| `featureFuelLog`     | `/dashboard/fuel`        | Fuel logs          |
| `featureMaintenance` | `/dashboard/maintenance` | Maintenance logs   |
| `featurePucc`        | `/dashboard/pollution`   | PUCC records       |
| `featureReminders`   | `/dashboard/reminders`   | Reminders          |
| `featureInsurance`   | `/dashboard/insurance`   | Insurance records  |
| `featureOverview`    | `/dashboard/overview`    | Dashboard overview |

Source of truth for keys: `src/lib/domain/config.ts` (`BOOLEAN_CONFIG_KEYS`) and `docs/feature-toggles.md`.

## How toggles flow through the app

1. **Storage:** `configs` table stores each feature key as `'true'` or `'false'`.
2. **Server load:** `src/routes/dashboard/+layout.server.ts` fetches all configs, builds a `configs` map where `feature*` keys are booleans, and returns it in `data`.
3. **Client hydration:** `src/routes/dashboard/+layout.svelte` runs `configStore.setConfigs(data.rawConfigs)` in `$effect.pre`.
4. **Coercion:** `configStore` (`src/lib/stores/config.svelte.ts`) converts boolean keys from strings and falls back to `DEFAULT_CONFIGS`, which default all features to `true`.
5. **Gating:** Components use `FeatureGate.svelte` or helper functions from `src/lib/helper/feature.helper.ts`.

## Component gating

`src/lib/components/feature/FeatureGate.svelte` supports three modes:

```svelte
<FeatureGate feature="fuelLog">
  <FuelLogView />
</FeatureGate>

<FeatureGate requireAll={['insurance', 'pucc']}>
  <DocumentsView />
</FeatureGate>

<FeatureGate requireAny={['fuelLog', 'maintenance']}>
  {#snippet children()}
    <SomeView />
  {/snippet}
  {#snippet fallback()}
    <p>Feature disabled</p>
  {/snippet}
</FeatureGate>
```

## Programmatic checks

```ts
import { isFeatureEnabled, Features, getEnabledFeatures } from '$lib/helper/feature.helper';

if (isFeatureEnabled(Features.FUEL_LOG)) { ... }
const enabled = getEnabledFeatures();
```

`isFeatureEnabled` maps a camelCase feature name to the `featureXxx` config key.

## Dashboard redirect behavior

`src/routes/dashboard/+layout.svelte` watches `configStore.configs` and the current path. If the user navigates to a route whose feature is disabled, the layout redirects to the first enabled feature route (in order: overview, fuel, maintenance, insurance, pollution, reminders).

This means disabling a feature both hides its UI and prevents landing on its route.

## Adding a new feature toggle

1. Add the key to `BOOLEAN_CONFIG_KEYS` in `src/lib/domain/config.ts`.
2. Add a default value to `DEFAULT_CONFIGS` in `src/lib/stores/config.svelte.ts`.
3. Add the route-to-feature mapping in `src/routes/dashboard/+layout.svelte` if it needs redirect protection.
4. Gate the UI with `FeatureGate` or `isFeatureEnabled`.
5. Add a settings checkbox bound to the config key.
6. Add translations in `messages/*.json` if the feature has a settings label.

## Source references

- Config domain: `src/lib/domain/config.ts`
- Config store: `src/lib/stores/config.svelte.ts`
- Feature helper: `src/lib/helper/feature.helper.ts`
- Feature gate component: `src/lib/components/feature/FeatureGate.svelte`
- Dashboard layout with redirect logic: `src/routes/dashboard/+layout.svelte`
- Dashboard server load: `src/routes/dashboard/+layout.server.ts`
- User docs: `docs/feature-toggles.md`
