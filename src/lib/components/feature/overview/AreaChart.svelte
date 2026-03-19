<script lang="ts">
  import * as Chart from '$ui/chart/index.js';
  import { scaleUtc } from 'd3-scale';
  import { curveCatmullRom } from 'd3-shape';
  import { Area, AreaChart, LinearGradient, type AreaChartPropsObjProp } from 'layerchart';
  import type { DataPoint } from '$lib/domain';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
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
    loading = false
  }: {
    chartData: DataPoint[];
    color?: string;
    label: string;
    title: string;
    xFormatter: (_: Date) => string;
    valueFormatter?: (_: number) => string;
    loading?: boolean;
  } = $props();

  const chartProps = {
    area: {
      curve: curveCatmullRom,
      'fill-opacity': 0.4,
      line: { class: 'stroke-2' },
      motion: 'tween'
    },
    xAxis: {
      format: (v) => v.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      tickLabelProps: {
        rotate: 325,
        textAnchor: 'end'
      }
    },
    grid: {
      style: 'stroke-dasharray: 2',
      class: 'stroke-1'
    }
  } satisfies AreaChartPropsObjProp;

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
  class="area-chart lg:bg-background/50 bg-secondary relative rounded-lg px-4 pt-2 pb-6 lg:p-6"
>
  <div class="mb-4 flex flex-row items-center justify-start gap-2 font-bold">
    <span>{title}</span>
    <span
      class="bg-background/90 text-muted-foreground rounded-full border px-2 py-0.5 text-[11px] font-medium shadow-sm"
    >
      Avg: {formattedAverage}
    </span>
  </div>
  {#if loading}
    <div class="flex h-50 flex-col justify-end space-y-2">
      <div class="flex h-full items-end justify-between gap-2">
        {#each [40, 65, 45, 80, 55, 70, 50, 85, 60, 75] as height, i (i)}
          <Skeleton class="w-full rounded-t" style="height: {height}%" />
        {/each}
      </div>
      <Skeleton class="h-4 w-full" />
    </div>
  {:else if chartData.length != 0}
    <Chart.Container config={chartConfig}>
      <AreaChart
        data={chartDataWithAverage}
        x="x"
        xScale={scaleUtc()}
        points={{
          r: 0
        }}
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
        axis={'x'}
        props={chartProps}
      >
        {#snippet tooltip()}
          <Chart.Tooltip labelFormatter={xFormatter} indicator="line">
            {#snippet formatter({ value, name, _ })}
              {@const formattedValue =
                typeof value === 'number' ? (valueFormatter?.(value) ?? value.toFixed(2)) : value}
              <span class="text-muted-foreground">{name}</span>
              <span class="font-mono font-medium tabular-nums">{formattedValue}</span>
            {/snippet}
          </Chart.Tooltip>
        {/snippet}
        {#snippet marks({ series, getAreaProps }: any)}
          {#each series as s, i (s.key)}
            {#if s.key === 'y'}
              <LinearGradient
                stops={[s.color ?? '', 'color-mix(in lch, ' + s.color + ' 10%, transparent)']}
                vertical
              >
                {#snippet children({ gradient })}
                  <Area {...getAreaProps(s, i)} fill={gradient} />
                {/snippet}
              </LinearGradient>
            {:else}
              <Area
                {...getAreaProps(s, i)}
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
