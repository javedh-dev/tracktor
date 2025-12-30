<script lang="ts">
	import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
	import Button from '$ui/button/button.svelte';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import type { MaintenanceLog } from '$lib/domain';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import { toast } from 'svelte-sonner';
	import { deleteMaintenanceLog } from '$lib/services/maintenance.service';
	import { sheetStore } from '$stores/sheet.svelte';
	import MaintenanceForm from './MaintenanceForm.svelte';
	import * as m from '$lib/paraglide/messages';

	let { maintenanceLog, onaction }: { maintenanceLog: MaintenanceLog; onaction: () => void } =
		$props();
	let showDeleteDialog = $state(false);

	const deleteLog = () => {
		deleteMaintenanceLog(maintenanceLog).then((res) => {
			if (res.status === 'OK') {
				showDeleteDialog = false;
				toast.success(m.maintenance_delete_success());
				onaction();
			} else {
				toast.error(res.error || m.maintenance_delete_error());
			}
		});
	};
</script>

<div id="maintenance-context-menu" class="maintenance-context-menu flex flex-row justify-end">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			id="maintenance-menu-trigger"
			class="data-[state=open]:bg-muted text-muted-foreground flex size-8"
		>
			{#snippet child({ props })}
				<Button variant="ghost" size="icon" {...props}>
					<EllipsisVertical />
					<span class="sr-only">{m.maintenance_menu_open()}</span>
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content id="maintenance-menu-content" align="end" class="w-32">
			<DropdownMenu.Item
				id="maintenance-menu-edit"
				onclick={() => {
					sheetStore.openSheet(
						MaintenanceForm,
						m.maintenance_menu_sheet_title(),
						'',
						maintenanceLog
					);
				}}
			>
				{m.maintenance_menu_edit()}
			</DropdownMenu.Item>
			<DropdownMenu.Item
				id="maintenance-menu-delete"
				variant="destructive"
				onclick={() => (showDeleteDialog = true)}
			>
				{m.maintenance_menu_delete()}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

<DeleteConfirmation onConfirm={() => deleteLog()} bind:open={showDeleteDialog} />
