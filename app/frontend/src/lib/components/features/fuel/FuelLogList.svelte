<script lang="ts">
	import { Jumper } from 'svelte-loading-spinners';
	import { type FuelLog } from '$lib/types/fuel';
	import { createRawSnippet } from 'svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import {
		formatCurrency,
		formatDate,
		formatDistance,
		formatMileage,
		formatVolume
	} from '$lib/helper/formatting';
	import FuelLogContextMenu from './FuelLogContextMenu.svelte';
	import Banknote from '@lucide/svelte/icons/banknote';
	import Rabbit from '@lucide/svelte/icons/rabbit';
	import Calendar1 from '@lucide/svelte/icons/calendar-1';
	import CircleGauge from '@lucide/svelte/icons/circle-gauge';
	import Fuel from '@lucide/svelte/icons/fuel';
	import Notebook from '@lucide/svelte/icons/notebook';
	import PaintBucket from '@lucide/svelte/icons/paint-bucket';
	import SquircleDashed from '@lucide/svelte/icons/squircle-dashed';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
	import LabelWithIcon from '$lib/components/app/LabelWithIcon.svelte';
	import AppTable from '$lib/components/layout/AppTable.svelte';

	import { fuelLogStore } from '$lib/stores/fuelLogStore';

	const { vehicleId } = $props();

	let fuelLogs: FuelLog[] = $state([]);
	let loading = $state(true);
	let error = $state<string>();

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
			accessorKey: 'mileage',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: Rabbit,
					iconClass: 'h-4 w-4 ',
					label: 'Mileage',
					style: 'justify-center'
				}),
			cell: ({ row }) => {
				const costCellSnippet = createRawSnippet<[number]>((mileage) => {
					return {
						render: () =>
							`<div class="flex flex-row justify-center">
							${!mileage() ? '-' : formatMileage(mileage())}
							</div>`
					};
				});

				return renderSnippet(costCellSnippet, row.getValue('mileage'));
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
						fuelLogStore.refreshFuelLogs(row.original.vehicleId);
					}
				})
		}
	];

	fuelLogStore.subscribe((data) => {
		fuelLogs = data.fuelLogs;
		loading = data.processing;
		error = data.error;
	});

	$effect(() => {
		fuelLogStore.refreshFuelLogs(vehicleId);
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
