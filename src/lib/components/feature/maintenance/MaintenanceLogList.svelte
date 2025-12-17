<script lang="ts">
	import { formatCurrency, formatDate, formatDistance } from '$lib/helper/format.helper';
	import Banknote from '@lucide/svelte/icons/banknote';
	import Calendar1 from '@lucide/svelte/icons/calendar-1';
	import CircleGauge from '@lucide/svelte/icons/circle-gauge';
	import Notebook from '@lucide/svelte/icons/notebook';
	import Wrench from '@lucide/svelte/icons/wrench';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import AttachmentLink from '$lib/components/app/AttachmentLink.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import AppTable from '$layout/AppTable.svelte';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent, renderSnippet } from '$ui/data-table';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import MaintenanceContextMenu from './MaintenanceContextMenu.svelte';
	import type { MaintenanceLog } from '$lib/domain/maintenance';
	import { maintenanceStore } from '$stores/maintenance.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';

	const columns: ColumnDef<MaintenanceLog>[] = [
		{
			accessorKey: 'date',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: Calendar1,
					iconClass: 'h-4 w-4',
					label: 'Date',
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
					label: 'Odometer',
					style: 'justify-center'
				}),
			cell: ({ row }) => renderSnippet(odometerCell, { value: row.getValue('odometer') })
		},
		{
			accessorKey: 'serviceCenter',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: Wrench,
					iconClass: 'h-4 w-4',
					label: 'Service Center',
					style: 'justify-start'
				}),
			cell: ({ row }) => renderSnippet(serviceCenterCell, { value: row.getValue('serviceCenter') })
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
			cell: ({ row }) => renderSnippet(costCell, { value: row.getValue('cost') })
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
			cell: ({ row }) => renderSnippet(notesCell, { value: row.getValue('notes') })
		},
		{
			accessorKey: 'attachment',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: Paperclip,
					iconClass: 'h-4 w-4',
					label: 'Attachment',
					style: 'justify-center'
				}),
			cell: ({ row }) => renderSnippet(attachmentCell, { value: row.getValue('attachment') })
		},
		{
			id: 'actions',
			cell: ({ row }) =>
				renderComponent(MaintenanceContextMenu, {
					maintenanceLog: row.original,
					onaction: () => {
						maintenanceStore.refreshMaintenanceLogs();
					}
				})
		}
	];

	$effect(() => {
		if (vehicleStore.selectedId) maintenanceStore.refreshMaintenanceLogs();
	});
</script>

{#if maintenanceStore.processing}
	<div class="space-y-3">
		<Skeleton class="h-12 w-full rounded-md" />
		<Skeleton class="h-12 w-full rounded-md" />
		<Skeleton class="h-12 w-full rounded-md" />
		<Skeleton class="h-12 w-full rounded-md" />
		<Skeleton class="h-12 w-full rounded-md" />
	</div>
{:else if maintenanceStore.error}
	<p class="text-red-500">Error: {maintenanceStore.error}</p>
{:else if maintenanceStore.maintenanceLogs?.length === 0}
	<LabelWithIcon
		icon={CircleSlash2}
		iconClass="h-5 w-5"
		style="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center"
		label="No Maintenance Logs found for this vehicle."
	/>
{:else}
	<AppTable data={maintenanceStore.maintenanceLogs || []} {columns} />
{/if}

{#snippet dateCell(params: any)}
	<div class="flex flex-row justify-start">{formatDate(params.value)}</div>
{/snippet}

{#snippet odometerCell(params: any)}
	<div class="flex flex-row justify-center">{formatDistance(params.value)}</div>
{/snippet}

{#snippet serviceCenterCell(params: any)}
	<div class="flex flex-row justify-start">{params.value}</div>
{/snippet}

{#snippet costCell(params: any)}
	<div class="flex flex-row justify-start">{formatCurrency(params.value)}</div>
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
