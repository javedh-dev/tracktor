<script lang="ts">
	import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
	import Button from '$ui/button/button.svelte';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { deleteInsurance } from '$lib/services/insurance.service';
	import type { Insurance } from '$lib/domain';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import { toast } from 'svelte-sonner';
	import { sheetStore } from '$stores/sheet.svelte';
	import InsuranceForm from './InsuranceForm.svelte';
	import * as m from '$lib/paraglide/messages';

	let { insurance, onaction }: { insurance: Insurance; onaction: () => void } = $props();
	let showDeleteDialog = $state(false);

	const deleteIns = () => {
		deleteInsurance(insurance).then((res) => {
			if (res.status === 'OK') {
				showDeleteDialog = false;
				toast.success(m.insurance_delete_success());
				onaction();
			} else {
				toast.error(res.error || m.insurance_delete_error());
			}
		});
	};
</script>

<div id="insurance-context-menu" class="insurance-context-menu flex flex-row justify-end">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			id="insurance-menu-trigger"
			class="data-[state=open]:bg-muted text-muted-foreground flex size-8"
		>
			{#snippet child({ props })}
				<Button variant="ghost" size="icon" {...props}>
					<EllipsisVertical />
					<span class="sr-only">{m.insurance_menu_open()}</span>
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content id="insurance-menu-content" align="end" class="w-32">
			<DropdownMenu.Item
				id="insurance-menu-edit"
				onclick={() => {
					sheetStore.openSheet(InsuranceForm, m.insurance_menu_sheet_title(), '', insurance);
				}}
			>
				{m.insurance_menu_edit()}
			</DropdownMenu.Item>
			<DropdownMenu.Item
				id="insurance-menu-delete"
				variant="destructive"
				onclick={() => (showDeleteDialog = true)}
			>
				{m.insurance_menu_delete()}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

<DeleteConfirmation onConfirm={() => deleteIns()} bind:open={showDeleteDialog} />
