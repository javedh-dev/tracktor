<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import Download from '@lucide/svelte/icons/download';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import X from '@lucide/svelte/icons/x';
	import { cn } from '$lib/utils';
	import { scale } from 'svelte/transition';

	let {
		open = $bindable(false),
		fileName
	}: {
		open: boolean;
		fileName: string;
	} = $props();

	let fileUrl = $derived(`/api/files/${fileName}`);
	let previewUrl = $derived(`${fileUrl}?preview=true`);

	let isPdf = $derived(fileName.toLowerCase().endsWith('.pdf'));
	let isImage = $derived(
		['.jpg', '.jpeg', '.png', '.gif', '.webp'].some((ext) => fileName.toLowerCase().endsWith(ext))
	);
	let isViewable = $derived(isPdf || isImage);
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class={cn(
			'gap-0 border-none bg-transparent p-0 shadow-none',
			isImage ? 'h-auto w-auto max-w-[95vw]' : '',
			isPdf ? 'h-[90vh] w-full max-w-6xl' : '',
			!isViewable ? 'w-full max-w-md' : ''
		)}
		showCloseButton={false}
	>
		<div
			class={cn(
				'group bg-background/95 relative flex flex-col overflow-hidden rounded-lg shadow-2xl backdrop-blur-sm transition-all duration-300',
				isViewable ? 'border-none' : 'border'
			)}
			style={isPdf ? 'height: 90vh;' : ''}
		>
			<!-- Custom Header (Overlay) -->
			<div
				class={cn(
					'absolute top-0 right-0 left-0 z-20 flex items-center justify-between p-3 transition-opacity duration-300',
					isViewable
						? 'bg-gradient-to-b from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 focus-within:opacity-100'
						: 'bg-background relative border-b opacity-100'
				)}
			>
				<div class="mr-4 flex flex-1 items-center gap-2 overflow-hidden px-2">
					<span class="truncate text-sm font-medium drop-shadow-md">{fileName}</span>
				</div>
				<div class="flex flex-shrink-0 items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						href={fileUrl}
						class={cn('h-8 w-8 hover:bg-white/20', isViewable ? 'text-white hover:text-white' : '')}
						download={fileName}
					>
						<Download class="h-4 w-4 drop-shadow-md" />
						<span class="sr-only">Download</span>
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onclick={() => (open = false)}
						class={cn('h-8 w-8 hover:bg-white/20', isViewable ? 'text-white hover:text-white' : '')}
					>
						<X class="h-4 w-4 drop-shadow-md" />
						<span class="sr-only">Close</span>
					</Button>
				</div>
			</div>

			<!-- Content -->
			<div
				class={cn(
					'flex items-center justify-center overflow-auto',
					isViewable ? 'h-full w-full' : 'bg-muted/40 flex-1 p-4'
				)}
			>
				{#if isImage}
					<img
						src={previewUrl}
						alt={fileName}
						in:scale={{ start: 0.95, duration: 300 }}
						class="block max-h-[85vh] max-w-full object-contain"
					/>
				{:else if isPdf}
					<iframe
						src={previewUrl}
						title={fileName}
						class="h-full w-full border-none bg-white"
						allow="fullscreen"
					></iframe>
				{:else}
					<div class="flex flex-col items-center justify-center gap-4 py-8 text-center">
						<div class="bg-muted rounded-full p-4">
							<ExternalLink class="text-muted-foreground h-12 w-12" />
						</div>
						<div class="space-y-2">
							<h3 class="text-lg font-semibold">Preview not available</h3>
							<p class="text-muted-foreground max-w-xs text-sm">
								This file type cannot be previewed directly. Please download it to view.
							</p>
						</div>
						<Button href={fileUrl} download={fileName} class="mt-2">
							<Download class="mr-2 h-4 w-4" />
							Download File
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
