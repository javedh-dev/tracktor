<script lang="ts">
	import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
	import Button from '$ui/button/button.svelte';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { deletePollutionCertificate } from '$lib/services/pucc.service';
	import type { PollutionCertificate } from '$lib/domain';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import { toast } from 'svelte-sonner';
	import { sheetStore } from '$stores/sheet.svelte';
	import PollutionCertificateForm from './PollutionCertificateForm.svelte';
	import * as m from '$lib/paraglide/messages';

	let { pucc, onaction }: { pucc: PollutionCertificate; onaction: () => void } = $props();
	let showDeleteDialog = $state(false);

	const deletePucc = () => {
		deletePollutionCertificate(pucc).then((res) => {
			if (res.status === 'OK') {
				showDeleteDialog = false;
				toast.success(m.pollution_delete_success());
				onaction();
			} else {
				toast.error(res.error || m.pollution_delete_error());
			}
		});
	};
</script>

<div id="pollution-context-menu" class="pollution-context-menu flex flex-row justify-end">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			id="pollution-menu-trigger"
			class="data-[state=open]:bg-muted text-muted-foreground flex size-8"
		>
			{#snippet child({ props })}
				<Button variant="ghost" size="icon" {...props}>
					<EllipsisVertical />
					<span class="sr-only">{m.pollution_menu_open()}</span>
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content id="pollution-menu-content" align="end" class="w-32">
			<DropdownMenu.Item
				id="pollution-menu-edit"
				onclick={() => {
					sheetStore.openSheet(PollutionCertificateForm, m.pollution_menu_sheet_title(), '', pucc);
				}}
			>
				{m.pollution_menu_edit()}
			</DropdownMenu.Item>
			<DropdownMenu.Item
				id="pollution-menu-delete"
				variant="destructive"
				onclick={() => (showDeleteDialog = true)}
			>
				{m.pollution_menu_delete()}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

<DeleteConfirmation onConfirm={() => deletePucc()} bind:open={showDeleteDialog} />
