<script lang="ts" module>
  export type StatusDonutMetric = 'other' | 'insurance';
</script>

<script lang="ts">
  import DonutChart from '$dashboard/DonutChart.svelte';
  import type { DashboardSummary } from '$lib/domain/dashboard';

  let {
    summary,
    loading,
    metric
  }: {
    summary: DashboardSummary | null;
    loading: boolean;
    metric: StatusDonutMetric;
  } = $props();

  const data = $derived.by(() => {
    const bucket = metric === 'other' ? summary?.compliance.other : summary?.compliance.insurance;
    if (!bucket) return [];
    return [
      { name: 'Valid', value: bucket.valid, color: 'var(--chart-1)' },
      { name: 'Expiring Soon', value: bucket.expiringSoon, color: 'var(--chart-4)' },
      { name: 'Expired', value: bucket.expired, color: 'var(--chart-5)' },
      { name: 'N/A', value: bucket.notAvailable, color: 'var(--muted-foreground)' }
    ].filter((d) => d.value > 0);
  });
</script>

<DonutChart bare {data} {loading} innerRadius={50} centerLabel="Total" />
