<script lang="ts">
  import DonutChart from '$dashboard/DonutChart.svelte';
  import type { DashboardSummary } from '$lib/domain/dashboard';

  let { summary, loading }: { summary: DashboardSummary | null; loading: boolean } = $props();

  const data = $derived.by(() => {
    const health = summary?.compliance.vehicleHealth;
    if (!health) return [];
    return [
      { name: 'Good', value: health.good, color: 'var(--success)' },
      { name: 'Attention', value: health.attention, color: 'var(--warning)' },
      { name: 'Needs Action', value: health.needsAction, color: 'var(--destructive)' }
    ].filter((d) => d.value > 0);
  });
</script>

<DonutChart bare {data} {loading} innerRadius={50} centerLabel="Total" />
