<script lang="ts">
  import * as Chart from '$ui/chart/index.js';
  import { scaleUtc } from 'd3-scale';
  import { curveCatmullRom } from 'd3-shape';
  import { cubicOut } from 'svelte/easing';
  import { Area, AreaChart, LinearGradient, type AreaChartProps } from 'layerchart';
  import type { Snippet } from 'svelte';
  import type { VehicleTrendSeries } from '$stores/chart.svelte';
  import ChartPoints from '$appui/ChartPoints.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import LegendInfoGroup from '$appui/LegendInfoGroup.svelte';
  import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';
  import Skeleton from '$ui/skeleton/skeleton.svelte';
  import { overview_chart_no_data } from '$lib/paraglide/messages/_index.js';

  let {
    series,
    title,
    xFormatter,
    valueFormatter,
    loading = false,
    bare = false,
    filter
  }: {
    series: VehicleTrendSeries[];
    title: string;
    xFormatter: (_: Date) => string;
    valueFormatter?: (_: number, _series: VehicleTrendSeries) => string;
    loading?: boolean;
    /** Render content only — surrounding card chrome is provided by the parent. */
    bare?: boolean;
    /** Rendered on the right of the header, alongside the legend/average badge. */
    filter?: Snippet;
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
  <div class="mb-4 flex flex-wrap items-center gap-2">
    {#if !bare}
      <span class="font-bold">{title}</span>
    {/if}
    <div class="ml-auto flex flex-wrap items-center gap-2">
      {#if coloredSeries.length > 0}
        <LegendInfoGroup
          items={coloredSeries.map((s) => ({
            color: s.color,
            label: s.label,
            detail: s.formattedAverage !== undefined ? `Avg ${s.formattedAverage}` : undefined
          }))}
        />
      {/if}
      {@render filter?.()}
    </div>
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
      class={bare ? 'aspect-auto min-h-0 w-full flex-1' : 'aspect-2.5/1'}
    >
      <AreaChart
        x="x"
        y="y"
        xScale={scaleUtc()}
        padding={{ left: 48, bottom: 24 }}
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
            <LinearGradient
              stops={[
                'color-mix(in lch, ' + s.color + ' 55%, transparent)',
                'color-mix(in lch, ' + s.color + ' 4%, transparent)'
              ]}
              vertical
            >
              {#snippet children({ gradient })}
                <Area
                  seriesKey={s.vehicleId}
                  data={s.data}
                  x="x"
                  y1="y"
                  curve={curveCatmullRom}
                  fillOpacity={0.8}
                  line={{
                    stroke: s.color,
                    class: 'stroke-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]',
                    motion: 'none',
                    draw: { duration: 900, easing: cubicOut }
                  }}
                  fill={gradient}
                />
              {/snippet}
            </LinearGradient>
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
