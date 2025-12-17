<script lang="ts">
	import FileText from '@lucide/svelte/icons/file-text';
	import FileImage from '@lucide/svelte/icons/file-image';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import FilePreviewModal from '$lib/components/app/FilePreviewModal.svelte';
	import type { Snippet } from 'svelte';

	let { fileName, children }: { fileName: string; children?: Snippet } = $props();

	let open = $state(false);
	let isPdf = $derived(fileName.toLowerCase().endsWith('.pdf'));
	let Icon = $derived(isPdf ? FileText : FileImage);
</script>

<button
	class="text-primary hover:text-primary/80 inline-flex max-w-full min-w-0 cursor-pointer items-center gap-1 overflow-hidden border-0 bg-transparent p-0 text-left transition-colors"
	title="View attachment"
	onclick={(e) => {
		e.stopPropagation();
		open = true;
	}}
>
	{#if children}
		<span class="min-w-0 truncate">{@render children()}</span>
	{:else}
		<Icon class="h-4 w-4 shrink-0" />
		<ExternalLink class="h-3 w-3 shrink-0" />
	{/if}
</button>

<FilePreviewModal bind:open {fileName} />
