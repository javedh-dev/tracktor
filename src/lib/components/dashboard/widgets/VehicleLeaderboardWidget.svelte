<script lang="ts" module>
  export type LeaderboardMetric = 'cost' | 'efficiency';
</script>

<script lang="ts">
  import VehicleLeaderboard from '$dashboard/VehicleLeaderboard.svelte';
  import type { DashboardSummary } from '$lib/domain/dashboard';
  import { formatCurrency, formatMileage } from '$lib/helper/format.helper';

  let {
    summary,
    loading,
    metric
  }: {
    summary: DashboardSummary | null;
    loading: boolean;
    metric: LeaderboardMetric;
  } = $props();

  const entries = $derived.by(() => {
    if (!summary) return [];

    if (metric === 'cost') {
      return summary.vehicles
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

    return summary.vehicles
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

<div class="h-full overflow-y-auto">
  <VehicleLeaderboard {entries} {loading} />
</div>
