<script lang="ts">
	/**
	 * Example component demonstrating how to use the FeatureGate component
	 * This file can be removed - it's just for reference
	 */
	import FeatureGate from '$lib/components/feature/FeatureGate.svelte';
	import { Features, isFeatureEnabled } from '$lib/helper/feature.helper';
	import { configStore } from '$stores/config.svelte';
</script>

<div class="space-y-4 p-4">
	<h2 class="text-2xl font-bold">Feature Toggle Examples</h2>

	<!-- Example 1: Simple feature gate -->
	<div class="rounded-lg border p-4">
		<h3 class="font-semibold">Example 1: Simple Feature Gate</h3>
		<FeatureGate feature={Features.FUEL_LOG}>
			<div class="mt-2 rounded bg-green-100 p-2 text-green-800">✓ Fuel Log feature is enabled!</div>
		</FeatureGate>
	</div>

	<!-- Example 2: With fallback -->
	<div class="rounded-lg border p-4">
		<h3 class="font-semibold">Example 2: With Fallback Content</h3>
		<FeatureGate feature={Features.MAINTENANCE}>
			{#snippet children()}
				<div class="mt-2 rounded bg-green-100 p-2 text-green-800">
					✓ Maintenance feature is enabled!
				</div>
			{/snippet}
			{#snippet fallback()}
				<div class="mt-2 rounded bg-gray-100 p-2 text-gray-600">
					⚠ Maintenance feature is currently disabled
				</div>
			{/snippet}
		</FeatureGate>
	</div>

	<!-- Example 3: Require all features -->
	<div class="rounded-lg border p-4">
		<h3 class="font-semibold">Example 3: Require All Features (AND logic)</h3>
		<FeatureGate requireAll={[Features.FUEL_LOG, Features.MAINTENANCE]}>
			{#snippet children()}
				<div class="mt-2 rounded bg-green-100 p-2 text-green-800">
					✓ Both Fuel Log AND Maintenance are enabled!
				</div>
			{/snippet}
			{#snippet fallback()}
				<div class="mt-2 rounded bg-gray-100 p-2 text-gray-600">
					⚠ Both Fuel Log and Maintenance must be enabled
				</div>
			{/snippet}
		</FeatureGate>
	</div>

	<!-- Example 4: Require any feature -->
	<div class="rounded-lg border p-4">
		<h3 class="font-semibold">Example 4: Require Any Feature (OR logic)</h3>
		<FeatureGate requireAny={[Features.INSURANCE, Features.PUCC]}>
			{#snippet children()}
				<div class="mt-2 rounded bg-green-100 p-2 text-green-800">
					✓ At least one document feature (Insurance or PUCC) is enabled!
				</div>
			{/snippet}
			{#snippet fallback()}
				<div class="mt-2 rounded bg-gray-100 p-2 text-gray-600">
					⚠ Enable Insurance or PUCC to see document features
				</div>
			{/snippet}
		</FeatureGate>
	</div>

	<!-- Example 5: Using helper function in script -->
	<div class="rounded-lg border p-4">
		<h3 class="font-semibold">Example 5: Using Helper Functions</h3>
		<div class="mt-2 space-y-1">
			{#if isFeatureEnabled(Features.FUEL_LOG)}
				<div class="rounded bg-green-100 p-2 text-green-800">✓ Fuel Log: Enabled</div>
			{:else}
				<div class="rounded bg-gray-100 p-2 text-gray-600">✗ Fuel Log: Disabled</div>
			{/if}

			{#if isFeatureEnabled(Features.REMINDERS)}
				<div class="rounded bg-green-100 p-2 text-green-800">✓ Reminders: Enabled</div>
			{:else}
				<div class="rounded bg-gray-100 p-2 text-gray-600">✗ Reminders: Disabled</div>
			{/if}

			{#if isFeatureEnabled(Features.OVERVIEW)}
				<div class="rounded bg-green-100 p-2 text-green-800">✓ Overview: Enabled</div>
			{:else}
				<div class="rounded bg-gray-100 p-2 text-gray-600">✗ Overview: Disabled</div>
			{/if}
		</div>
	</div>

	<!-- Example 6: Direct config access -->
	<div class="rounded-lg border p-4">
		<h3 class="font-semibold">Example 6: Direct Config Store Access</h3>
		<div class="mt-2 space-y-1">
			<div class="text-sm">
				Insurance: {configStore.configs.featureInsurance ? '✓ Enabled' : '✗ Disabled'}
			</div>
			<div class="text-sm">
				PUCC: {configStore.configs.featurePucc ? '✓ Enabled' : '✗ Disabled'}
			</div>
		</div>
	</div>
</div>
