<script lang="ts">
	import DeleteConfirmation from '$lib/components/ui/app/DeleteConfirmation.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { deleteInsurance } from '$lib/services/insurance.service';
	import { deletePollutionCertificate } from '$lib/services/pucc.service';
	import { insuranceModelStore } from '$lib/stores/insurance';
	import { maintenanceModelStore } from '$lib/stores/maintenance';
	import { puccModelStore } from '$lib/stores/pucc';
	import type { Insurance, PollutionCertificate } from '$lib/types';
	import { EllipsisVertical } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let { pucc, onaction }: { pucc: PollutionCertificate; onaction: () => void } = $props();
	let showDeleteDialog = $state(false);

	const deletePucc = () => {
		deletePollutionCertificate(pucc).then((res) => {
			if (res.status === 'OK') {
				showDeleteDialog = false;
				toast.success('Deleted PUCC...!!!');
				onaction();
			} else {
				toast.error(res.error || 'Some error occurred while deleting PUCC.');
			}
		});
	};
</script>

<div class=" flex flex-row justify-end">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="data-[state=open]:bg-muted text-muted-foreground flex size-8">
			{#snippet child({ props })}
				<Button variant="ghost" size="icon" {...props}>
					<EllipsisVertical />
					<span class="sr-only">Open menu</span>
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="w-32">
			<DropdownMenu.Item
				onclick={() => {
					puccModelStore.show(pucc.vehicleId, pucc, true, onaction);
				}}
			>
				Edit
			</DropdownMenu.Item>
			<DropdownMenu.Item variant="destructive" onclick={() => (showDeleteDialog = true)}>
				Delete
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

<DeleteConfirmation onConfirm={() => deletePucc()} bind:open={showDeleteDialog} />
