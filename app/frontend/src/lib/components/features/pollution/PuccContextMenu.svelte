<script lang="ts">
	import DeleteConfirmation from '$lib/components/app/DeleteConfirmation.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { deletePollutionCertificate } from '$lib/services/pucc.service';
	import { puccStore } from '$lib/stores/pucc.svelte';
	import type { PollutionCertificate } from '$lib/domain';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
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
					puccStore.openForm(true, pucc.id, pucc.vehicleId);
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
