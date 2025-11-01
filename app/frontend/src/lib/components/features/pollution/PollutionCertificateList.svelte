<script lang="ts">
	import FileText from '@lucide/svelte/icons/file-text';
	import Calendar from '@lucide/svelte/icons/calendar';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import { formatDate } from '$lib/helper/format.helper';
	import { Jumper } from 'svelte-loading-spinners';
	import PuccContextMenu from './PuccContextMenu.svelte';
	import { puccStore } from '$lib/stores/pucc.svelte';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';

	$effect(() => {
		if (vehicleStore.selectedId) puccStore.refreshPuccs();
	});
</script>

{#if puccStore.processing}
	<p class="flex items-center justify-center gap-5 text-lg text-gray-500 dark:text-gray-400">
		<Jumper size="100" color="#155dfc" unit="px" duration="2s" />
	</p>
{:else if puccStore.error}
	<p class="text-red-500">Error: {puccStore.error}</p>
{:else if puccStore.pollutionCerts?.length === 0}
	<div>No Pollution Certificates for this vehicle.</div>
{:else}
	{#each puccStore.pollutionCerts as pucc (pucc.id)}
		<div class="bg-background/50 mt-4 rounded-lg border p-4 shadow-sm lg:p-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2 text-purple-500 dark:text-purple-400">
					<BadgeCheck class="h-6 w-6 " />
					<span class="line-clamp-1 text-lg font-bold lg:text-xl">{pucc.certificateNumber}</span>
				</div>
				<PuccContextMenu
					{pucc}
					onaction={() => {
						puccStore.refreshPuccs();
					}}
				/>
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
{/if}
