<script lang="ts">
	import { t } from '$lib/stores/i18n';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { Pencil, Trash2 } from '@lucide/svelte';
	import { darkModeStore } from '$lib/stores/dark-mode';
	import { Chart, registerables, type ChartOptions } from 'chart.js';
	import {
		formatCurrency,
		formatDate,
		formatVolume,
		formatMileage,
		formatDistance,
		getCurrencySymbol,
		getMileageUnit
	} from '$lib/utils/formatting';

	import { fuelLogModelStore } from '$lib/stores/fuel-log';
	import ChartCard from './ChartCard.svelte';
	import { Line } from 'svelte5-chartjs';
	import { Jumper } from 'svelte-loading-spinners';

	const { vehicleId } = $props();

	$effect(() => {
		Chart.register(...registerables);
	});

	let fuelCostData: any = $state({});
	let mileageData: any = $state({});
	let loading = $state(true);
	let error = $state('');
	let chartOptions = $state({});

	const generateChartOptions = (isDarkMode: boolean): ChartOptions => {
		return {
			responsive: true,
			plugins: {
				legend: {
					labels: {
						color: isDarkMode ? '#e5e7eb' : '#374151' // Tailwind gray-200 or gray-700
					}
				}
			},
			scales: {
				x: {
					ticks: { textStrokeColor: isDarkMode ? '#e5e7eb' : '#374151' },
					grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)' }
				},
				y: {
					ticks: { textStrokeColor: isDarkMode ? '#e5e7eb' : '#374151' },
					grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)' }
				}
			}
		};
	};

	darkModeStore.subscribe((isDarkMode) => {
		chartOptions = generateChartOptions(isDarkMode);
		fetchChartData();
	});

	async function fetchChartData() {
		try {
			const response = await fetch(
				`${env.PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/vehicles/${vehicleId}/fuel-logs`,
				{
					headers: {
						'X-User-PIN': localStorage.getItem('userPin') || ''
					}
				}
			);
			if (response.ok) {
				const data = await response.json();
				const labels = data.map((log: any) => formatDate(log.date));
				const costData = data.map((log: any) => log.cost);
				// Calculate Cumulative cost
				for (let i = 1; i < costData.length; i++) {
					costData[i] += costData[i - 1];
				}
				const mileageDataPoints = data.map((log: any) => log.mileage);

				fuelCostData = {
					labels,
					datasets: [
						{
							label: `Total Fuel Cost (${getCurrencySymbol()})`,
							data: costData,
							fill: true,
							borderColor: 'rgb(75, 192, 192)',
							tension: 0.3,
							borderWidth: 2,
							borderCapStyle: 'round',
							pointStyle: 'circle',
							pointRadius: 2
						}
					]
				};

				mileageData = {
					labels,
					datasets: [
						{
							label: `Mileage (${getMileageUnit()})`,
							data: mileageDataPoints,
							borderColor: 'rgb(255, 99, 132)',
							fill: true,
							tension: 0.3,
							borderWidth: 2,
							borderCapStyle: 'round',
							pointStyle: 'circle',
							pointRadius: 2
						}
					]
				};
			} else {
				console.error('Failed to fetch chart data');
			}
		} catch (e) {
			console.error('Failed to connect to the server.');
		} finally {
			loading = false;
		}
	}
	$effect(() => {
		if (vehicleId) {
			fetchChartData();
		}
	});
</script>

{#if loading}
	<p class="flex items-center justify-center gap-5 text-lg text-gray-500 dark:text-gray-400">
		<Jumper size="100" color="#155dfc" unit="px" duration="2s" />
	</p>
{:else if error}
	<p class="text-red-500">Error: {error}</p>
{:else if fuelCostData?.datasets?.length === 0 && mileageData?.datasets?.length === 0}
	<p>{$t('dashboard.noDataAvailable')}</p>
{:else}
	<div class="overflow-x-auto">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
			<ChartCard
				title={$t('dashboard.fuelCostOverTime')}
				chartData={fuelCostData}
				ChartComponent={Line}
				options={chartOptions}
			/>
			<ChartCard
				title={$t('dashboard.mileageOverTime')}
				chartData={mileageData}
				ChartComponent={Line}
				options={chartOptions}
			/>
		</div>
	</div>
{/if}
