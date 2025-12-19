<script lang="ts">
	import Calendar from '@lucide/svelte/icons/calendar';
	import FileText from '@lucide/svelte/icons/file-text';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import AttachmentLink from '$lib/components/app/AttachmentLink.svelte';
	import { formatDate } from '$lib/helper/format.helper';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import PuccContextMenu from './PuccContextMenu.svelte';
	import { puccStore } from '$stores/pucc.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import LabelWithIcon from '$lib/components/app/LabelWithIcon.svelte';
	import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';

	$effect(() => {
		if (vehicleStore.selectedId) puccStore.refreshPuccs();
	});
</script>

{#if puccStore.processing}
	<div id="pollution-list-skeleton" class="space-y-4 pt-4">
		{#each [0, 1] as i (i)}
			<div class="bg-background rounded-lg border p-4 shadow-sm lg:p-6">
				<div class="mb-4 flex items-center justify-between">
					<Skeleton class="h-6 w-48" />
					<Skeleton class="h-8 w-8 rounded-full" />
				</div>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Skeleton class="h-5 w-full max-w-[200px]" />
					<Skeleton class="h-5 w-full max-w-40" />
					<Skeleton class="h-5 w-full max-w-48" />
					<Skeleton class="h-5 w-full max-w-48" />
				</div>
			</div>
		{/each}
	</div>
{:else if puccStore.error}
	<p class="text-red-500">Error: {puccStore.error}</p>
{:else if puccStore.pollutionCerts?.length === 0}
	<LabelWithIcon
		icon={CircleSlash2}
		iconClass="h-5 w-5"
		style="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center"
		label="No Pollution Certificates for this vehicle."
	/>
{:else}
	{#each puccStore.pollutionCerts as pucc (pucc.id)}
		<div
			id="pollution-certificate-item-{pucc.id}"
			class="pollution-certificate-item lg:bg-background/50 bg-secondary mt-4 rounded-lg border p-4 shadow-sm lg:p-6"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2 text-fuchsia-500 dark:text-fuchsia-400">
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
				{#if pucc.attachment}
					{@const fileName = pucc.attachment}
					<div class="flex items-center gap-2 text-gray-900 dark:text-gray-100">
						<Paperclip class="h-5 w-5" />
						<span class="font-semibold">Attachment:</span>
						<AttachmentLink {fileName}>
							<span class="text-sm">View Certificate</span>
						</AttachmentLink>
					</div>
				{/if}
			</div>
		</div>
	{/each}
{/if}
