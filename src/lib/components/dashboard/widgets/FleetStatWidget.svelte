<script lang="ts" module>
  export type FleetStatMetric =
    'vehicle-count' | 'total-distance' | 'fuel-used' | 'total-expenses' | 'cost-per-distance';
</script>

<script lang="ts">
  import StatCard from '$dashboard/StatCard.svelte';
  import type { DashboardSummary } from '$lib/domain/dashboard';
  import { formatCurrency, formatDistance, getDistanceUnit } from '$lib/helper/format.helper';

  let {
    summary,
    loading,
    metric
  }: {
    summary: DashboardSummary | null;
    loading: boolean;
    metric: FleetStatMetric;
  } = $props();

  const value = $derived.by(() => {
    switch (metric) {
      case 'vehicle-count':
        return summary ? `${summary.fleet.totalVehicles}` : '--';
      case 'total-distance':
        return summary && summary.fleet.totalDistance > 0
          ? formatDistance(summary.fleet.totalDistance)
          : '--';
      case 'fuel-used':
        return summary && summary.fleet.totalFuelUsed > 0
          ? `${summary.fleet.totalFuelUsed.toFixed(1)} L`
          : '--';
      case 'total-expenses':
        return summary && summary.fleet.totalExpenses > 0
          ? formatCurrency(summary.fleet.totalExpenses)
          : '--';
      case 'cost-per-distance':
        return summary?.fleet.costPerDistance != null
          ? `${formatCurrency(summary.fleet.costPerDistance)}/${getDistanceUnit()}`
          : '--';
    }
  });
</script>

<StatCard bare value={loading ? '...' : value} />
