<script lang="ts">
	import { onMount } from 'svelte';
	import { Jumper } from 'svelte-loading-spinners';
	import { getApiUrl } from '$helper/api';
	import { type FuelLog } from '$lib/types/fuel';
	import { createRawSnippet } from 'svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { formatCurrency, formatDate, formatDistance, formatVolume } from '$lib/helper/formatting';
	import FuelLogContextMenu from './FuelLogContextMenu.svelte';
	import {
		Banknote,
		Calendar1,
		CircleGauge,
		Fuel,
		Notebook,
		PaintBucket,
		SquircleDashed
	} from '@lucide/svelte/icons';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
	import LabelWithIcon from '$lib/components/ui/app/LabelWithIcon.svelte';
	import AppTable from '$lib/components/layout/AppTable.svelte';

	const { vehicleId } = $props();

	let fuelLogs: FuelLog[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	const columns: ColumnDef<FuelLog>[] = [
		{
			accessorKey: 'date',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: Calendar1,
					iconClass: 'h-4 w-4',
					label: 'Date',
					style: 'justify-start'
				}),
			cell: ({ row }) => {
				const dateCellSnippet = createRawSnippet<[string]>((date) => {
					return {
						render: () => `<div class="flex flex-row justify-start">${formatDate(date())}</div>`
					};
				});
				return renderSnippet(dateCellSnippet, row.getValue('date'));
			}
		},
		{
			accessorKey: 'odometer',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: CircleGauge,
					iconClass: 'h-4 w-4 ',
					label: 'Odometer',
					style: 'justify-center'
				}),
			cell: ({ row }) => {
				const odometerCellSnippet = createRawSnippet<[number]>((getOdometer) => {
					const odometer = getOdometer();
					return {
						render: () =>
							`<div class="flex flex-row justify-center">${formatDistance(odometer)}</div>`
					};
				});

				return renderSnippet(odometerCellSnippet, row.getValue('odometer'));
			}
		},
		{
			accessorKey: 'filled',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: Fuel,
					iconClass: 'h-4 w-4',
					label: 'Filled',
					style: 'justify-center'
				}),
			cell: ({ row }) => renderSnippet(badge, row.getValue('filled'))
		},
		{
			accessorKey: 'missedLast',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: SquircleDashed,
					iconClass: 'h-4 w-4',
					label: 'Missed Last',
					style: 'justify-center'
				}),
			cell: ({ row }) => renderSnippet(badge, row.getValue('missedLast'))
		},
		{
			accessorKey: 'fuelAmount',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: PaintBucket,
					iconClass: 'h-4 w-4 ',
					label: 'Fuel Amount',
					style: 'justify-center'
				}),
			cell: ({ row }) => {
				const fuelAmountCellSnippet = createRawSnippet<[number]>((fuelAmount) => {
					return {
						render: () =>
							`<div class="flex flex-row justify-center">${formatVolume(fuelAmount())}</div>`
					};
				});
				return renderSnippet(fuelAmountCellSnippet, row.getValue('fuelAmount'));
			}
		},
		{
			accessorKey: 'cost',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: Banknote,
					iconClass: 'h-4 w-4 ',
					label: 'Cost',
					style: 'justify-start'
				}),
			cell: ({ row }) => {
				const costCellSnippet = createRawSnippet<[number]>((cost) => {
					return {
						render: () => `<div class="flex flex-row justify-start">${formatCurrency(cost())}</div>`
					};
				});

				return renderSnippet(costCellSnippet, row.getValue('cost'));
			}
		},
		{
			accessorKey: 'notes',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: Notebook,
					iconClass: 'h-4 w-4',
					label: 'Notes',
					style: 'justify-start'
				}),
			cell: ({ row }) => {
				const noteSnippet = createRawSnippet<[string]>((note) => {
					return {
						render: () => `<div class="flex flex-row justify-start">${note() || '-'}</div>`
					};
				});
				return renderSnippet(noteSnippet, row.getValue('notes'));
			}
		},
		{
			id: 'actions',
			cell: ({ row }) =>
				renderComponent(FuelLogContextMenu, {
					fuelLog: row.original,
					onaction: () => {
						fetchFuelLogs();
					}
				})
		}
	];

	$effect(() => {
		if (!vehicleId) {
			error = 'Vehicle ID is required.';
			loading = false;
		} else {
			fetchFuelLogs();
		}
	});

	async function fetchFuelLogs() {
		loading = true;
		error = '';
		try {
			const response = await fetch(getApiUrl(`/api/vehicles/${vehicleId}/fuel-logs`), {
				headers: {
					'X-User-PIN': localStorage.getItem('userPin') || ''
				}
			});
			if (response.ok) {
				fuelLogs = await response.json();
			} else {
				const data = await response.json();
				error = data.message || 'Failed to fetch fuel logs.';
			}
		} catch (e) {
			console.error('Failed to connect to the server.', e);
			error = 'Failed to connect to the server.';
		}
		loading = false;
	}

	onMount(() => {
		fetchFuelLogs();
	});
</script>

{#if loading}
	<p class="flex items-center justify-center gap-5 text-lg">
		<Jumper size="100" color="#155dfc" unit="px" duration="2s" />
	</p>
{:else if error}
	<p class="text-red-500">Error: {error}</p>
{:else if fuelLogs.length === 0}
	<p>No fuel refill logs found for this vehicle.</p>
{:else}
	<AppTable data={fuelLogs} {columns} />
{/if}

{#snippet badge(status: boolean)}
	<div class="flex flex-row justify-center">
		<Badge variant="outline"><span>{status ? 'Yes' : 'No'}</span></Badge>
	</div>
{/snippet}
