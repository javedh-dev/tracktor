<script lang="ts">
	import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
	import Button from '$ui/button/button.svelte';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { deleteFuelLog } from '$lib/services/fuel.service';
	import type { FuelLog } from '$lib/domain/fuel';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import { toast } from 'svelte-sonner';
	import { sheetStore } from '$stores/sheet.svelte';
	import FuelLogForm from './FuelLogForm.svelte';

	let { fuelLog, onaction }: { fuelLog: FuelLog; onaction: () => void } = $props();
	let showDeleteDialog = $state(false);

	const deleteLog = () => {
		deleteFuelLog(fuelLog).then((res) => {
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
					sheetStore.openSheet(FuelLogForm, 'Update Fuel Log', '', fuelLog);
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
