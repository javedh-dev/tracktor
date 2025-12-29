<script lang="ts">
	import Shield from '@lucide/svelte/icons/shield';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Hash from '@lucide/svelte/icons/hash';
	import Notebook from '@lucide/svelte/icons/notebook';
	import Banknote from '@lucide/svelte/icons/banknote';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import Repeat from '@lucide/svelte/icons/repeat';
	import AttachmentLink from '$lib/components/app/AttachmentLink.svelte';
	import { formatCurrency, formatDate } from '$lib/helper/format.helper';
	import { getNextDueDate } from '$lib/helper/recurrence.helper';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import InsuranceContextMenu from './InsuranceContextMenu.svelte';
	import { insuranceStore } from '$stores/insurance.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import LabelWithIcon from '$lib/components/app/LabelWithIcon.svelte';
	import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';
	import { INSURANCE_RECURRENCE_TYPES } from '$lib/domain/insurance';
	import type { Insurance } from '$lib/domain/insurance';

	let vehicleId = $derived(vehicleStore.selectedId);

	const getNextInsuranceDue = (ins: Insurance) => {
		const baseDate = ins.endDate ?? ins.startDate;
		if (!baseDate) return null;
		if (ins.recurrenceType === 'no_end') return null;
		if (ins.recurrenceType === 'none') return baseDate;
		return getNextDueDate(new Date(baseDate), ins.recurrenceType, ins.recurrenceInterval);
	};

	$effect(() => {
		if (vehicleId) insuranceStore.refreshInsurances();
	});
</script>

{#if insuranceStore.processing}
	<div class="space-y-4 pt-4">
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
{:else if insuranceStore.error}
	<p class="text-red-500">Error: {insuranceStore.error}</p>
{:else if insuranceStore.insurances?.length === 0}
	<LabelWithIcon
		icon={CircleSlash2}
		iconClass="h-5 w-5"
		style="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center"
		label="No Insurance found for this vehicle."
	/>
{:else}
	{#each insuranceStore.insurances as ins (ins.id)}
		{@const nextDue = getNextInsuranceDue(ins)}
		<div
			id="insurance-item-{ins.id}"
			class="insurance-item lg:bg-background/50 bg-secondary mt-4 rounded-lg border p-4 shadow-sm lg:p-6"
		>
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
				{#if ins.endDate}
					<div class="flex items-center gap-2">
						<Calendar class="h-5 w-5 " />
						<span class="font-semibold">End Date:</span>
						<span>{formatDate(ins.endDate)}</span>
					</div>
				{/if}
				<div class="flex items-center gap-2">
					<Calendar class="h-5 w-5 " />
					<span class="font-semibold">Next Due:</span>
					<span>
						{#if nextDue}
							{formatDate(nextDue)}
						{:else if ins.recurrenceType === 'no_end'}
							No end date
						{:else}
							—
						{/if}
					</span>
				</div>
				{#if ins.recurrenceType && ins.recurrenceType !== 'none'}
					<div class="flex items-center gap-2 md:col-span-2">
						<Repeat class="h-5 w-5" />
						<span class="font-semibold">Recurrence:</span>
						<span>
							{INSURANCE_RECURRENCE_TYPES[ins.recurrenceType]}
							{#if (ins.recurrenceType === 'yearly' || ins.recurrenceType === 'monthly') && ins.recurrenceInterval > 1}
								(every {ins.recurrenceInterval}
								{ins.recurrenceType === 'yearly' ? 'years' : 'months'})
							{/if}
						</span>
					</div>
				{/if}
				{#if ins.notes}
					<div class="flex items-center gap-2 md:col-span-2">
						<Notebook class="h-5 w-5 " />
						<span class="font-semibold">Notes:</span>
						<span>{ins.notes}</span>
					</div>
				{/if}
				{#if ins.attachment}
					{@const fileName = ins.attachment}
					<div class="flex items-center gap-2 md:col-span-2">
						<Paperclip class="h-5 w-5" />
						<span class="font-semibold">Attachment:</span>
						<AttachmentLink {fileName}>
							<span class="text-sm">View Document</span>
						</AttachmentLink>
					</div>
				{/if}
			</div>
		</div>
	{/each}
{/if}
