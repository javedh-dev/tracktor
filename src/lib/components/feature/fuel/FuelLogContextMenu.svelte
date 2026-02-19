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
	import * as m from '$lib/paraglide/messages';

	let { fuelLog, onaction }: { fuelLog: FuelLog; onaction: () => void } = $props();
	let showDeleteDialog = $state(false);

	const deleteLog = () => {
		deleteFuelLog(fuelLog).then((res) => {
			if (res.status === 'OK') {
				showDeleteDialog = false;
				toast.success(m.fuel_log_delete_success());
				onaction();
			} else {
				toast.error(res.error || m.fuel_log_delete_error());
			}
		});
	};
</script>

<div id="fuel-log-context-menu" class="fuel-context-menu flex flex-row justify-end">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			id="fuel-log-menu-trigger"
			class="data-[state=open]:bg-muted text-muted-foreground flex size-8"
		>
			{#snippet child({ props })}
				<Button variant="ghost" size="icon" {...props}>
					<EllipsisVertical />
					<span class="sr-only">{m.fuel_log_menu_open()}</span>
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content id="fuel-log-menu-content" align="end" class="w-32">
			<DropdownMenu.Item
				id="fuel-log-menu-edit"
				onclick={() => {
					sheetStore.openSheet(FuelLogForm, m.fuel_log_menu_sheet_title(), '', fuelLog);
				}}
			>
				{m.fuel_log_edit()}
			</DropdownMenu.Item>
			<DropdownMenu.Item
				id="fuel-log-menu-delete"
				variant="destructive"
				onclick={() => (showDeleteDialog = true)}
			>
				{m.fuel_log_delete()}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

<DeleteConfirmation onConfirm={() => deleteLog()} bind:open={showDeleteDialog} />
