<script lang="ts">
	import DeleteConfirmation from '$lib/components/ui/app/DeleteConfirmation.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { getApiUrl } from '$lib/helper/api';
	import { maintenanceModelStore } from '$lib/stores/maintenance';
	import type { MaintenanceLog } from '$lib/types';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import { toast } from 'svelte-sonner';

	let { maintenanceLog, onaction }: { maintenanceLog: MaintenanceLog; onaction: () => void } =
		$props();
	let showDeleteDialog = $state(false);

	async function deleteFuelLog() {
		if (!maintenanceLog.id) {
			return;
		}
		try {
			const response = await fetch(
				getApiUrl(`/api/vehicles/${maintenanceLog.vehicleId}/fuel-logs/${maintenanceLog.id}`),
				{
					method: 'DELETE',
					headers: {
						'X-User-PIN': localStorage.getItem('userPin') || ''
					}
				}
			);
			if (response.ok) {
				showDeleteDialog = false;
				toast.success('Deleted Fuel Log');
				onaction();
			} else {
				toast.error('Failed to delete the Fuel Log');
			}
		} catch (e) {
			console.error('Failed to connect to the server.', e);
		}
	}
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
					maintenanceModelStore.show(maintenanceLog.vehicleId, maintenanceLog, true, onaction);
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

<DeleteConfirmation onConfirm={() => deleteFuelLog()} bind:open={showDeleteDialog} />
