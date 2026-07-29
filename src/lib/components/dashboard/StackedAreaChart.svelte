<script lang="ts">
  import * as Chart from '$ui/chart/index.js';
  import { scaleUtc } from 'd3-scale';
  import { curveCatmullRom } from 'd3-shape';
  import { AreaChart, type AreaChartProps } from 'layerchart';
  import type { MonthlyExpensePoint } from '$lib/domain/dashboard';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

  let {
    data,
    title,
    loading = false,
    bare = false
  }: {
    data: MonthlyExpensePoint[];
    title: string;
    loading?: boolean;
    /** Render content only — surrounding card chrome is provided by the parent. */
    bare?: boolean;
  } = $props();

  const SERIES = [
    { key: 'fuel', label: 'Fuel', color: 'var(--chart-1)' },
    { key: 'maintenance', label: 'Maintenance', color: 'var(--chart-2)' },
    { key: 'insurance', label: 'Insurance', color: 'var(--chart-3)' }
  ] as const;

  const chartData = $derived(data.map((point) => ({ ...point, x: new Date(`${point.month}-01`) })));

  const hasData = $derived(data.some((point) => point.total > 0));

  const chartProps = {
    area: {
      curve: curveCatmullRom,
      'fill-opacity': 0.65,
      line: { class: 'stroke-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]' },
      motion: 'tween'
    },
    xAxis: {
      format: (v: Date) => v.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      tickLabelProps: {
        rotate: 325,
        textAnchor: 'end'
      }
    },
    grid: {
      style: 'stroke-dasharray: 2',
      class: 'stroke-1'
    }
  } satisfies AreaChartProps<unknown>['props'];

  const chartConfig = $derived(
    Object.fromEntries(
      SERIES.map((s) => [s.key, { label: s.label, color: s.color }])
    ) satisfies Chart.ChartConfig
  );
</script>

<div
  id="stacked-chart-{title}"
  class={bare
    ? 'area-chart relative flex h-full flex-col'
    : 'area-chart lg:bg-background/50 bg-secondary relative rounded-lg px-4 pt-2 pb-6 lg:p-6'}
>
  {#if !bare}
    <div class="mb-4 font-bold">
      <span>{title}</span>
    </div>
  {/if}
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
    <Chart.Container config={chartConfig} class={bare ? 'aspect-auto min-h-0 w-full flex-1' : ''}>
      <AreaChart
        data={chartData}
        x="x"
        xScale={scaleUtc()}
        points={{ r: 0 }}
        series={SERIES.map((s) => ({ key: s.key, label: s.label, color: s.color }))}
        seriesLayout="stack"
        axis={'x'}
        props={chartProps}
      >
        {#snippet tooltip()}
          <Chart.Tooltip
            labelFormatter={(v: Date) =>
              v.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            indicator="dot"
          >
            {#snippet formatter({ value, name })}
              <span class="text-muted-foreground">{name}</span>
              <span class="font-mono font-medium tabular-nums">
                {typeof value === 'number' ? value.toFixed(2) : value}
              </span>
            {/snippet}
          </Chart.Tooltip>
        {/snippet}
      </AreaChart>
    </Chart.Container>
  {:else}
    <div class="flex h-full flex-col items-center justify-center">
      <LabelWithIcon icon={CircleSlash2} iconClass="h-4 w-4" label="No expense data yet" />
    </div>
  {/if}
</div>
