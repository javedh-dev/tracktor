# Feature Toggle System

This document explains how to use the feature toggle system in Tracktor.

## Overview

The feature toggle system allows you to enable or disable specific features throughout the application. This is useful for:

- Rolling out features gradually
- A/B testing
- Providing customization options to users
- Hiding incomplete features

## Available Features

The following features can be toggled:

1. **Fuel Log** - Track and manage fuel consumption and refueling history
2. **Maintenance** - Record and schedule vehicle maintenance activities
3. **PUCC** - Manage Pollution Under Control Certificate records
4. **Reminders** - Set and receive reminders for important vehicle events
5. **Insurance** - Manage vehicle insurance details and renewals
6. **Overview** - Display overview dashboard with key vehicle metrics

## Configuration

Features are configured through the Settings page under the "Features" tab. Each feature has a checkbox that can be toggled on or off.

### Database Storage

Feature toggles are stored in the `configs` table with the following keys:

- `featureFuelLog`
- `featureMaintenance`
- `featurePucc`
- `featureReminders`
- `featureInsurance`
- `featureOverview`

Values are stored as strings: `'true'` or `'false'`

## Usage in Code

### Using the FeatureGate Component

The easiest way to conditionally show/hide components based on feature flags:

```svelte
<script>
	import FeatureGate from '$lib/components/feature/FeatureGate.svelte';
</script>

<!-- Show component only if fuel log feature is enabled -->
<FeatureGate feature="fuelLog">
	<FuelLogComponent />
</FeatureGate>

<!-- Require multiple features (all must be enabled) -->
<FeatureGate requireAll={['fuelLog', 'maintenance']}>
	<CombinedView />
</FeatureGate>

<!-- Require at least one feature to be enabled -->
<FeatureGate requireAny={['insurance', 'pucc']}>
	<DocumentsSection />
</FeatureGate>

<!-- With fallback content -->
<FeatureGate feature="overview">
	{#snippet children()}
		<OverviewDashboard />
	{/snippet}
	{#snippet fallback()}
		<p>Overview feature is currently disabled</p>
	{/snippet}
</FeatureGate>
```

### Using Helper Functions

For more programmatic control:

```typescript
import {
	isFeatureEnabled,
	Features,
	getEnabledFeatures,
	areAllFeaturesEnabled,
	isAnyFeatureEnabled
} from '$lib/helper/feature.helper';

// Check if a single feature is enabled
if (isFeatureEnabled(Features.FUEL_LOG)) {
	// Show fuel log functionality
}

// Get all enabled features
const enabledFeatures = getEnabledFeatures();
console.log('Enabled features:', enabledFeatures);

// Check if all features are enabled
if (areAllFeaturesEnabled([Features.FUEL_LOG, Features.MAINTENANCE])) {
	// Show combined view
}

// Check if any feature is enabled
if (isAnyFeatureEnabled([Features.INSURANCE, Features.PUCC])) {
	// Show documents section
}
```

### Direct Access via Config Store

```typescript
import { configStore } from '$stores/config.svelte';

// In a Svelte component
let showFuelLog = $derived(configStore.configs.featureFuelLog);
```

## Conditional Navigation

You can use feature flags to conditionally show/hide navigation items:

```svelte
<script>
	import { configStore } from '$stores/config.svelte';
</script>

{#if configStore.configs.featureFuelLog}
	<NavItem href="/fuel-log">Fuel Log</NavItem>
{/if}

{#if configStore.configs.featureMaintenance}
	<NavItem href="/maintenance">Maintenance</NavItem>
{/if}
```

## Best Practices

1. **Always provide fallback UI** - Consider what users should see when a feature is disabled
2. **Use semantic checks** - Instead of checking multiple flags separately, use `requireAll` or `requireAny`
3. **Keep flags granular** - Each feature should be independently toggleable
4. **Document dependencies** - If Feature B requires Feature A, document this relationship
5. **Test both states** - Always test with features both enabled and disabled

## Adding New Features

To add a new feature toggle:

1. **Create a migration** to add the config:

   ```sql
   INSERT INTO `configs` VALUES
   ('featureNewFeature','true','Description of the feature', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
   ```

2. **Update the Config interface** in [src/lib/domain/config.ts](../domain/config.ts):

   ```typescript
   export interface Configs {
   	// ... existing fields
   	featureNewFeature?: boolean;
   }
   ```

3. **Update the config store** in [src/lib/stores/config.svelte.ts](../stores/config.svelte.ts):
   - Add default value
   - Add case in switch statement

4. **Update the schema** in [SettingsForm.svelte](../components/feature/settings/SettingsForm.svelte):

   ```typescript
   const configSchema = z.object({
   	// ... existing fields
   	featureNewFeature: z.boolean().optional()
   });
   ```

5. **Add checkbox** to the Features tab in SettingsForm.svelte

6. **Update the Features constant** in [src/lib/helper/feature.helper.ts](feature.helper.ts):
   ```typescript
   export const Features = {
   	// ... existing features
   	NEW_FEATURE: 'newFeature'
   } as const;
   ```

## Migration

Run migrations to apply the feature toggle configs:

```bash
pnpm db:push
# or
pnpm db:migrate
```
