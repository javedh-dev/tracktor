<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { Jumper } from 'svelte-loading-spinners';
	import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
	import { getApiUrl } from '$helper/api';
	import { columns, type FuelLog } from '$models/fuel-log';
	import FuelLogTable from './FuelLogTable.svelte';

	const { vehicleId } = $props();

	let fuelLogs: FuelLog[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let selectedFuelLog = $state<string>();
	let deleteDialog = $state(false);

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

	async function deleteFuelLog(logId: string | undefined) {
		if (!logId) {
			return;
		}
		try {
			const response = await fetch(
				`${env.PUBLIC_API_BASE_URL || ''}/api/vehicles/${vehicleId}/fuel-logs/${logId}`,
				{
					method: 'DELETE',
					headers: {
						'X-User-PIN': localStorage.getItem('userPin') || ''
					}
				}
			);
			if (response.ok) {
				fuelLogs = fuelLogs.filter((log) => log.id !== logId);
			} else {
				const data = await response.json();
				error = data.message || 'Failed to delete fuel log.';
			}
		} catch (e) {
			console.error('Failed to connect to the server.', e);
			error = 'Failed to connect to the server.';
		}
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
	<!-- <Table.Root class=" m-8 text-base">
		<Table.Header>
			<Table.Row class="bg-background sticky top-0 z-10 rounded-t-lg font-bold">
				<Table.Head class="w-[100px]">Date</Table.Head>
				<Table.Head class="w-[100px]">Odometer</Table.Head>
				<Table.Head class="w-[100px]">Fuel Amount</Table.Head>
				<Table.Head class="w-[70px]">Full Tank</Table.Head>
				<Table.Head class="w-[100px]">Missed Last</Table.Head>
				<Table.Head class="w-[100px]">Cost</Table.Head>
				<Table.Head class="w-[100px]">Mileage</Table.Head>
				<Table.Head>Notes</Table.Head>
				<Table.Head class="w-[100px]">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each fuelLogs as log (log.id)}
				<Table.Row class="border-b border-gray-200 last:border-b-0 dark:border-gray-700">
					<Table.Cell>
						{formatDate(log.date)}
					</Table.Cell>
					<Table.Cell>
						{formatDistance(log.odometer)}
					</Table.Cell>
					<Table.Cell class="text-end">
						{formatVolume(log.fuelAmount)}
					</Table.Cell>
					<Table.Cell class="text-center">
						{#if log.filled}
							<Check />
						{:else}
							<X />
						{/if}
					</Table.Cell>
					<Table.Cell class="mx-auto">
						{#if log.missedLast}
							<Check />
						{:else}
							<X />
						{/if}
					</Table.Cell>
					<Table.Cell>
						{formatCurrency(log.cost)}</Table.Cell
					>
					<Table.Cell>
						{log.mileage ? formatMileage(log.mileage) : '-'}
					</Table.Cell>
					<Table.Cell>
						{log.notes || '-'}
					</Table.Cell>
					<Table.Cell>
						<IconButton
							buttonStyles="hover:bg-gray-200 dark:hover:bg-gray-700"
							iconStyles="text-gray-600 dark:text-gray-100 hover:text-red-500"
							icon={Trash2}
							onclick={() => {
								selectedFuelLog = log.id;
								deleteDialog = true;
							}}
							ariaLabel="Delete"
						/>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root> -->
	<FuelLogTable data={fuelLogs} {columns} />

	<DeleteConfirmation onConfirm={() => deleteFuelLog(selectedFuelLog)} bind:open={deleteDialog} />
{/if}
