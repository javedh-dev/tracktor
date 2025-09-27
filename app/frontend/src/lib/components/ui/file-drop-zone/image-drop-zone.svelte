<!--
	Installed from @ieedan/shadcn-svelte-extras
-->

<script lang="ts">
	import { cn } from '$lib/utils';
	import { displaySize } from '.';
	import { useId } from 'bits-ui';
	import type { FileDropZoneProps } from './types';
	import { toast } from 'svelte-sonner';
	import Upload from '@lucide/svelte/icons/upload';
	import SquarePen from '@lucide/svelte/icons/square-pen';

	let {
		id = useId(),
		children,
		// onSelect,
		disabled = false,
		class: className,
		file = $bindable(),
		...rest
	}: Omit<FileDropZoneProps, 'onUpload'> & {
		file: File | undefined;
		// onSelect: (file: File) => Promise<void>;
	} = $props();

	let uploading = $state(false);
	let imageSrc = $state<string>();

	$effect(() => {
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				imageSrc = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	});

	const drop = async (
		e: DragEvent & {
			currentTarget: EventTarget & HTMLLabelElement;
		}
	) => {
		if (!canUploadFiles) return;
		e.preventDefault();

		const droppedFiles = Array.from(e.dataTransfer?.files ?? []);

		if (droppedFiles.length > 1) {
			toast.error('Please upload only one image.');
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

		if (!selectedFiles || selectedFiles.length != 1 || selectedFiles.item(0) === null) {
			toast.error('Please upload only one image.');
			return;
		} else {
			await upload(selectedFiles.item(0));
		}

		// this if a file fails and we upload the same file again we still get feedback
		(e.target as HTMLInputElement).value = '';
	};

	const shouldAcceptFile = (file: File): boolean => {
		const maxFileSize = 5 * 1024 * 1024;
		if (maxFileSize && file.size > maxFileSize) {
			toast.error(`File size exceeds the maximum limit of ${displaySize(maxFileSize)}.`);
			return false;
		}

		const acceptedTypes = ['image/png', 'image/jpeg', '.png', '.jpg', '.jpeg'];
		const fileType = file.type.toLowerCase();
		const fileName = file.name.toLowerCase();

		const isAcceptable = acceptedTypes.some((pattern) => {
			if (fileType.startsWith('.')) {
				return fileName.endsWith(pattern);
			}

			if (pattern.endsWith('/*')) {
				const baseType = pattern.slice(0, pattern.indexOf('/*'));
				return fileType.startsWith(baseType + '/');
			}

			// otherwise it must be a specific type like video/mp4
			return fileType === pattern;
		});

		if (!isAcceptable) {
			toast.error('File type not allowed. Please upload an image file.');
			return false;
		}

		return true;
	};

	const upload = async (uploadFile: File | null) => {
		console.log({ uploadFile });
		if (!uploadFile) return;

		uploading = true;

		const validFile: File = uploadFile;

		if (shouldAcceptFile(uploadFile)) file = validFile;

		uploading = false;
	};

	const canUploadFiles = $derived(!disabled && !uploading && !imageSrc);
</script>

<label
	ondragover={(e) => e.preventDefault()}
	ondrop={drop}
	for={id}
	aria-disabled={!canUploadFiles}
	class={cn(
		'border-border hover:bg-accent/25 flex h-48 w-full place-items-center justify-center rounded-lg border-2 border-dashed transition-all hover:cursor-pointer aria-disabled:opacity-50 aria-disabled:hover:cursor-not-allowed',
		className
	)}
>
	{#if imageSrc}
		<div class="relative h-full w-full overflow-hidden rounded-lg">
			<img
				src={imageSrc}
				alt="Uploaded"
				class="h-full w-full rounded-lg object-cover transition-all duration-300"
			/>
			<SquarePen
				class="bg-accent absolute top-2 right-2 h-8 w-8 cursor-pointer rounded-full p-2 shadow-md"
				onclick={() => (imageSrc = undefined)}
			/>
		</div>
	{:else}
		<div
			class="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2 text-center"
		>
			<Upload class="mb-2 h-4 w-4" />
			<p class="text-sm">Click or drag image to upload</p>
		</div>
	{/if}
	<input
		{...rest}
		disabled={!canUploadFiles}
		{id}
		accept="image/png,image/jpeg,.png,.jpg,.jpeg"
		multiple={false}
		type="file"
		onchange={change}
		class="hidden"
	/>
</label>
