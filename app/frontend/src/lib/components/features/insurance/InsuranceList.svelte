<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import {
		Shield,
		Calendar,
		Hash,
		DollarSign,
		Trash2,
		Notebook,
		Banknote
	} from '@lucide/svelte/icons';
	import { formatCurrency, formatDate } from '$helper/formatting';
	import { Jumper } from 'svelte-loading-spinners';
	import IconButton from '$appui/IconButton.svelte';
	import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
	import { getApiUrl } from '$helper/api';

	let { vehicleId } = $props();

	interface Insurance {
		id: string;
		provider: string;
		policyNumber: string;
		startDate: string;
		endDate: string;
		cost: number;
		notes: string;
	}

	let insurances: Insurance[] = $state([]);
	let loading = $state(false);
	let error = $state('');
	let selectedInsurance = $state<string>();
	let deleteDialog = $state(false);

	$effect(() => {
		if (!vehicleId) {
			error = 'Vehicle ID is required.';
			loading = false;
		} else {
			fetchInsuranceDetails();
		}
	});

	async function fetchInsuranceDetails() {
		if (!vehicleId) {
			insurances = [];
			return;
		}
		loading = true;
		error = '';
		try {
			const response = await fetch(getApiUrl(`/api/vehicles/${vehicleId}/insurance`), {
				headers: {
					'X-User-PIN': browser ? localStorage.getItem('userPin') || '' : ''
				}
			});
			if (response.ok) {
				insurances = await response.json();
				console.log('Insurance : ', JSON.stringify(insurances));
			} else {
				error = 'Failed to fetch insurance data.';
			}
		} catch (e) {
			console.error(e);
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function deleteInsurance(insuranceId: string | undefined) {
		if (!insuranceId) {
			return;
		}
		try {
			const response = await fetch(
				`${env.PUBLIC_API_BASE_URL || ''}/api/vehicles/${vehicleId}/insurance/${insuranceId}`,
				{
					method: 'DELETE',
					headers: {
						'X-User-PIN': browser ? localStorage.getItem('userPin') || '' : ''
					}
				}
			);
			if (response.ok) {
				await fetchInsuranceDetails();
			} else {
				const data = await response.json();
				error = data.message || 'Failed to delete insurance details.';
			}
		} catch (e) {
			console.error(e);
			error = 'Network error. Failed to delete insurance details.';
		}
	}

	onMount(() => {
		fetchInsuranceDetails();
	});
</script>

{#if loading}
	<p class="flex items-center justify-center gap-5 text-lg text-gray-500 dark:text-gray-400">
		<Jumper size="100" color="#155dfc" unit="px" duration="2s" />
	</p>
{:else if error}
	<p class="text-red-500">Error: {error}</p>
{:else if insurances.length === 0}
	<div>No Insurance found for this vehicle.</div>
{:else}
	{#each insurances as ins (ins.id)}
		<div class="bg-background/50 mt-4 rounded-lg p-6 shadow-sm">
			<div class="flex items-center justify-between">
				<div class="dark: flex items-center gap-2 text-blue-400 text-blue-500">
					<Shield class="h-6 w-6" />
					<span class="text-xl font-bold">{ins.provider}</span>
				</div>
				<div class="flex gap-2">
					<IconButton
						buttonStyles="hover:bg-gray-200 dark:hover:bg-gray-700"
						iconStyles="text-gray-600 dark:text-gray-100 hover:text-red-500"
						icon={Trash2}
						onclick={() => {
							selectedInsurance = ins.id;
							deleteDialog = true;
						}}
						ariaLabel="Delete"
					/>
				</div>
			</div>
			<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="flex items-center gap-2">
					<Hash class="h-5 w-5" />
					<span class="font-semibold">Policy Number:</span>
					<span>{ins.policyNumber}</span>
				</div>
				<div class="flex items-center gap-2">
					<Banknote class="h-5 w-5" />
					<span class="font-semibold">Cost:</span>
					<span>{formatCurrency(ins.cost)}</span>
				</div>
				<div class="flex items-center gap-2">
					<Calendar class="h-5 w-5 " />
					<span class="font-semibold">Start Date:</span>
					<span>{formatDate(ins.startDate)}</span>
				</div>
				<div class="flex items-center gap-2">
					<Calendar class="h-5 w-5 " />
					<span class="font-semibold">End Date:</span>
					<span>{formatDate(ins.endDate)}</span>
				</div>
				{#if ins.notes}
					<div class="flex items-center gap-2">
						<Notebook class="h-5 w-5 " />
						<span class="font-semibold">Notes:</span>
						<span>{ins.notes}</span>
					</div>
				{/if}
			</div>
		</div>
	{/each}
	<DeleteConfirmation
		onConfirm={() => deleteInsurance(selectedInsurance)}
		bind:open={deleteDialog}
	/>
{/if}
