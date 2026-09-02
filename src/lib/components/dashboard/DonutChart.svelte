<script lang="ts">
  import * as Chart from '$ui/chart/index.js';
  import { PieChart } from 'layerchart';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import { donut_chart_no_data } from '$lib/paraglide/messages/_index.js';

  interface DonutDataPoint {
    name: string;
    value: number;
    color: string;
  }

  let {
    data,
    title = '',
    loading = false,
    height = 300,
    innerRadius = 60,
    bare = false,
    centerLabel = undefined,
    centerValueFormatter = (value: number) => value.toLocaleString()
  }: {
    data: DonutDataPoint[];
    title?: string;
    loading?: boolean;
    height?: number;
    innerRadius?: number;
    /** Render content only — surrounding card chrome is provided by the parent. */
    bare?: boolean;
    /** Small caption shown above the centered total, e.g. "Total Expenses". */
    centerLabel?: string | undefined;
    centerValueFormatter?: (value: number) => string;
  } = $props();

  const total = $derived(data.reduce((sum, d) => sum + d.value, 0));

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

  // Caps how large the donut itself can get — without it, a wide/tall widget would blow the
  // ring up to fill the whole card. Capping keeps it a stable size as the widget is resized.
  const MAX_DONUT_SIZE = 220;

  // Non-bare takes its size from the `height` prop; bare measures the box the card actually
  // gave us so it tracks the widget's rowSpan/colSpan (used by the hand-drawn rings and to size
  // the real PieChart's container, since that one otherwise just stretches to fill the card).
  let areaWidth = $state(0);
  let areaHeight = $state(0);
  const ringSize = $derived(
    bare
      ? Math.max(40, Math.min(areaWidth, areaHeight, MAX_DONUT_SIZE))
      : Math.min(height * 0.6, MAX_DONUT_SIZE)
  );

  // Single-slice ring is hand-drawn (no PieChart involved), so its hover is tracked locally.
  let singleHovered = $state(false);

  // Bound from PieChart so hovering an arc can be read here and mirrored into the center label —
  // layerchart keeps the currently-hovered datum on `context.tooltip.data`.
  let pieContext = $state<any>();
  const hoveredDatum = $derived(pieContext?.tooltip?.data as DonutDataPoint | undefined);
  const hoveredPercentage = $derived(
    hoveredDatum && total > 0 ? roundToDec((hoveredDatum.value / total) * 100, 1) : 0
  );
</script>

{#snippet centerContent(hovered?: DonutDataPoint & { percentage: number })}
  {#if hovered}
    <div
      class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-4 text-center"
    >
      <span class="text-muted-foreground max-w-full truncate text-xs font-medium"
        >{hovered.name}</span
      >
      <span class="text-foreground text-xl font-bold tracking-tight tabular-nums"
        >{hovered.value.toLocaleString()}</span
      >
      <span class="text-muted-foreground text-[11px] font-medium">{hovered.percentage}%</span>
    </div>
  {:else if centerLabel}
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
      class="flex items-center justify-center {chartAreaClass}"
      style={chartStyle}
      bind:clientWidth={areaWidth}
      bind:clientHeight={areaHeight}
    >
      <Skeleton class="rounded-full" style="width: {ringSize}px; height: {ringSize}px" />
    </div>
  {:else if data.length === 0}
    <div
      class="flex flex-col items-center justify-center gap-2 {chartAreaClass}"
      style={chartStyle}
    >
      <span class="text-muted-foreground text-sm">{donut_chart_no_data()}</span>
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
          class="cursor-default"
          role="img"
          aria-label="{data[0].name}: {data[0].value}"
          onmouseenter={() => (singleHovered = true)}
          onmouseleave={() => (singleHovered = false)}
        />
      </svg>
      {@render centerContent(singleHovered ? { ...data[0], percentage: 100 } : undefined)}
    </div>
  {:else}
    <div
      class="flex items-center justify-center {chartAreaClass}"
      style={chartStyle}
      bind:clientWidth={areaWidth}
      bind:clientHeight={areaHeight}
    >
      <div class="relative" style="width: {ringSize}px; height: {ringSize}px;">
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
            bind:context={pieContext}
          >
            {#snippet tooltip()}{/snippet}
          </PieChart>
        </Chart.Container>
        {@render centerContent(
          hoveredDatum ? { ...hoveredDatum, percentage: hoveredPercentage } : undefined
        )}
      </div>
    </div>
  {/if}
</div>
