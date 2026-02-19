<script lang="ts">
	import { withBase } from '$lib/utils';
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import Download from '@lucide/svelte/icons/download';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import X from '@lucide/svelte/icons/x';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { cn } from '$lib/utils';
	import { scale } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages';

	let {
		open = $bindable(false),
		fileName
	}: {
		open: boolean;
		fileName: string;
	} = $props();

	let fileUrl = $derived(withBase(`/api/files/${fileName}`));
	let previewUrl = $derived(`${fileUrl}?preview=true`);

	let isPdf = $derived(fileName.toLowerCase().endsWith('.pdf'));
	let isImage = $derived(
		['.jpg', '.jpeg', '.png', '.gif', '.webp'].some((ext) => fileName.toLowerCase().endsWith(ext))
	);
	let isViewable = $derived(isPdf || isImage);

	let loadedFile = $state('');
	let isLoading = $derived(open && isViewable && loadedFile !== fileName);

	$effect(() => {
		if (!open) {
			loadedFile = '';
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		id="file-preview-modal"
		class={cn(
			'file-preview-content max-w-[95vw] min-w-xs gap-0 border-none bg-transparent p-0 shadow-none transition-[max-width,height] duration-300',
			isLoading
				? 'h-[50vh] w-full'
				: isImage
					? 'h-auto w-auto'
					: isPdf
						? 'h-[90vh] w-full'
						: 'w-full'
		)}
		showCloseButton={false}
	>
		<div
			id="file-preview-wrapper"
			class={cn(
				'group bg-background/95 file-preview-wrapper relative flex flex-col overflow-hidden rounded-lg shadow-2xl backdrop-blur-sm transition-all duration-300',
				isViewable ? 'border-none' : 'border'
			)}
			style={isLoading ? 'height: 100%;' : isPdf ? 'height: 90vh;' : ''}
		>
			<!-- Custom Header -->
			<div
				id="file-preview-header"
				class={cn(
					'file-preview-header absolute top-0 right-0 left-0 z-20 flex items-center justify-between p-3 transition-opacity duration-300',
					isViewable
						? 'bg-linear-to-b from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 focus-within:opacity-100'
						: 'bg-background relative border-b opacity-100'
				)}
			>
				<div
					id="file-preview-filename"
					class="mr-4 flex flex-1 items-center gap-2 overflow-hidden px-2"
				>
					<span class={cn('truncate text-sm font-medium', isViewable ? 'drop-shadow-md' : '')}
						>{fileName}</span
					>
				</div>
				<div id="file-preview-actions" class="flex shrink-0 items-center gap-2">
					<Button
						id="file-preview-download"
						variant="ghost"
						size="icon"
						href={fileUrl}
						class={cn('h-8 w-8 hover:bg-white/20', isViewable ? 'text-white hover:text-white' : '')}
						download={fileName}
					>
						<Download class={cn('h-4 w-4', isViewable ? 'drop-shadow-md' : '')} />
						<span class="sr-only">{m.file_preview_aria_download()}</span>
					</Button>
					<Button
						id="file-preview-close"
						variant="ghost"
						size="icon"
						onclick={() => (open = false)}
						class={cn('h-8 w-8 hover:bg-white/20', isViewable ? 'text-white hover:text-white' : '')}
					>
						<X class={cn('h-4 w-4', isViewable ? 'drop-shadow-md' : '')} />
						<span class="sr-only">{m.file_preview_aria_close()}</span>
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
				{#if isLoading}
					<div class="absolute inset-0 z-10 h-full w-full">
						<Skeleton class="h-full w-full rounded-none" />
					</div>
				{/if}

				{#if isImage}
					<img
						src={previewUrl}
						alt={fileName}
						in:scale={{ start: 0.95, duration: 300 }}
						class={cn('block max-h-[85vh] max-w-full object-contain', isLoading && 'invisible')}
						onload={() => (loadedFile = fileName)}
					/>
				{:else if isPdf}
					<iframe
						src={previewUrl}
						title={fileName}
						class={cn('h-full w-full border-none bg-white', isLoading && 'invisible')}
						allow="fullscreen"
						onload={() => (loadedFile = fileName)}
					></iframe>
				{:else if !isViewable}
					<div class="flex flex-col items-center justify-center gap-4 py-8 text-center">
						<div class="bg-muted rounded-full p-4">
							<ExternalLink class="text-muted-foreground h-12 w-12" />
						</div>
						<div class="space-y-2">
							<h3 class="text-lg font-semibold">{m.file_preview_not_available()}</h3>
							<p class="text-muted-foreground max-w-xs text-sm">
								{m.file_preview_download_hint()}
							</p>
						</div>
						<Button href={fileUrl} download={fileName} class="mt-2">
							<Download class="mr-2 h-4 w-4" />
							{m.file_preview_download_button()}
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
