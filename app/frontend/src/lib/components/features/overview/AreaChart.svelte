<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { scaleUtc } from 'd3-scale';
	import { curveCatmullRom } from 'd3-shape';
	import { Area, AreaChart, LinearGradient, type AreaChartPropsObjProp } from 'layerchart';
	import type { DataPoint } from '$lib/types';
	import LabelWithIcon from '$lib/components/ui/app/LabelWithIcon.svelte';
	import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';

	let {
		chartData,
		color = 'var(--primary)',
		label,
		title,
		xFormatter,
		yFormatter
	}: {
		chartData: DataPoint[];
		color?: string;
		label: string;
		title: string;
		xFormatter: (v: Date) => string;
		yFormatter: (v: number) => string;
	} = $props();

	const chartProps = {
		area: {
			curve: curveCatmullRom,
			'fill-opacity': 0.4,
			line: { class: 'stroke-2' },
			motion: 'tween'
		},
		xAxis: {
			format: xFormatter,
			tickLabelProps: {
				rotate: 325,
				textAnchor: 'end'
			}
		},
		// yAxis: {
		// 	format: yFormatter
		// },
		grid: {
			style: 'stroke-dasharray: 2',
			class: 'stroke-1'
		}
	} satisfies AreaChartPropsObjProp;

	const chartConfig = {
		data: {
			color,
			label
		}
	} satisfies Chart.ChartConfig;
</script>

<div class="bg-background/50 rounded-lg px-4 pt-2 pb-6 lg:p-6">
	<div class="mb-4 flex flex-row justify-start font-bold">{title}</div>
	{#if chartData.length != 0}
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
					<Chart.Tooltip labelFormatter={xFormatter} indicator="line" valueFormatter={yFormatter} />
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
