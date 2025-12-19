<script lang="ts">
	import { scale } from 'svelte/transition';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Button from '../ui/button/button.svelte';

	let { onConfirm, open = $bindable() } = $props();
</script>

{#if open}
	<div
		id="delete-confirmation-overlay"
		class="delete-confirmation-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
	>
		<div
			id="delete-confirmation-dialog"
			in:scale={{ duration: 500 }}
			class="delete-confirmation-dialog flex max-h-[90vh] max-w-xl min-w-sm flex-col items-center justify-center overflow-y-auto rounded-lg bg-white p-8 shadow-2xl dark:bg-gray-800"
		>
			<span id="delete-confirmation-icon" class="rounded-lg bg-rose-50 p-3">
				<Trash2 class="h-6 w-6 text-rose-600" />
			</span>
			<h3 id="delete-confirmation-title" class="mt-4 text-2xl text-black dark:text-white">
				Delete
			</h3>
			<h5 id="delete-confirmation-message" class="">Are you sure you want to delete?</h5>
			<div id="delete-confirmation-actions" class="mt-8 flex w-full justify-around gap-4">
				<Button
					id="delete-confirmation-cancel"
					variant="secondary"
					type="button"
					onclick={() => (open = false)}>Cancel</Button
				>
				<Button id="delete-confirmation-confirm" variant="default" type="button" onclick={onConfirm}
					>Confirm</Button
				>
			</div>
		</div>
	</div>
{/if}
