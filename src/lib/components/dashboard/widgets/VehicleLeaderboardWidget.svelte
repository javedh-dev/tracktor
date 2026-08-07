<script lang="ts" module>
  export type LeaderboardMetric = 'cost' | 'efficiency';
</script>

<script lang="ts">
  import VehicleLeaderboard from '$dashboard/VehicleLeaderboard.svelte';
  import VehicleFilterDropdown from '$dashboard/VehicleFilterDropdown.svelte';
  import type { DashboardSummary } from '$lib/domain/dashboard';
  import { formatCurrency, formatMileage } from '$lib/helper/format.helper';
  import { vehicleStore } from '$stores/vehicle.svelte';

  let {
    summary,
    loading,
    metric
  }: {
    summary: DashboardSummary | null;
    loading: boolean;
    metric: LeaderboardMetric;
  } = $props();

  let selectedVehicleIds = $state<string[]>([]);

  const scopedVehicles = $derived(
    selectedVehicleIds.length
      ? (summary?.vehicles ?? []).filter((v) => selectedVehicleIds.includes(v.id))
      : (summary?.vehicles ?? [])
  );

  const entries = $derived.by(() => {
    if (metric === 'cost') {
      return scopedVehicles
        .filter((v) => v.totalExpenses > 0)
        .sort((a, b) => b.totalExpenses - a.totalExpenses)
        .slice(0, 8)
        .map((v) => ({
          id: v.id,
          name: `${v.make} ${v.model}`,
          plate: v.licensePlate,
          formattedValue: formatCurrency(v.totalExpenses)
        }));
    }

    return scopedVehicles
      .filter((v) => v.avgMileage != null)
      .sort((a, b) => (b.avgMileage ?? 0) - (a.avgMileage ?? 0))
      .slice(0, 8)
      .map((v) => ({
        id: v.id,
        name: `${v.make} ${v.model}`,
        plate: v.licensePlate,
        formattedValue: formatMileage(v.avgMileage ?? 0, v.fuelType)
      }));
  });
</script>

<div class="flex h-full flex-col">
  <div class="mb-2 flex shrink-0 justify-end">
    <VehicleFilterDropdown
      vehicles={vehicleStore.vehicles ?? []}
      bind:selectedIds={selectedVehicleIds}
    />
  </div>
  <div class="min-h-0 flex-1 overflow-y-auto">
    <VehicleLeaderboard {entries} {loading} />
  </div>
</div>
