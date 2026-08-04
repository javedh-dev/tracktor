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
    legendPosition = 'bottom',
    height = 300,
    innerRadius = 60,
    bare = false,
    centerLabel = undefined,
    centerValueFormatter = (value: number) => value.toLocaleString()
  }: {
    data: DonutDataPoint[];
    title?: string;
    loading?: boolean;
    showLegend?: boolean;
    /** 'side' places the legend next to the pie instead of stacked below it. */
    legendPosition?: 'bottom' | 'side';
    height?: number;
    innerRadius?: number;
    /** Render content only — surrounding card chrome is provided by the parent. */
    bare?: boolean;
    /** Small caption shown above the centered total, e.g. "Total Expenses". */
    centerLabel?: string | undefined;
    centerValueFormatter?: (value: number) => string;
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

  // In bare mode the parent card owns the box, so fill it instead of forcing a pixel height.
  const chartStyle = $derived(bare ? '' : `height: ${height}px`);
  const chartAreaClass = $derived(bare ? 'min-h-0 w-full flex-1' : '');

  // Rings drawn by hand (single slice, loading) need a pixel size. Non-bare takes it from the
  // `height` prop; bare measures the box the card actually gave us so it tracks the widget's rowSpan.
  let areaWidth = $state(0);
  let areaHeight = $state(0);
  const ringSize = $derived(
    bare ? Math.max(40, Math.min(areaWidth, areaHeight)) : Math.min(height * 0.6, 220)
  );

  // Bare legends may need to give ground to the chart in a short card, and scroll rather than clip.
  const legendClass = $derived(
    legendPosition === 'side'
      ? 'flex min-w-0 flex-1 flex-col justify-center gap-1 overflow-y-auto'
      : bare
        ? 'mt-3 flex min-h-0 shrink flex-col gap-1 overflow-y-auto'
        : 'mt-4 flex shrink-0 flex-col gap-1'
  );

  // 'side' arranges the chart area + legend in a row; 'bottom' keeps them as a transparent
  // flex-col pass-through so the chart area's flex-1 still reaches up to the bare root.
  const contentWrapClass = $derived(
    legendPosition === 'side'
      ? 'flex min-h-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center'
      : 'flex min-h-0 flex-1 flex-col'
  );
</script>

{#snippet centerContent()}
  {#if centerLabel}
    <div
      class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center"
    >
      <span class="text-muted-foreground text-xs font-medium">{centerLabel}</span>
      <span class="text-foreground text-xl font-bold tracking-tight tabular-nums"
        >{centerValueFormatter(total)}</span
      >
    </div>
  {/if}
{/snippet}

<div
  class={bare
    ? 'donut-chart relative flex h-full flex-col'
    : 'donut-chart bg-secondary lg:bg-background/50 relative rounded-lg px-4 pt-2 pb-6 lg:p-6'}
>
  {#if title}
    <div class="mb-4 shrink-0 font-bold">
      <span>{title}</span>
    </div>
  {/if}

  {#if loading}
    <div
      class="flex flex-col items-center gap-6 {chartAreaClass}"
      style={chartStyle}
      bind:clientWidth={areaWidth}
      bind:clientHeight={areaHeight}
    >
      <div class="flex min-h-0 flex-1 items-center justify-center">
        <Skeleton class="rounded-full" style="width: {ringSize}px; height: {ringSize}px" />
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
    <div
      class="flex flex-col items-center justify-center gap-2 {chartAreaClass}"
      style={chartStyle}
    >
      <span class="text-muted-foreground text-sm">No data available</span>
    </div>
  {:else if data.length === 1}
    {@const size = ringSize}
    {@const strokeWidth = size * 0.2}
    {@const radius = (size - strokeWidth) / 2}
    <!-- A pie chart with a single 100% slice has no adjacent slice to derive a
         color scale from, so the underlying chart lib's fill resolution falls
         back to an unstyled default. Draw the single-value ring directly. -->
    <div
      class="relative flex items-center justify-center {chartAreaClass}"
      style={chartStyle}
      bind:clientWidth={areaWidth}
      bind:clientHeight={areaHeight}
    >
      <svg width={size} height={size} viewBox="0 0 {size} {size}">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={data[0].color}
          stroke-width={strokeWidth}
        />
      </svg>
      {@render centerContent()}
    </div>

    {#if showLegend}
      <div class={legendClass}>
        {#each itemsWithPercent as item (item.name)}
          <div
            class="hover:bg-muted/60 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors"
          >
            <span
              class="inline-block size-2.5 shrink-0 rounded-full"
              style="background-color: {item.color}"
            ></span>
            <span class="text-foreground truncate font-medium">{item.name}</span>
            <span class="text-muted-foreground shrink-0 font-mono text-xs tabular-nums"
              >{item.percentage}%</span
            >
            <span class="ml-auto shrink-0 font-mono text-xs font-semibold tabular-nums">
              {item.value.toLocaleString()}
            </span>
          </div>
        {/each}
      </div>
    {/if}
  {:else}
    <div class={contentWrapClass}>
      <div
        class="relative {legendPosition === 'side'
          ? 'mx-auto aspect-square h-40 shrink-0 sm:mx-0 sm:h-full sm:max-h-56'
          : chartAreaClass}"
        style={chartStyle}
      >
        <Chart.Container config={chartConfig} class="aspect-auto h-full w-full">
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
                    total > 0 && typeof value === 'number'
                      ? roundToDec((value / total) * 100, 1)
                      : 0}
                  <span class="text-muted-foreground">{name}</span>
                  <span class="font-mono font-medium tabular-nums">
                    {typeof value === 'number' ? value.toLocaleString() : value} ({pct}%)
                  </span>
                {/snippet}
              </Chart.Tooltip>
            {/snippet}
          </PieChart>
        </Chart.Container>
        {@render centerContent()}
      </div>

      {#if showLegend && itemsWithPercent.length > 0}
        <div class={legendClass}>
          {#each itemsWithPercent as item (item.name)}
            <div
              class="hover:bg-muted/60 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors"
            >
              <span
                class="inline-block size-2.5 shrink-0 rounded-full"
                style="background-color: {item.color}"
              ></span>
              <span class="text-foreground truncate font-medium">{item.name}</span>
              <span class="text-muted-foreground shrink-0 font-mono text-xs tabular-nums"
                >{item.percentage}%</span
              >
              <span class="ml-auto shrink-0 font-mono text-xs font-semibold tabular-nums">
                {item.value.toLocaleString()}
              </span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
