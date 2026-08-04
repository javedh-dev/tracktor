<script lang="ts">
  import type { Component } from 'svelte';
  import { goto } from '$app/navigation';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Shield from '@lucide/svelte/icons/shield';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import { formatDistanceToNow } from 'date-fns';
  import { formatCurrency } from '$lib/helper/format.helper';
  import type { VehicleActivityEntry, VehicleHubSummary } from '$lib/domain/vehicle';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    vehicle: VehicleHubSummary;
  }

  let { vehicle }: Props = $props();

  const KIND_STYLES: Record<
    VehicleActivityEntry['kind'],
    { icon: Component<{ class?: string }>; dot: string; route: string }
  > = {
    fuel: {
      icon: Fuel,
      dot: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      route: '/fuel'
    },
    maintenance: {
      icon: Wrench,
      dot: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      route: '/maintenance'
    },
    insurance: {
      icon: Shield,
      dot: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      route: '/insurance'
    }
  };

  function title(entry: VehicleActivityEntry) {
    switch (entry.kind) {
      case 'fuel':
        return m.vehicle_hub_activity_fuel_added();
      case 'maintenance':
        return m.vehicle_hub_activity_maintenance();
      case 'insurance':
        return m.vehicle_hub_activity_insurance_renewed();
    }
  }

  function subtitle(entry: VehicleActivityEntry) {
    switch (entry.kind) {
      case 'fuel':
        return [
          entry.fuelAmount ? `${entry.fuelAmount}L` : null,
          entry.cost ? formatCurrency(entry.cost) : null
        ]
          .filter(Boolean)
          .join(' • ');
      case 'maintenance':
        return entry.serviceCenter || '';
      case 'insurance':
        return entry.policyNumber
          ? `${m.vehicle_hub_activity_policy_prefix()}${entry.policyNumber}`
          : '';
    }
  }

  const entries = $derived(vehicle.recentActivity ?? []);
  const scopeQuery = $derived(vehicle.id ? `?vehicle=${vehicle.id}` : '');
</script>

<div id="vehicle-hub-activity" class="bg-card space-y-4 rounded-xl border p-4">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="text-lg font-semibold">{m.vehicle_hub_activity_title()}</h3>
      <div class="bg-primary mt-2 h-0.5 w-10 rounded-full"></div>
    </div>
    <button
      type="button"
      class="text-primary text-sm font-medium hover:underline"
      onclick={() => goto(`/reports${scopeQuery}`)}
    >
      {m.common_view_all()}
    </button>
  </div>

  {#if entries.length === 0}
    <p class="text-muted-foreground text-sm">{m.vehicle_hub_activity_empty()}</p>
  {:else}
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {#each entries as entry (entry.id)}
        {@const style = KIND_STYLES[entry.kind]}
        {@const sub = subtitle(entry)}
        <button
          type="button"
          class="bg-muted/40 hover:bg-muted/70 flex items-center gap-3 rounded-lg border p-3 text-left transition-colors"
          onclick={() => goto(`${style.route}${scopeQuery}`)}
        >
          <span class="flex size-8 shrink-0 items-center justify-center rounded-lg {style.dot}">
            <style.icon class="size-4" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{title(entry)}</p>
            <p class="text-muted-foreground truncate text-xs">
              {#if sub}{sub} ·
              {/if}{formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
            </p>
          </div>
          <ChevronRight class="text-muted-foreground size-4 shrink-0" />
        </button>
      {/each}
    </div>
  {/if}
</div>
