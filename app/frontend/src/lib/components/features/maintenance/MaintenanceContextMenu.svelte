<script lang="ts">
	import DeleteConfirmation from '$lib/components/app/DeleteConfirmation.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { maintenanceStore } from '$lib/stores/maintenance.svelte';
	import type { MaintenanceLog } from '$lib/domain';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import { toast } from 'svelte-sonner';
	import { deleteMaintenanceLog } from '$lib/services/maintenence.service';

	let { maintenanceLog, onaction }: { maintenanceLog: MaintenanceLog; onaction: () => void } =
		$props();
	let showDeleteDialog = $state(false);

	const deleteLog = () => {
		deleteMaintenanceLog(maintenanceLog).then((res) => {
			if (res.status === 'OK') {
				showDeleteDialog = false;
				toast.success('Deleted Fuel Log');
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
					maintenanceStore.openForm(true, maintenanceLog.id, maintenanceLog.vehicleId);
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

<DeleteConfirmation onConfirm={() => deleteLog()} bind:open={showDeleteDialog} />
