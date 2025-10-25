<script lang="ts">
	import DeleteConfirmation from '$lib/components/app/DeleteConfirmation.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { deleteInsurance } from '$lib/services/insurance.service';
	import { insuranceStore } from '$lib/stores/insurance.svelte';
	import type { Insurance } from '$lib/domain';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import { toast } from 'svelte-sonner';

	let { insurance, onaction }: { insurance: Insurance; onaction: () => void } = $props();
	let showDeleteDialog = $state(false);

	const deleteIns = () => {
		deleteInsurance(insurance).then((res) => {
			if (res.status === 'OK') {
				showDeleteDialog = false;
				toast.success('Deleted Insurance');
				onaction();
			} else {
				toast.error(res.error || 'Some error occurred while deleting vehicle.');
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
					insuranceStore.openForm(true, insurance.id, insurance.vehicleId);
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

<DeleteConfirmation onConfirm={() => deleteIns()} bind:open={showDeleteDialog} />
