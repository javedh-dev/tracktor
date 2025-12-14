<script lang="ts">
	import { formatCurrency, formatDate, formatDistance } from '$lib/helper/format.helper';
	import Banknote from '@lucide/svelte/icons/banknote';
	import Calendar1 from '@lucide/svelte/icons/calendar-1';
	import CircleGauge from '@lucide/svelte/icons/circle-gauge';
	import Notebook from '@lucide/svelte/icons/notebook';
	import Wrench from '@lucide/svelte/icons/wrench';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import FileText from '@lucide/svelte/icons/file-text';
	import Image from '@lucide/svelte/icons/image';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { Jumper } from 'svelte-loading-spinners';
	import AppTable from '$layout/AppTable.svelte';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent, renderSnippet } from '$ui/data-table';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import MaintenanceContextMenu from './MaintenanceContextMenu.svelte';
	import type { MaintenanceLog } from '$lib/domain/maintenance';
	import { maintenanceStore } from '$stores/maintenance.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';

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
	<p class="flex items-center justify-center gap-5 text-lg text-gray-500 dark:text-gray-400">
		<Jumper size="100" color="#155dfc" unit="px" duration="2s" />
	</p>
{:else if maintenanceStore.error}
	<p class="text-red-500">Error: {maintenanceStore.error}</p>
{:else if maintenanceStore.maintenanceLogs?.length === 0}
	<div>No maintenance logs for this vehicle.</div>
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
			{@const isPdf = fileName.toLowerCase().endsWith('.pdf')}
			{@const Icon = isPdf ? FileText : Image}
			<a
				href="/api/files/{fileName}"
				target="_blank"
				rel="noopener noreferrer"
				class="text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
				title="View attachment"
			>
				<Icon class="h-4 w-4" />
				<ExternalLink class="h-3 w-3" />
			</a>
		{:else}
			<span class="text-muted-foreground">-</span>
		{/if}
	</div>
{/snippet}
