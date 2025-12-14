<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { displaySize, MEGABYTE } from '.';
	import { useId } from 'bits-ui';
	import type { FileDropZoneProps } from './types';
	import { toast } from 'svelte-sonner';
	import Upload from '@lucide/svelte/icons/upload';
	import FileText from '@lucide/svelte/icons/file-text';
	import Image from '@lucide/svelte/icons/image';
	import X from '@lucide/svelte/icons/x';

	let {
		id = useId(),
		disabled = false,
		file = $bindable(),
		existingFileUrl,
		removeExisting = $bindable(),
		class: className,
		...rest
	}: Omit<FileDropZoneProps, 'onUpload'> & {
		file: File | undefined;
		existingFileUrl?: string;
		removeExisting?: boolean;
	} = $props();

	let uploading = $state(false);

	// Accept PDF and common image formats
	const accept = 'application/pdf,image/*';
	const maxFileSize = 10 * MEGABYTE; // 10MB limit

	const shouldAcceptFile = (uploadFile: File): boolean => {
		const fileType = uploadFile.type.toLowerCase();
		const fileName = uploadFile.name.toLowerCase();

		// Check if it's a PDF
		if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
			return true;
		}

		// Check if it's an image
		if (fileType.startsWith('image/')) {
			return true;
		}

		return false;
	};

	const drop = async (
		e: DragEvent & {
			currentTarget: EventTarget & HTMLLabelElement;
		}
	) => {
		if (disabled || !canUploadFiles) return;

		e.preventDefault();

		const droppedFiles = Array.from(e.dataTransfer?.files ?? []);
		if (droppedFiles.length > 0) {
			await handleFileUpload(droppedFiles[0]);
		}
	};

	const change = async (
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		if (disabled) return;

		const selectedFiles = e.currentTarget.files;
		if (!selectedFiles || selectedFiles.length === 0) return;

		await handleFileUpload(selectedFiles[0]);

		// Reset input for re-upload of same file
		(e.target as HTMLInputElement).value = '';
	};

	const handleFileUpload = async (uploadFile: File) => {
		uploading = true;

		// Check file size
		if (uploadFile.size > maxFileSize) {
			toast.error(`File size too large. Maximum size is ${displaySize(maxFileSize)}.`);
			uploading = false;
			return;
		}

		// Check file type
		const isAcceptable = shouldAcceptFile(uploadFile);

		if (!isAcceptable) {
			toast.error('File type not allowed. Please upload a PDF or image file.');
			uploading = false;
			return false;
		}

		file = uploadFile;
		// Reset remove existing flag when new file is uploaded
		removeExisting = false;
		uploading = false;
	};

	const removeFile = () => {
		file = undefined;
		// If there's an existing file, mark it for removal
		if (existingFileUrl) {
			removeExisting = true;
		}
	};

	const canUploadFiles = $derived(!disabled && !uploading);

	const getFileIcon = (fileName: string) => {
		if (fileName.toLowerCase().endsWith('.pdf')) {
			return FileText;
		}
		return Image;
	};

	const displayFileName = $derived(
		file
			? file.name
			: existingFileUrl && !removeExisting
				? existingFileUrl.split('/').pop() || 'Unknown file'
				: null
	);
</script>

<div class="w-full">
	{#if file || (existingFileUrl && !removeExisting)}
		<div class="border-border bg-muted/25 flex items-center justify-between rounded-lg border p-4">
			<div class="flex min-w-0 flex-1 items-center gap-3">
				{#if file}
					{@const Icon = getFileIcon(file.name)}
					<Icon class="text-muted-foreground h-8 w-8 shrink-0" />
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium" title={file.name}>{file.name}</p>
						<p class="text-muted-foreground text-xs">{displaySize(file.size)}</p>
					</div>
				{:else if existingFileUrl && !removeExisting}
					{@const Icon = getFileIcon(existingFileUrl)}
					<Icon class="text-muted-foreground h-8 w-8 shrink-0" />
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium" title={displayFileName}>{displayFileName}</p>
						<p class="text-muted-foreground text-xs">Existing attachment</p>
					</div>
				{/if}
			</div>
			<button
				type="button"
				onclick={removeFile}
				{disabled}
				class="text-muted-foreground hover:text-destructive shrink-0 rounded-full p-1 transition-colors disabled:opacity-50"
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	{:else}
		<label
			ondragover={(e) => e.preventDefault()}
			ondrop={drop}
			for={id}
			aria-disabled={!canUploadFiles}
			class={cn(
				'border-border hover:bg-accent/25 flex h-32 w-full place-items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all hover:cursor-pointer aria-disabled:opacity-50 aria-disabled:hover:cursor-not-allowed',
				className
			)}
		>
			<div class="flex flex-col place-items-center justify-center gap-2">
				<div
					class="border-border text-muted-foreground flex size-12 place-items-center justify-center rounded-full border border-dashed"
				>
					<Upload class="size-5" />
				</div>
				<div class="flex flex-col gap-0.5 text-center">
					<span class="text-muted-foreground text-sm font-medium">
						Drop receipt here, or click to select
					</span>
					<span class="text-muted-foreground/75 text-xs">
						PDF or image files up to {displaySize(maxFileSize)}
					</span>
				</div>
			</div>
			<input
				{...rest}
				disabled={!canUploadFiles}
				{id}
				{accept}
				multiple={false}
				type="file"
				onchange={change}
				class="hidden"
			/>
		</label>
	{/if}
</div>
