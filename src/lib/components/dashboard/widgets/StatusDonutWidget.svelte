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
    const invalid = bucket.expiringSoon + bucket.expired + bucket.notAvailable;
    return [
      { name: 'Valid', value: bucket.valid, color: 'var(--success)' },
      { name: 'Invalid', value: invalid, color: 'var(--destructive)' }
    ].filter((d) => d.value > 0);
  });
</script>

<DonutChart bare {data} {loading} innerRadius={50} centerLabel="Total" />
