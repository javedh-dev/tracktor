<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import { FileText, Calendar, MapPin, Trash2, BadgeCheck } from '@lucide/svelte/icons';
	import { formatDate } from '$helper/formatting';
	import { Jumper } from 'svelte-loading-spinners';
	import IconButton from '$appui/IconButton.svelte';
	import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
	import { getApiUrl } from '$helper/api';

	let { vehicleId } = $props();

	interface PollutionCertificateDetails {
		id: string;
		certificateNumber: string;
		issueDate: string;
		expiryDate: string;
		testingCenter: string;
		notes?: string;
	}

	let pollutionCertificates: PollutionCertificateDetails[] = $state([]);
	let loading = $state(false);
	let error = $state('');
	let selectedPucc = $state<string>();
	let deleteDialog = $state(false);

	$effect(() => {
		if (!vehicleId) {
			error = 'Vehicle ID is required.';
			loading = false;
		} else {
			fetchPollutionCertificateDetails();
		}
	});

	async function fetchPollutionCertificateDetails() {
		if (!vehicleId) {
			pollutionCertificates = [];
			return;
		}
		loading = true;
		error = '';
		try {
			const response = await fetch(getApiUrl(`/api/vehicles/${vehicleId}/pucc`), {
				headers: {
					'X-User-PIN': browser ? localStorage.getItem('userPin') || '' : ''
				}
			});
			if (response.ok) {
				pollutionCertificates = await response.json();
			} else {
				error = 'Failed to fetch Pollution Certificates.';
			}
		} catch (e) {
			console.error(e);
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function deletePollutionCertificate(puccId: string | undefined) {
		if (!puccId) {
			return;
		}
		try {
			const response = await fetch(
				`${env.PUBLIC_API_BASE_URL || ''}/api/vehicles/${vehicleId}/pucc/${puccId}`,
				{
					method: 'DELETE',
					headers: {
						'X-User-PIN': browser ? localStorage.getItem('userPin') || '' : ''
					}
				}
			);
			if (response.ok) {
				await fetchPollutionCertificateDetails();
			} else {
				const data = await response.json();
				error = data.message || 'Failed to delete pollution certificate.';
			}
		} catch (e) {
			console.error(e);
			error = 'Network error. Failed to delete pollution certificate.';
		}
	}

	onMount(() => {
		fetchPollutionCertificateDetails();
	});
</script>

{#if loading}
	<p class="flex items-center justify-center gap-5 text-lg text-gray-500 dark:text-gray-400">
		<Jumper size="100" color="#155dfc" unit="px" duration="2s" />
	</p>
{:else if error}
	<p class="text-red-500">Error: {error}</p>
{:else if pollutionCertificates.length === 0}
	<div>No maintenance logs for this vehicle.</div>
{:else}
	{#each pollutionCertificates as pucc (pucc.id)}
		<div
			class="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<BadgeCheck class="h-6 w-6 text-purple-500 dark:text-purple-400" />
					<span class="text-xl font-bold text-gray-800 dark:text-gray-100"
						>{pucc.certificateNumber}</span
					>
				</div>
				<div class="flex gap-2">
					<IconButton
						buttonStyles="hover:bg-gray-200 dark:hover:bg-gray-700"
						iconStyles="text-gray-600 dark:text-gray-100 hover:text-red-500"
						icon={Trash2}
						onclick={() => {
							selectedPucc = pucc.id;
							deleteDialog = true;
						}}
						ariaLabel="Delete"
					/>
				</div>
			</div>
			<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="flex items-center gap-2 text-gray-900 dark:text-gray-100">
					<Calendar class="h-5 w-5" />
					<span class="font-semibold">Issue Date:</span>
					<span>{formatDate(pucc.issueDate)}</span>
				</div>
				<div class="flex items-center gap-2 text-gray-900 dark:text-gray-100">
					<Calendar class="h-5 w-5" />
					<span class="font-semibold">Expiry Date:</span>
					<span>{formatDate(pucc.expiryDate)}</span>
				</div>
				<div class="flex items-center gap-2 text-gray-900 dark:text-gray-100">
					<MapPin class="h-5 w-5" />
					<span class="font-semibold">Testing Center:</span>
					<span>{pucc.testingCenter}</span>
				</div>
				{#if pucc.notes}
					<div class="flex items-center gap-2 text-gray-900 dark:text-gray-100">
						<FileText class="h-5 w-5" />
						<span class="font-semibold">Notes:</span>
						<span>{pucc.notes}</span>
					</div>
				{/if}
			</div>
		</div>
	{/each}
	<DeleteConfirmation
		onConfirm={() => deletePollutionCertificate(selectedPucc)}
		bind:open={deleteDialog}
	/>
{/if}
