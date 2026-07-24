<script lang="ts">
  import * as Chart from '$ui/chart/index.js';
  import { PieChart } from 'layerchart';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

  interface DonutDataPoint {
    name: string;
    value: number;
    color: string;
  }

  let {
    data,
    title = '',
    loading = false,
    showLegend = true,
    height = 300,
    innerRadius = 60
  }: {
    data: DonutDataPoint[];
    title?: string;
    loading?: boolean;
    showLegend?: boolean;
    height?: number;
    innerRadius?: number;
  } = $props();

  const total = $derived(data.reduce((sum, d) => sum + d.value, 0));

  const itemsWithPercent = $derived(
    data.map((d) => ({
      ...d,
      percentage: total > 0 ? roundToDec((d.value / total) * 100, 1) : 0
    }))
  );

  function roundToDec(value: number, decimals: number): number {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }

  const chartConfig = $derived(
    Object.fromEntries(
      data.map((d) => [d.name, { label: d.name, color: d.color }])
    ) satisfies Chart.ChartConfig
  );

  const chartStyle = $derived(`height: ${height}px`);
</script>

<div class="donut-chart bg-secondary lg:bg-background/50 relative rounded-lg px-4 pt-2 pb-6 lg:p-6">
  {#if title}
    <div class="mb-4 font-bold">
      <span>{title}</span>
    </div>
  {/if}

  {#if loading}
    <div class="flex flex-col items-center gap-6" style={chartStyle}>
      <div class="flex flex-1 items-center justify-center">
        <Skeleton
          class="rounded-full"
          style="width: {Math.min(height * 0.6, 220)}px; height: {Math.min(height * 0.6, 220)}px"
        />
      </div>
      <div class="flex flex-wrap justify-center gap-4">
        {#each [0, 1, 2] as i (i)}
          <div class="flex items-center gap-2">
            <Skeleton class="size-3 rounded-full" />
            <Skeleton class="h-3 w-16" />
          </div>
        {/each}
      </div>
    </div>
  {:else if data.length === 0}
    <div class="flex flex-col items-center justify-center gap-2" style={chartStyle}>
      <span class="text-muted-foreground text-sm">No data available</span>
    </div>
  {:else}
    <Chart.Container config={chartConfig} class="aspect-auto" style={chartStyle}>
      <PieChart
        {data}
        key="name"
        label="name"
        value="value"
        c={(d: DonutDataPoint) => d.color}
        {innerRadius}
        padAngle={0.02}
        cornerRadius={4}
      >
        {#snippet tooltip()}
          <Chart.Tooltip indicator="dot">
            {#snippet formatter({ value, name })}
              {@const pct =
                total > 0 && typeof value === 'number' ? roundToDec((value / total) * 100, 1) : 0}
              <span class="text-muted-foreground">{name}</span>
              <span class="font-mono font-medium tabular-nums">
                {typeof value === 'number' ? value.toLocaleString() : value} ({pct}%)
              </span>
            {/snippet}
          </Chart.Tooltip>
        {/snippet}
      </PieChart>
    </Chart.Container>

    {#if showLegend && itemsWithPercent.length > 0}
      <div
        class="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3"
      >
        {#each itemsWithPercent as item (item.name)}
          <div class="flex items-center gap-2 text-sm">
            <span
              class="inline-block size-2.5 shrink-0 rounded-full"
              style="background-color: {item.color}"
            ></span>
            <span class="text-muted-foreground truncate">{item.name}</span>
            <span class="font-mono text-xs font-medium tabular-nums">{item.percentage}%</span>
            <span class="text-muted-foreground font-mono text-xs tabular-nums">
              ({item.value.toLocaleString()})
            </span>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>
