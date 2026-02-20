<!--
	Universal File Drop Zone Component
	Supports images (PNG, JPEG, WebP) and PDFs with preview functionality
	Compatible with existing ImageDropZone and FuelAttachmentDropZone interfaces
-->

<script lang="ts">
	import { cn } from '$lib/utils';
	import { displaySize, MEGABYTE } from '$lib/components/ui/file-drop-zone';
	import { useId } from 'bits-ui';
	import { toast } from 'svelte-sonner';
	import Upload from '@lucide/svelte/icons/upload';
	import X from '@lucide/svelte/icons/x';
	import FileText from '@lucide/svelte/icons/file-text';
	import Image from '@lucide/svelte/icons/image';
	import * as m from '$lib/paraglide/messages';

	import AttachmentLink from '$lib/components/app/AttachmentLink.svelte';

	interface Props {
		id?: string;
		disabled?: boolean;
		class?: string;
		file?: File;
		existingFileUrl?: string;
		existingImageUrl?: string; // For ImageDropZone compatibility
		removeExisting?: boolean;
		accept?: string;
		maxFileSize?: number;
		placeholder?: string;
		onFileSelect?: (file: File | undefined) => void;
		showPreview?: boolean;
		variant?: 'image' | 'attachment' | 'auto';
	}

	let {
		id = useId(),
		disabled = false,
		class: className,
		file = $bindable(),
		existingFileUrl,
		existingImageUrl,
		removeExisting = $bindable(),
		accept = 'image/*,.pdf',
		maxFileSize = 10 * MEGABYTE, // 10MB default
		placeholder,
		onFileSelect,
		showPreview = true,
		variant = 'auto',
		...rest
	}: Props = $props();

	const inputId = $derived(id);
	const labelId = $derived(`${inputId}-label`);

	let uploading = $state(false);
	let previewSrc = $state<string>();
	let fileType = $state<'image' | 'pdf' | 'unknown'>('unknown');

	// Use existingImageUrl for backward compatibility with ImageDropZone
	const effectiveExistingUrl = $derived(existingImageUrl || existingFileUrl);
	const effectivePlaceholder = $derived(
		placeholder ||
			(variant === 'image'
				? m.dropzone_placeholder_image()
				: variant === 'attachment'
					? m.dropzone_placeholder_attachment()
					: m.dropzone_placeholder_default())
	);

	$effect(() => {
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				previewSrc = e.target?.result as string;
				fileType = getFileType(file!);
			};
			reader.readAsDataURL(file);
		} else if (effectiveExistingUrl && !removeExisting) {
			previewSrc = effectiveExistingUrl;
			fileType = getFileTypeFromUrl(effectiveExistingUrl);
		} else {
			previewSrc = undefined;
			fileType = 'unknown';
		}
	});

	const getFileType = (file: File): 'image' | 'pdf' | 'unknown' => {
		if (file.type.startsWith('image/')) return 'image';
		if (file.type === 'application/pdf') return 'pdf';
		return 'unknown';
	};

	const getFileTypeFromUrl = (url: string): 'image' | 'pdf' | 'unknown' => {
		const extension = url.split('.').pop()?.toLowerCase();
		if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) return 'image';
		if (extension === 'pdf') return 'pdf';
		return 'unknown';
	};

	const drop = async (
		e: DragEvent & {
			currentTarget: EventTarget & HTMLLabelElement;
		}
	) => {
		if (!canUploadFiles) return;
		e.preventDefault();

		const droppedFiles = Array.from(e.dataTransfer?.files ?? []);

		if (droppedFiles.length > 1) {
			toast.error(m.dropzone_error_single_file());
			return;
		}

		await upload(droppedFiles[0]);
	};

	const change = async (
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		const selectedFiles = e.currentTarget.files;

		if (!selectedFiles || selectedFiles.length !== 1 || selectedFiles.item(0) === null) {
			toast.error(m.dropzone_error_single_file());
			return;
		} else {
			await upload(selectedFiles.item(0));
		}

		// Reset input to allow re-uploading the same file
		(e.target as HTMLInputElement).value = '';
	};

	const shouldAcceptFile = (file: File): boolean => {
		// Check file size
		if (maxFileSize && file.size > maxFileSize) {
			toast.error(m.dropzone_error_file_size({ size: displaySize(maxFileSize) }));
			return false;
		}

		// Parse accept attribute
		const acceptedTypes = accept.split(',').map((type) => type.trim());
		const fileType = file.type.toLowerCase();
		const fileName = file.name.toLowerCase();

		const isAcceptable = acceptedTypes.some((pattern) => {
			// Handle file extensions like .pdf, .jpg
			if (pattern.startsWith('.')) {
				return fileName.endsWith(pattern.toLowerCase());
			}

			// Handle MIME type wildcards like image/*
			if (pattern.endsWith('/*')) {
				const baseType = pattern.slice(0, pattern.indexOf('/*'));
				return fileType.startsWith(baseType + '/');
			}

			// Handle specific MIME types like application/pdf
			return fileType === pattern.toLowerCase();
		});

		if (!isAcceptable) {
			toast.error(m.dropzone_error_file_type());
			return false;
		}

		return true;
	};

	const upload = async (uploadFile: File | undefined | null) => {
		if (!uploadFile) return;

		uploading = true;

		if (shouldAcceptFile(uploadFile)) {
			// Clear existing preview immediately to prevent flash
			previewSrc = undefined;
			file = uploadFile;
			// Reset remove existing flag when new file is uploaded
			if (removeExisting !== undefined) {
				removeExisting = false;
			}
			onFileSelect?.(uploadFile);
		}

		uploading = false;
	};

	const removeFile = () => {
		file = undefined;
		fileType = 'unknown';
		// If there's an existing file, mark it for removal
		if (effectiveExistingUrl && removeExisting !== undefined) {
			removeExisting = true;
		}
		// Clear preview immediately
		previewSrc = undefined;
		onFileSelect?.(undefined);
	};

	const getFileIcon = (fileName: string) => {
		if (fileName.toLowerCase().endsWith('.pdf')) {
			return FileText;
		}
		return Image;
	};

	const displayFileName = $derived(
		file
			? file.name
			: effectiveExistingUrl && !removeExisting
				? effectiveExistingUrl.split('/').pop() || m.dropzone_unknown_file()
				: null
	);

	// Determine if we should show file content
	const shouldShowFile = $derived(
		(file && previewSrc) || (effectiveExistingUrl && !removeExisting && previewSrc)
	);

	const canUploadFiles = $derived(!disabled && !uploading);
</script>

<div id="file-drop-zone-container" class="w-full min-w-0">
	{#if shouldShowFile}
		<!-- File is selected - show based on file type -->
		{#if fileType === 'image' && previewSrc && showPreview}
			<!-- Always show image preview for images -->
			<div
				id="file-preview-image"
				class="file-preview border-border relative h-48 w-full overflow-hidden rounded-lg border-2 border-dashed"
			>
				<img src={previewSrc} alt="Uploaded" class="h-full w-full object-cover" />
				<button
					type="button"
					id="file-preview-remove-btn"
					onclick={removeFile}
					class="bg-accent/20 text-accent-foreground hover:bg-accent absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full p-1 shadow-md transition-colors"
				>
					<X class="h-4 w-4" />
				</button>
			</div>
		{:else}
			<!-- Always show file info for non-images -->
			<div
				id="file-info-container"
				class="border-border bg-muted/25 grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border p-4"
			>
				{#if file}
					{@const Icon = getFileIcon(file.name)}
					<Icon id="file-icon" class="text-muted-foreground h-8 w-8" />
					<div id="file-info" class="min-w-0">
						<p id="file-name" class="truncate text-sm font-medium" title={file.name}>
							{file.name}
						</p>
						<p id="file-size" class="text-muted-foreground text-xs">{displaySize(file.size)}</p>
					</div>
				{:else if effectiveExistingUrl && !removeExisting}
					{@const Icon = getFileIcon(effectiveExistingUrl)}
					<Icon id="existing-file-icon" class="text-muted-foreground h-8 w-8" />
					<div id="existing-file-info" class="min-w-0">
						<AttachmentLink fileName={displayFileName || ''}>
							<span class="block truncate text-sm font-medium" title={displayFileName}>
								{displayFileName}
							</span>
						</AttachmentLink>
						<p id="existing-file-note" class="text-muted-foreground text-xs">
							{m.file_drop_existing_note()}
						</p>
					</div>
				{/if}
				<button type="button" id="file-remove-btn" onclick={removeFile} {disabled}>
					<X class="h-4 w-4" />
				</button>
			</div>
		{/if}
	{:else}
		<!-- Drop zone for new uploads -->
		<label
			id={labelId}
			ondragover={(e) => e.preventDefault()}
			ondrop={drop}
			for={inputId}
			aria-disabled={!canUploadFiles}
			class={cn(
				'border-border hover:bg-accent/25 file-drop-zone flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-all aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
				variant === 'attachment' ? 'h-32 p-6' : 'h-48 p-4',
				className
			)}
		>
			{#if variant === 'attachment'}
				<!-- Attachment style drop zone -->
				<div
					id="file-drop-zone-attachment"
					class="flex w-full flex-col items-center justify-center gap-2 overflow-hidden"
				>
					<div
						id="file-drop-zone-icon"
						class="border-border text-muted-foreground flex size-12 items-center justify-center rounded-full border border-dashed"
					>
						<Upload class="size-5" />
					</div>
					<div
						id="file-drop-zone-text"
						class="flex w-full flex-col gap-0.5 overflow-hidden text-center"
					>
						<span
							id="file-drop-zone-placeholder"
							class="text-muted-foreground truncate text-sm font-medium"
						>
							{effectivePlaceholder}
						</span>
						<span id="file-drop-zone-details" class="text-muted-foreground/75 truncate text-xs">
							{m.dropzone_hint_accept_limit({
								types: accept.replace(/,/g, ', '),
								size: displaySize(maxFileSize)
							})}
						</span>
					</div>
				</div>
			{:else}
				<!-- Image style drop zone -->
				<div
					id="file-drop-zone-image"
					class="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden text-center"
				>
					{#if uploading}
						<div
							id="file-upload-spinner"
							class="border-primary h-8 w-8 animate-spin rounded-full border-b-2"
						></div>
						<p id="file-uploading-text" class="text-sm">{m.dropzone_uploading()}</p>
					{:else}
						<Upload class="mb-2 h-4 w-4" />
						<p id="file-drop-zone-instruction" class="truncate text-sm">{effectivePlaceholder}</p>
						{#if variant !== 'image'}
							<p id="file-accepted-types" class="text-muted-foreground truncate text-xs">
								{m.dropzone_supports({ types: accept.replace(/,/g, ', ') })}
							</p>
							{#if maxFileSize}
								<p id="file-max-size" class="text-muted-foreground text-xs">
									{m.dropzone_max_size({ size: displaySize(maxFileSize) })}
								</p>
							{/if}
						{/if}
					{/if}
				</div>
			{/if}
			<input
				{...rest}
				disabled={!canUploadFiles}
				id={inputId}
				{accept}
				multiple={false}
				type="file"
				onchange={change}
				class="hidden"
			/>
		</label>
	{/if}
</div>
