<script lang="ts">
  import * as Chart from '$ui/chart/index.js';
  import { scaleUtc } from 'd3-scale';
  import { curveCatmullRom } from 'd3-shape';
  import { Area, AreaChart, LinearGradient, type AreaChartProps } from 'layerchart';
  import type { Snippet } from 'svelte';
  import type { DataPoint } from '$lib/domain/shared';
  import ChartPoints from '$appui/ChartPoints.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import LegendInfoGroup from '$appui/LegendInfoGroup.svelte';
  import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import { overview_chart_no_data } from '$lib/paraglide/messages/_index.js';

  type ChartPoint = DataPoint & { average: number };

  let {
    chartData,
    color = 'var(--primary)',
    label,
    title,
    xFormatter,
    valueFormatter,
    loading = false,
    bare = false,
    filter
  }: {
    chartData: DataPoint[];
    color?: string;
    label: string;
    title: string;
    xFormatter: (_: Date) => string;
    valueFormatter?: (_: number) => string;
    loading?: boolean;
    /** Render content only — surrounding card chrome is provided by the parent. */
    bare?: boolean;
    /** Rendered on the right of the header, alongside the average badge. */
    filter?: Snippet;
  } = $props();

  const chartProps = {
    area: {
      curve: curveCatmullRom,
      'fill-opacity': 0.4,
      line: { class: 'stroke-2' },
      motion: 'tween'
    },
    xAxis: {
      format: (v: Date) => v.toLocaleDateString('en-IN', { month: 'short' })
    },
    yAxis: {
      format: (v: number) => valueFormatter?.(v) ?? v.toString()
    },
    grid: {
      style: 'stroke-dasharray: 2',
      class: 'stroke-1'
    }
  } satisfies AreaChartProps<unknown>['props'];

  const chartConfig = $derived({
    data: {
      color,
      label
    }
  } satisfies Chart.ChartConfig);

  const averageValue = $derived.by(() => {
    const numericValues = chartData
      .map((point) => point.y)
      .filter((value): value is number => typeof value === 'number');
    return numericValues.length
      ? numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length
      : 0;
  });

  const chartDataWithAverage = $derived.by(() => {
    return chartData.map((point) => ({
      ...point,
      average: averageValue
    })) as ChartPoint[];
  });

  const formattedAverage = $derived.by(
    () => valueFormatter?.(averageValue) ?? averageValue.toFixed(2)
  );
</script>

<div
  id="chart-area-{title}"
  class={bare
    ? 'area-chart relative flex h-full flex-col'
    : 'area-chart lg:bg-background/50 bg-secondary relative rounded-xl border px-4 pt-2 pb-6 lg:p-6'}
>
  <div class="mb-4 flex flex-wrap items-center gap-2 font-bold">
    {#if !bare}
      <span>{title}</span>
    {/if}
    <div class="ml-auto flex flex-wrap items-center gap-2">
      <LegendInfoGroup items={[{ color, label, detail: `Avg ${formattedAverage}` }]} />
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
  {:else if chartData.length != 0}
    <Chart.Container
      config={chartConfig}
      class={bare ? 'aspect-auto min-h-0 w-full flex-1' : 'aspect-[2.5/1]'}
    >
      <AreaChart
        data={chartDataWithAverage}
        x="x"
        xScale={scaleUtc()}
        padding={{ left: 48, bottom: 24 }}
        series={[
          {
            key: 'y',
            label: chartConfig.data.label,
            color: chartConfig.data.color
          },
          {
            key: 'average',
            label: 'Average',
            color: 'var(--muted-foreground)'
          }
        ]}
        axis
        props={chartProps}
      >
        {#snippet tooltip()}
          <Chart.Tooltip labelFormatter={xFormatter} indicator="line">
            {#snippet formatter({ value, name })}
              {@const formattedValue =
                typeof value === 'number' ? (valueFormatter?.(value) ?? value.toFixed(2)) : value}
              <span class="text-muted-foreground">{name}</span>
              <span class="font-mono font-medium tabular-nums">{formattedValue}</span>
            {/snippet}
          </Chart.Tooltip>
        {/snippet}
        {#snippet marks({ context }: { context: any })}
          {#each context.series.visibleSeries as s (s.key)}
            {#if s.key === 'y'}
              <LinearGradient
                stops={[
                  'color-mix(in lch, ' + s.color + ' 55%, transparent)',
                  'color-mix(in lch, ' + s.color + ' 4%, transparent)'
                ]}
                vertical
              >
                {#snippet children({ gradient })}
                  <Area
                    seriesKey={s.key}
                    curve={curveCatmullRom}
                    fillOpacity={0.8}
                    line={{ class: 'stroke-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]' }}
                    motion="tween"
                    fill={gradient}
                  />
                {/snippet}
              </LinearGradient>
              <ChartPoints seriesKey={s.key} color={s.color} />
            {:else}
              <Area
                seriesKey={s.key}
                curve={curveCatmullRom}
                fill="none"
                line={{
                  stroke: s.color ?? 'var(--muted-foreground)',
                  strokeWidth: 1,
                  'stroke-dasharray': '6 4'
                }}
              />
            {/if}
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
