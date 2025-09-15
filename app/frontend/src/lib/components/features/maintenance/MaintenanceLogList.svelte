<script lang="ts">
	import { createRawSnippet, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import { formatCurrency, formatDate, formatDistance } from '$helper/formatting';
	import { Banknote, Calendar1, CircleGauge, Notebook, Trash2, Wrench } from '@lucide/svelte/icons';
	import { Jumper } from 'svelte-loading-spinners';
	import IconButton from '$appui/IconButton.svelte';
	import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
	import { getApiUrl } from '$helper/api';
	import AppTable from '$lib/components/layout/AppTable.svelte';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
	import LabelWithIcon from '$lib/components/ui/app/LabelWithIcon.svelte';
	import MaintenanceContextMenu from './MaintenanceContextMenu.svelte';
	import type { MaintenanceLog } from '$lib/types/maintenance';

	let { vehicleId } = $props();

	let maintenanceLogs: MaintenanceLog[] = $state([]);
	let loading = $state(false);
	let error = $state('');
	let selectedMaintenanceLog = $state<string>();
	let deleteDialog = $state(false);

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
			accessorKey: 'serviceCenter',
			header: () =>
				renderComponent(LabelWithIcon, {
					icon: Wrench,
					iconClass: 'h-4 w-4',
					label: 'Service Center',
					style: 'justify-start'
				}),
			cell: ({ row }) => {
				const odometerCellSnippet = createRawSnippet<[number]>((serviceCenter) => {
					return {
						render: () => `<div class="flex flex-row justify-start">${serviceCenter()}</div>`
					};
				});

				return renderSnippet(odometerCellSnippet, row.getValue('serviceCenter'));
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
				renderComponent(MaintenanceContextMenu, {
					maintenanceLog: row.original,
					onaction: () => {
						fetchMaintenanceLogs();
					}
				})
		}
	];

	$effect(() => {
		if (!vehicleId) {
			error = 'Vehicle ID is required.';
			loading = false;
		} else {
			fetchMaintenanceLogs();
		}
	});

	async function fetchMaintenanceLogs() {
		if (!vehicleId) {
			maintenanceLogs = [];
			return;
		}
		loading = true;
		error = '';
		try {
			const response = await fetch(getApiUrl(`/api/vehicles/${vehicleId}/maintenance-logs`), {
				headers: {
					'X-User-PIN': browser ? localStorage.getItem('userPin') || '' : ''
				}
			});
			if (response.ok) {
				const data = await response.json();
				maintenanceLogs = data;
			} else {
				error = 'Failed to fetch maintenance logs.';
			}
		} catch (e) {
			console.error(e);
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function deleteMaintenenceLog(logId: string | undefined) {
		if (!logId) {
			return;
		}
		try {
			const response = await fetch(
				`${env.PUBLIC_API_BASE_URL || ''}/api/vehicles/${vehicleId}/maintenance-logs/${logId}`,
				{
					method: 'DELETE',
					headers: {
						'X-User-PIN': browser ? localStorage.getItem('userPin') || '' : ''
					}
				}
			);
			if (response.ok) {
				await fetchMaintenanceLogs();
			} else {
				const data = await response.json();
				error = data.message || 'Failed to delete maintenance log.';
			}
		} catch (e) {
			console.error(e);
			error = 'Network error. Failed to delete maintenance log.';
		}
	}

	onMount(() => {
		fetchMaintenanceLogs();
	});
</script>

{#if loading}
	<p class="flex items-center justify-center gap-5 text-lg text-gray-500 dark:text-gray-400">
		<Jumper size="100" color="#155dfc" unit="px" duration="2s" />
	</p>
{:else if error}
	<p class="text-red-500">Error: {error}</p>
{:else if maintenanceLogs.length === 0}
	<div>No maintenance logs for this vehicle.</div>
{:else}
	<AppTable data={maintenanceLogs} {columns} />
{/if}
