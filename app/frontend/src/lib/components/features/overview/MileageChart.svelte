<script lang="ts">
	import { env } from '$env/dynamic/public';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { formatDate } from '$helper/formatting';
	import { scaleBand, scaleUtc } from 'd3-scale';
	import { curveNatural } from 'd3-shape';
	import { LineChart, Spline } from 'layerchart';

	let { vehicleId } = $props();

	let chartData: {
		date: Date | string;
		mileage: number | null;
	}[] = $state([]);

	const chartConfig = {
		mileage: {
			label: 'Mileage',
			color: '#2563eb'
		}
	} satisfies Chart.ChartConfig;

	async function fetchChartData() {
		try {
			const response = await fetch(
				`${env.PUBLIC_API_BASE_URL || ''}/api/vehicles/${vehicleId}/fuel-logs`,
				{
					headers: {
						'X-User-PIN': localStorage.getItem('userPin') || ''
					}
				}
			);
			if (response.ok) {
				const data = await response.json();
				chartData = data.map((log: any) => {
					return {
						date: new Date(log.date),
						mileage: log.mileage
					};
				});
			} else {
				console.error('Failed to fetch chart data');
			}
		} catch (e) {
			console.error('Failed to connect to the server.', e);
		}
	}
	$effect(() => {
		if (vehicleId) {
			fetchChartData();
		}
	});
</script>

<Chart.Container config={chartConfig} class="min-h-[200px] w-1/2">
	<LineChart
		data={chartData}
		x="date"
		axis="x"
		series={[
			{
				key: 'mileage',
				label: 'Mileage',
				color: chartConfig.mileage.color
			}
		]}
		props={{
			spline: { curve: curveNatural, motion: 'tween', strokeWidth: 2 },
			highlight: {
				points: {
					motion: 'none',
					r: 6
				}
			}
			// xAxis: {
			// 	format: (v: Date) => v.toLocaleDateString('en-US', { month: 'short' })
			// }
		}}
		xScale={scaleBand()}
		y="mileage"
	>
		{#snippet belowMarks({ series })}
			{#each series as s}
				<Spline
					data={chartData.filter((d: any) => d.mileage !== null)}
					y={s.value}
					class="[stroke-dasharray:3,3]"
					stroke={s.color}
				/>
			{/each}
		{/snippet}
		{#snippet tooltip()}
			<Chart.Tooltip hideLabel />
		{/snippet}
	</LineChart>
</Chart.Container>
