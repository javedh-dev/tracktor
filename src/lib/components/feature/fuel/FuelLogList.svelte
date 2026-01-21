<script lang="ts">
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { type FuelLog } from '$lib/domain/fuel';

	import Badge from '$ui/badge/badge.svelte';
	import {
		formatCurrency,
		formatDate,
		formatDistance,
		formatFuel,
		getMileageUnit
	} from '$lib/helper/format.helper';
	import FuelLogContextMenu from './FuelLogContextMenu.svelte';
	import Banknote from '@lucide/svelte/icons/banknote';
	import Rabbit from '@lucide/svelte/icons/rabbit';
	import Calendar1 from '@lucide/svelte/icons/calendar-1';
	import CircleGauge from '@lucide/svelte/icons/circle-gauge';
	import Fuel from '@lucide/svelte/icons/fuel';
	import Notebook from '@lucide/svelte/icons/notebook';
	import PaintBucket from '@lucide/svelte/icons/paint-bucket';
	import SquircleDashed from '@lucide/svelte/icons/squircle-dashed';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import AttachmentLink from '$lib/components/app/AttachmentLink.svelte';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent, renderSnippet } from '$ui/data-table';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import AppTable from '$layout/AppTable.svelte';

	import { fuelLogStore } from '$stores/fuel-log.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';
	import {
		col_date,
		col_odometer,
		col_filled,
		col_missed_last,
		col_cost,
		col_mileage,
		col_notes,
		col_attachment,
		fuel_volume_label_energy,
		fuel_volume_label_fuel,
		fuel_empty_list,
		common_yes,
		common_no
	} from '$lib/paraglide/messages/_index.js';

	// Get the selected vehicle to determine fuel type and units
	const selectedVehicle = $derived(
		vehicleStore.vehicles?.find((v) => v.id === vehicleStore.selectedId)
	);
	// const fuelUnit = $derived(selectedVehicle?.fuelType ? FUEL_UNITS[selectedVehicle.fuelType] : 'L');
	const volumeLabel = $derived(
		selectedVehicle?.fuelType === 'electric' ? fuel_volume_label_energy() : fuel_volume_label_fuel()
	);

	const columns: ColumnDef<FuelLog>[] = [
		{
			accessorKey: 'date',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: Calendar1,
					iconClass: 'h-4 w-4',
					label: col_date(),
					style: 'justify-start'
				}),
			cell: ({ row }) => renderSnippet(dateCell, { value: row.getValue('date') })
		},
		{
			accessorKey: 'odometer',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: CircleGauge,
					iconClass: 'h-4 w-4 ',
					label: col_odometer(),
					style: 'justify-center'
				}),
			cell: ({ row }) => renderSnippet(odometerCell, { value: row.getValue('odometer') })
		},
		{
			accessorKey: 'filled',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: Fuel,
					iconClass: 'h-4 w-4',
					label: col_filled(),
					style: 'justify-center'
				}),
			cell: ({ row }) => renderSnippet(badge, { value: row.getValue('filled') })
		},
		{
			accessorKey: 'missedLast',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: SquircleDashed,
					iconClass: 'h-4 w-4',
					label: col_missed_last(),
					style: 'justify-center'
				}),
			cell: ({ row }) => renderSnippet(badge, { value: row.getValue('missedLast') })
		},
		{
			accessorKey: 'fuelAmount',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: PaintBucket,
					iconClass: 'h-4 w-4 ',
					label: volumeLabel,
					style: 'justify-center'
				}),
			cell: ({ row }) =>
				renderSnippet(fuelAmountCell, {
					amount: row.getValue('fuelAmount'),
					fuelType: selectedVehicle?.fuelType
				})
		},
		{
			accessorKey: 'cost',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: Banknote,
					iconClass: 'h-4 w-4 ',
					label: col_cost(),
					style: 'justify-start'
				}),
			cell: ({ row }) => renderSnippet(costCell, { value: row.getValue('cost') })
		},
		{
			accessorKey: 'mileage',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: Rabbit,
					iconClass: 'h-4 w-4 ',
					label: col_mileage(),
					style: 'justify-center'
				}),
			cell: ({ row }) =>
				renderSnippet(mileageCell, {
					mileage: row.getValue('mileage'),
					fuelType: selectedVehicle?.fuelType
				})
		},
		{
			accessorKey: 'notes',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: Notebook,
					iconClass: 'h-4 w-4',
					label: col_notes(),
					style: 'justify-start'
				}),
			cell: ({ row }) => renderSnippet(notesCell, { value: row.getValue('notes') })
		},
		{
			accessorKey: 'attachment',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: Paperclip,
					iconClass: 'h-4 w-4',
					label: col_attachment(),
					style: 'justify-center'
				}),
			cell: ({ row }) => renderSnippet(attachmentCell, { value: row.getValue('attachment') })
		},
		{
			id: 'actions',
			cell: ({ row }) =>
				renderComponent(FuelLogContextMenu, {
					fuelLog: row.original,
					onaction: () => {
						fuelLogStore.refreshFuelLogs();
					}
				})
		}
	];

	$effect(() => {
		if (vehicleStore.selectedId) fuelLogStore.refreshFuelLogs();
	});
</script>

{#if fuelLogStore.processing}
	<div id="fuel-log-list-skeleton" class="space-y-3">
		<Skeleton class="h-12 w-full rounded-md" />
		<Skeleton class="h-12 w-full rounded-md" />
		<Skeleton class="h-12 w-full rounded-md" />
		<Skeleton class="h-12 w-full rounded-md" />
		<Skeleton class="h-12 w-full rounded-md" />
	</div>
{:else if fuelLogStore.error}
	<p class="text-red-500">Error: {fuelLogStore.error}</p>
{:else if fuelLogStore.fuelLogs?.length === 0}
	<LabelWithIcon
		icon={CircleSlash2}
		iconClass="h-5 w-5"
		style="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center"
		label={fuel_empty_list()}
	/>
{:else}
	<AppTable data={fuelLogStore.fuelLogs || []} {columns} />
{/if}

{#snippet badge(params: any)}
	<div class="flex flex-row justify-center">
		<Badge variant="outline"><span>{params.value ? common_yes() : common_no()}</span></Badge>
	</div>
{/snippet}

{#snippet dateCell(params: any)}
	<div class="flex flex-row justify-start">{formatDate(params.value)}</div>
{/snippet}

{#snippet odometerCell(params: any)}
	<div class="flex flex-row justify-center">
		{params.value !== null && params.value !== undefined ? formatDistance(params.value) : '-'}
	</div>
{/snippet}

{#snippet fuelAmountCell(params: any)}
	<div class="flex flex-row justify-center">
		{params.amount !== null && params.amount !== undefined
			? formatFuel(params.amount, params.fuelType as string)
			: '-'}
	</div>
{/snippet}

{#snippet costCell(params: any)}
	<div class="flex flex-row justify-start">{formatCurrency(params.value)}</div>
{/snippet}

{#snippet mileageCell(params: any)}
	{@const unit = getMileageUnit(params.fuelType as string)}
	{@const isValidNumber =
		params.mileage != null && typeof params.mileage === 'number' && !isNaN(params.mileage)}
	<div class="flex flex-row justify-center">
		{!isValidNumber ? '-' : `${params.mileage.toFixed(2)} ${unit}`}
	</div>
{/snippet}

{#snippet notesCell(params: any)}
	<div class="flex flex-row justify-start">{params.value || '-'}</div>
{/snippet}

{#snippet attachmentCell(params: any)}
	<div class="flex flex-row justify-center">
		{#if params.value}
			{@const fileName = params.value}
			<AttachmentLink {fileName} />
		{:else}
			<span class="text-muted-foreground">-</span>
		{/if}
	</div>
{/snippet}
