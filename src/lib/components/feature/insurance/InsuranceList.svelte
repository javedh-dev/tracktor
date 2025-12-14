<script lang="ts">
	import Shield from '@lucide/svelte/icons/shield';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Hash from '@lucide/svelte/icons/hash';
	import Notebook from '@lucide/svelte/icons/notebook';
	import Banknote from '@lucide/svelte/icons/banknote';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import FileText from '@lucide/svelte/icons/file-text';
	import Image from '@lucide/svelte/icons/image';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { formatCurrency, formatDate } from '$lib/helper/format.helper';
	import { Jumper } from 'svelte-loading-spinners';
	import InsuranceContextMenu from './InsuranceContextMenu.svelte';
	import { insuranceStore } from '$stores/insurance.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';

	let vehicleId = $derived(vehicleStore.selectedId);

	$effect(() => {
		if (vehicleId) insuranceStore.refreshInsurances();
	});
</script>

{#if insuranceStore.processing}
	<p class="flex items-center justify-center gap-5 text-lg text-gray-500 dark:text-gray-400">
		<Jumper size="100" color="#155dfc" unit="px" duration="2s" />
	</p>
{:else if insuranceStore.error}
	<p class="text-red-500">Error: {insuranceStore.error}</p>
{:else if insuranceStore.insurances?.length === 0}
	<div>No Insurance found for this vehicle.</div>
{:else}
	{#each insuranceStore.insurances as ins (ins.id)}
		<div class="bg-background/50 mt-4 rounded-lg p-4 shadow-sm lg:p-6">
			<div class="flex items-center justify-between">
				<div class="dark: flex items-center gap-2 text-blue-400">
					<Shield class="h-6 w-6" />
					<span class="line-clamp-1 text-lg font-bold lg:text-xl">{ins.provider}</span>
				</div>
				<InsuranceContextMenu
					insurance={ins}
					onaction={() => {
						insuranceStore.refreshInsurances();
					}}
				/>
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
				{#if ins.attachment}
					{@const fileName = ins.attachment}
					{@const isPdf = fileName.toLowerCase().endsWith('.pdf')}
					{@const Icon = isPdf ? FileText : Image}
					<div class="flex items-center gap-2">
						<Paperclip class="h-5 w-5" />
						<span class="font-semibold">Attachment:</span>
						<a
							href="/api/files/{fileName}"
							target="_blank"
							rel="noopener noreferrer"
							class="text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
							title="View attachment"
						>
							<Icon class="h-4 w-4" />
							<ExternalLink class="h-3 w-3" />
							<span class="text-sm">View Document</span>
						</a>
					</div>
				{/if}
			</div>
		</div>
	{/each}
{/if}
