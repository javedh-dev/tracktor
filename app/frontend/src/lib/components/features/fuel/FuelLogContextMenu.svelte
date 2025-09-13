<script lang="ts">
	import DeleteConfirmation from '$lib/components/ui/app/DeleteConfirmation.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { getApiUrl } from '$lib/helper/api';
	import type { FuelLog } from '$lib/types/fuel-log';
	import { EllipsisVertical } from '@lucide/svelte';

	let { fuelLog }: { fuelLog: FuelLog } = $props();
	let showDeleteDialog = $state(false);

	async function deleteFuelLog() {
		if (!fuelLog.id) {
			return;
		}
		try {
			const response = await fetch(
				getApiUrl(`/api/vehicles/${fuelLog.vehicleId}/fuel-logs/${fuelLog.id}`),
				{
					method: 'DELETE',
					headers: {
						'X-User-PIN': localStorage.getItem('userPin') || ''
					}
				}
			);
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
			<DropdownMenu.Item>Edit</DropdownMenu.Item>
			<DropdownMenu.Item variant="destructive" onclick={() => (showDeleteDialog = true)}>
				Delete
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

<DeleteConfirmation onConfirm={() => deleteFuelLog()} bind:open={showDeleteDialog} />
