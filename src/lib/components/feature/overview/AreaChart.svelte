<script lang="ts">
	import * as Chart from '$ui/chart/index.js';
	import { scaleUtc } from 'd3-scale';
	import { curveCatmullRom } from 'd3-shape';
	import { Area, AreaChart, LinearGradient, type AreaChartPropsObjProp } from 'layerchart';
	import type { DataPoint } from '$lib/domain';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	let {
		chartData,
		color = 'var(--primary)',
		label,
		title,
		xFormatter,
		loading = false
	}: {
		chartData: DataPoint[];
		color?: string;
		label: string;
		title: string;
		xFormatter: (_: Date) => string;
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
</script>

<div
	id="chart-area-{title}"
	class="area-chart lg:bg-background/50 bg-secondary rounded-lg px-4 pt-2 pb-6 lg:p-6"
>
	<div class="mb-4 flex flex-row justify-start font-bold">{title}</div>
	{#if loading}
		<div class="flex h-[200px] flex-col justify-end space-y-2">
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
				data={chartData}
				x="x"
				xScale={scaleUtc()}
				points={{
					r: 3
				}}
				series={[
					{
						key: 'y',
						label: chartConfig.data.label,
						color: chartConfig.data.color
					}
				]}
				seriesLayout="stack"
				axis={'x'}
				props={chartProps}
			>
				{#snippet tooltip()}
					<Chart.Tooltip labelFormatter={xFormatter} indicator="line" />
				{/snippet}
				{#snippet marks({ series, getAreaProps })}
					{#each series as s, i (s.key)}
						<LinearGradient
							stops={[s.color ?? '', 'color-mix(in lch, ' + s.color + ' 10%, transparent)']}
							vertical
						>
							{#snippet children({ gradient })}
								<Area {...getAreaProps(s, i)} fill={gradient} />
							{/snippet}
						</LinearGradient>
					{/each}
				{/snippet}
			</AreaChart>
		</Chart.Container>
	{:else}
		<div class="flex h-full flex-col items-center justify-center">
			<LabelWithIcon icon={CircleSlash2} iconClass="h-4 w-4" label={`No data avaialble`} />
		</div>
	{/if}
</div>
