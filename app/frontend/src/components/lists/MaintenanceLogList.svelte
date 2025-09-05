<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import { formatCurrency, formatDate, formatDistance } from '$lib/utils/formatting';
	import { Pen, Trash2 } from '@lucide/svelte';
	import { Jumper } from 'svelte-loading-spinners';
	import IconButton from '$components/common/IconButton.svelte';
	import DeleteConfirmation from '$components/common/DeleteConfirmation.svelte';
	import MaintenanceLogModal from '$components/modals/MaintenanceLogModal.svelte';
	import { maintenanceModelStore } from '$lib/stores/maintenance';
	import { getApiUrl } from '$lib/utils/api';

	let { vehicleId } = $props();

	interface MaintenanceLog {
		id: string;
		date: string;
		odometer: number;
		serviceCenter: string;
		cost: number;
		notes?: string;
	}

	let maintenanceLogs: MaintenanceLog[] = $state([]);
	let loading = $state(false);
	let error = $state('');
	let selectedMaintenanceLog = $state<string>();
	let selectedMaintenanceLogFull = $state<MaintenanceLog | null>(null);
	let deleteDialog = $state(false);
	let updateDialog = $state(false);

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

	async function updateMaintenanceLog(logId: string | undefined, updatedLogData: any) {
		// 1. A guard clause to ensure both the log ID and the data are provided.
		// The 'any' type is used here for simplicity, but in a real app,
		// you would use a specific type or interface for `updatedLogData`.
		if (!logId || !updatedLogData) {
			// You might want to set an error message here as well.
			console.error('Missing log ID or updated data.');
			return;
		}

		try {
			// 2. The core network request using `fetch`.
			const response = await fetch(
				// 3. The URL is similar to the delete function. It should point to the specific resource.
				// Some APIs might use a slightly different URL for updates, but this pattern is common.
				`${env.PUBLIC_API_BASE_URL || ''}/api/vehicles/${vehicleId}/maintenance-logs/${logId}`,
				{
					// 4. Change the HTTP method to 'PUT' or 'PATCH'.
					// 'PUT' is typically used for a complete replacement of the resource.
					// 'PATCH' is used for a partial update. Choose the one that fits your API.
					method: 'PUT',

					// 5. The headers are similar, but you must also specify the content type of the body.
					headers: {
						'Content-Type': 'application/json',
						'X-User-PIN': browser ? localStorage.getItem('userPin') || '' : ''
					},

					// 6. Add a `body` property. This is the most crucial difference.
					// You must stringify the JSON data to send it in the request body.
					body: JSON.stringify(updatedLogData)
				}
			);

			// 7. Handle the response, similar to the delete function.
			if (response.ok) {
				// 8. If successful, refresh the list of logs to show the updated data.
				await fetchMaintenanceLogs();
			} else {
				const data = await response.json();
				// 9. Set the error message if the server responds with an error.
				error = data.message || 'Failed to update maintenance log.';
			}
		} catch (e) {
			// 10. Handle network-level errors.
			console.error(e);
			error = 'Network error. Failed to update maintenance log.';
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
	<div class="overflow-x-auto">
		<table class="min-w-full overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
			<thead class="bg-gray-200 dark:bg-gray-700">
				<tr>
					<th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Date</th>
					<th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200"
						>Odometer</th
					>
					<th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200"
						>Service Center</th
					>
					<th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Cost</th>
					<th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Notes</th>
					<th class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Actions</th
					>
				</tr>
			</thead>
			<tbody>
				{#each maintenanceLogs as log (log.id)}
					<tr class="border-b border-gray-200 last:border-b-0 dark:border-gray-700">
						<td class="px-4 py-2 text-gray-900 dark:text-gray-100">{formatDate(log.date)}</td>
						<td class="px-4 py-2 text-gray-900 dark:text-gray-100"
							>{formatDistance(log.odometer)}</td
						>
						<td class="px-4 py-2 text-gray-900 dark:text-gray-100">{log.serviceCenter}</td>
						<td class="px-4 py-2 text-gray-900 dark:text-gray-100">{formatCurrency(log.cost)}</td>
						<td class="px-4 py-2 text-gray-900 dark:text-gray-100">{log.notes || '-'}</td>
						<td class="px-4 py-2 text-gray-800 dark:text-gray-200">
							<IconButton
								buttonStyles="hover:bg-gray-200 dark:hover:bg-gray-700"
								iconStyles="text-gray-600 dark:text-gray-100 hover:text-red-500"
								icon={Trash2}
								onclick={() => {
									selectedMaintenanceLog = log.id;
									deleteDialog = true;
								}}
								ariaLabel="Delete"
							/>
							<IconButton
								buttonStyles="hover:bg-gray-200 dark:hover:bg-gray-700"
								iconStyles="text-gray-600 dark:text-gray-100 hover:text-blue-500"
								icon={Pen}
								onclick={() => {
									// Only pass the fields that MaintenanceLogForm expects
									maintenanceModelStore.show(
										vehicleId, // string
										{
											id: log.id,
											date: log.date,
											odometer: log.odometer,
											serviceCenter: log.serviceCenter,
											cost: log.cost,
											notes: log.notes ?? ''
										}, // logToEdit
										true, // editMode
										async (success) => {
											if (success) {
												await fetchMaintenanceLogs();
											}
										}
									);
								}}
								ariaLabel="Edit"
							/>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<DeleteConfirmation
		onConfirm={() => deleteMaintenenceLog(selectedMaintenanceLog)}
		bind:open={deleteDialog}
	/>
{/if}

<MaintenanceLogModal />
