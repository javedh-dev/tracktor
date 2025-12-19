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

<div id="pollution-context-menu" class="pollution-context-menu flex flex-row justify-end">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			id="pollution-menu-trigger"
			class="data-[state=open]:bg-muted text-muted-foreground flex size-8"
		>
			{#snippet child({ props })}
				<Button variant="ghost" size="icon" {...props}>
					<EllipsisVertical />
					<span class="sr-only">Open menu</span>
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content id="pollution-menu-content" align="end" class="w-32">
			<DropdownMenu.Item
				id="pollution-menu-edit"
				onclick={() => {
					sheetStore.openSheet(PollutionCertificateForm, 'Update Pollution Certificate', '', pucc);
				}}
			>
				Edit
			</DropdownMenu.Item>
			<DropdownMenu.Item
				id="pollution-menu-delete"
				variant="destructive"
				onclick={() => (showDeleteDialog = true)}
			>
				Delete
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

<DeleteConfirmation onConfirm={() => deletePucc()} bind:open={showDeleteDialog} />
