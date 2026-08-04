<script lang="ts">
  import * as Chart from '$ui/chart/index.js';
  import { scaleUtc } from 'd3-scale';
  import { curveCatmullRom } from 'd3-shape';
  import { cubicOut } from 'svelte/easing';
  import { Area, AreaChart, type AreaChartProps } from 'layerchart';
  import type { VehicleTrendSeries } from '$stores/chart.svelte';
  import ChartPoints from '$appui/ChartPoints.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';
  import Skeleton from '$ui/skeleton/skeleton.svelte';
  import { overview_chart_no_data } from '$lib/paraglide/messages/_index.js';

  let {
    series,
    title,
    xFormatter,
    valueFormatter,
    loading = false,
    bare = false
  }: {
    series: VehicleTrendSeries[];
    title: string;
    xFormatter: (_: Date) => string;
    valueFormatter?: (_: number, _series: VehicleTrendSeries) => string;
    loading?: boolean;
    /** Render content only — surrounding card chrome is provided by the parent. */
    bare?: boolean;
  } = $props();

  // Fallback for vehicles without a color set. ponytail: fixed 5-hue categorical
  // ramp, cycles past 5 uncolored vehicles — soft cap per dataviz guidance.
  const PALETTE = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)'
  ];

  const computeAverage = (data: VehicleTrendSeries['data']): number | undefined => {
    const values = data.map((d) => d.y).filter((v): v is number => typeof v === 'number');
    if (!values.length) return undefined;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  };

  const coloredSeries = $derived(
    series.map((s, i) => {
      const average = computeAverage(s.data);
      return {
        ...s,
        color: s.color ?? PALETTE[i % PALETTE.length],
        average,
        formattedAverage:
          average !== undefined ? (valueFormatter?.(average, s) ?? average.toFixed(2)) : undefined
      };
    })
  );

  const combinedData = $derived(series.flatMap((s) => s.data));
  const hasData = $derived(combinedData.length > 0);

  const chartProps = {
    xAxis: {
      format: (v: Date) => v.toLocaleDateString('en-IN', { month: 'short' })
    },
    yAxis: {
      format: (v: number) =>
        coloredSeries[0] ? (valueFormatter?.(v, coloredSeries[0]) ?? v.toString()) : v.toString()
    },
    grid: {
      style: 'stroke-dasharray: 2',
      class: 'stroke-1'
    }
  } satisfies AreaChartProps<unknown>['props'];

  const chartConfig = $derived(
    Object.fromEntries(
      coloredSeries.map((s) => [s.vehicleId, { label: s.label, color: s.color }])
    ) satisfies Chart.ChartConfig
  );
</script>

<div
  class={bare
    ? 'area-chart relative flex h-full flex-col'
    : 'area-chart lg:bg-background/50 bg-secondary relative rounded-xl border px-4 pt-2 pb-6 lg:p-6'}
>
  <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
    {#if !bare}
      <span class="font-bold">{title}</span>
    {/if}
    {#if coloredSeries.length > 1}
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        {#each coloredSeries as s (s.vehicleId)}
          <span class="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
            <span class="inline-block size-1.5 rounded-full" style="background-color: {s.color}"
            ></span>
            {s.label}
            {#if s.formattedAverage !== undefined}
              <span class="opacity-70">· Avg {s.formattedAverage}</span>
            {/if}
          </span>
        {/each}
      </div>
    {:else if coloredSeries[0]?.formattedAverage !== undefined}
      <span
        class="bg-background/90 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium shadow-sm"
      >
        <span
          class="inline-block size-1.5 rounded-full"
          style="background-color: {coloredSeries[0].color}"
        ></span>
        Avg: {coloredSeries[0].formattedAverage}
      </span>
    {/if}
  </div>
  {#if loading}
    <div
      class={bare
        ? 'flex min-h-0 flex-1 flex-col justify-end space-y-2'
        : 'flex h-50 flex-col justify-end space-y-2'}
    >
      <div class="flex h-full items-end justify-between gap-2">
        {#each [40, 65, 45, 80, 55, 70, 50, 85, 60, 75] as height, i (i)}
          <Skeleton class="w-full rounded-t" style="height: {height}%" />
        {/each}
      </div>
      <Skeleton class="h-4 w-full" />
    </div>
  {:else if hasData}
    <Chart.Container
      config={chartConfig}
      class={bare ? 'aspect-auto min-h-0 w-full flex-1' : 'aspect-[2.5/1]'}
    >
      <AreaChart
        x="x"
        y="y"
        xScale={scaleUtc()}
        padding={{ left: 48 }}
        series={coloredSeries.map((s) => ({
          key: s.vehicleId,
          label: s.label,
          color: s.color,
          data: s.data
        }))}
        axis
        props={chartProps}
      >
        {#snippet tooltip()}
          <Chart.Tooltip labelFormatter={xFormatter} indicator="line">
            {#snippet formatter({ value, name })}
              {@const matched = coloredSeries.find((s) => s.label === name)}
              {@const formattedValue =
                typeof value === 'number'
                  ? ((matched ? valueFormatter?.(value, matched) : undefined) ?? value.toFixed(2))
                  : value}
              <span class="text-muted-foreground">{name}</span>
              <span class="font-mono font-medium tabular-nums">{formattedValue}</span>
            {/snippet}
          </Chart.Tooltip>
        {/snippet}
        {#snippet marks()}
          {#each coloredSeries as s (s.vehicleId)}
            <Area
              seriesKey={s.vehicleId}
              data={s.data}
              x="x"
              y1="y"
              curve={curveCatmullRom}
              fill={s.color}
              fillOpacity={0.12}
              line={{
                stroke: s.color,
                class: 'stroke-2',
                motion: 'none',
                draw: { duration: 900, easing: cubicOut }
              }}
            />
            <ChartPoints seriesKey={s.vehicleId} data={s.data} color={s.color} />
          {/each}
        {/snippet}
      </AreaChart>
    </Chart.Container>
  {:else}
    <div class="flex h-full flex-col items-center justify-center">
      <LabelWithIcon icon={CircleSlash2} iconClass="h-4 w-4" label={overview_chart_no_data()} />
    </div>
  {/if}
</div>
