<script lang="ts">
	import { cn } from '$lib/utils.js';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import { displaySize } from '.';
	import { useId } from 'bits-ui';
	import type { FileDropZoneProps, FileRejectedReason } from './types';

	let {
		id = useId(),
		children,
		maxFiles,
		maxFileSize,
		fileCount,
		disabled = false,
		onUpload,
		onFileRejected,
		accept,
		class: className,
		...rest
	}: FileDropZoneProps = $props();

	$effect(() => {
		const currentMaxFiles = maxFiles;
		const currentFileCount = fileCount;
		if (currentMaxFiles !== undefined && currentFileCount === undefined) {
			console.warn(
				'Make sure to provide FileDropZone with `fileCount` when using the `maxFiles` prompt'
			);
		}
	});

	let uploading = $state(false);

	const drop = async (
		e: DragEvent & {
			currentTarget: EventTarget & HTMLLabelElement;
		}
	) => {
		if (disabled || !canUploadFiles) return;

		e.preventDefault();

		const droppedFiles = Array.from(e.dataTransfer?.files ?? []);

		await upload(droppedFiles);
	};

	const change = async (
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		if (disabled) return;

		const selectedFiles = e.currentTarget.files;

		if (!selectedFiles) return;

		await upload(Array.from(selectedFiles));

		// this if a file fails and we upload the same file again we still get feedback
		(e.target as HTMLInputElement).value = '';
	};

	const shouldAcceptFile = (file: File, fileNumber: number): FileRejectedReason | undefined => {
		if (maxFileSize !== undefined && file.size > maxFileSize) return 'Maximum file size exceeded';

		if (maxFiles !== undefined && fileNumber > maxFiles) return 'Maximum files uploaded';

		if (!accept) return undefined;

		const acceptedTypes = accept.split(',').map((a) => a.trim().toLowerCase());
		const fileType = file.type.toLowerCase();
		const fileName = file.name.toLowerCase();

		const isAcceptable = acceptedTypes.some((pattern) => {
			// check extension like .mp4
			if (fileType.startsWith('.')) {
				return fileName.endsWith(pattern);
			}

			// if pattern has wild card like video/*
			if (pattern.endsWith('/*')) {
				const baseType = pattern.slice(0, pattern.indexOf('/*'));
				return fileType.startsWith(baseType + '/');
			}

			// otherwise it must be a specific type like video/mp4
			return fileType === pattern;
		});

		if (!isAcceptable) return 'File type not allowed';

		return undefined;
	};

	const upload = async (uploadFiles: File[]) => {
		uploading = true;

		const validFiles: File[] = [];

		for (let i = 0; i < uploadFiles.length; i++) {
			const file = uploadFiles[i];

			const currentFileCount = fileCount ?? 0;
			const rejectedReason = shouldAcceptFile(file, currentFileCount + i + 1);

			if (rejectedReason) {
				onFileRejected?.({ file, reason: rejectedReason });
				continue;
			}

			validFiles.push(file);
		}

		await onUpload(validFiles);

		uploading = false;
	};

	const canUploadFiles = $derived(() => {
		const currentMaxFiles = maxFiles;
		const currentFileCount = fileCount;
		return (
			!disabled &&
			!uploading &&
			!(
				currentMaxFiles !== undefined &&
				currentFileCount !== undefined &&
				currentFileCount >= currentMaxFiles
			)
		);
	});
</script>

<label
	ondragover={(e) => e.preventDefault()}
	ondrop={drop}
	for={id}
	aria-disabled={!canUploadFiles}
	class={cn(
		'border-border hover:bg-accent/25 flex h-48 w-full place-items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all hover:cursor-pointer aria-disabled:opacity-50 aria-disabled:hover:cursor-not-allowed',
		className
	)}
>
	{#if children}
		{@render children()}
	{:else}
		<div class="flex flex-col place-items-center justify-center gap-2">
			<div
				class="border-border text-muted-foreground flex size-14 place-items-center justify-center rounded-full border border-dashed"
			>
				<UploadIcon class="size-7" />
			</div>
			<div class="flex flex-col gap-0.5 text-center">
				<span class="text-muted-foreground font-medium">
					Drag 'n' drop files here, or click to select files
				</span>
				{#if maxFiles || maxFileSize}
					{@const currentMaxFiles = maxFiles}
					{@const currentMaxFileSize = maxFileSize}
					<span class="text-muted-foreground/75 text-sm">
						{#if currentMaxFiles}
							<span>You can upload {currentMaxFiles} files</span>
						{/if}
						{#if currentMaxFiles && currentMaxFileSize}
							<span>(up to {displaySize(currentMaxFileSize)} each)</span>
						{/if}
						{#if currentMaxFileSize && !currentMaxFiles}
							<span>Maximum size {displaySize(currentMaxFileSize)}</span>
						{/if}
					</span>
				{/if}
			</div>
		</div>
	{/if}
	<input
		{...rest}
		disabled={!canUploadFiles}
		{id}
		{accept}
		multiple={(() => {
			const currentMaxFiles = maxFiles;
			const currentFileCount = fileCount ?? 0;
			return currentMaxFiles === undefined || currentMaxFiles - currentFileCount > 1;
		})()}
		type="file"
		onchange={change}
		class="hidden"
	/>
</label>
