<script lang="ts">
  import type { Snippet } from 'svelte';
  import PageHeader from '$dashboard/PageHeader.svelte';
  import FeatureGate from '$feature/FeatureGate.svelte';
  import VehicleScopeSelector from './VehicleScopeSelector.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { page } from '$app/state';
  import { readVehicleScope, type VehicleScope } from '$lib/scope/vehicle-scope.svelte';

  interface Props {
    /** Omit for pages with no feature toggle (e.g. Reports) — the gate then always renders. */
    feature?: string;
    title: string;
    description?: string;
    disabledTitle?: string;
    disabledHint?: string;
    actions?: Snippet;
    children?: Snippet<[VehicleScope]>;
  }

  let {
    feature,
    title,
    description = '',
    disabledTitle = '',
    disabledHint = '',
    actions,
    children
  }: Props = $props();

  const scope = $derived(readVehicleScope(page.url, vehicleStore.vehicles));
</script>

{#snippet enabledContent()}
  <div class="space-y-6">
    <PageHeader {title} {description}>
      <VehicleScopeSelector />
      {@render actions?.()}
    </PageHeader>
    {@render children?.(scope)}
  </div>
{/snippet}

{#snippet disabledContent()}
  <div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
    <div class="text-center">
      <p class="text-muted-foreground text-lg font-medium">{disabledTitle}</p>
      <p class="text-muted-foreground text-sm">{disabledHint}</p>
    </div>
  </div>
{/snippet}

<FeatureGate {feature} children={enabledContent} fallback={disabledContent} />
