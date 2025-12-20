<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import Input from '$appui/input.svelte';
	import IconButton from '$appui/IconButton.svelte';

	interface CustomField {
		key: string;
		value: string;
	}

	let { customFields = $bindable() }: { customFields?: Record<string, string> | null } = $props();

	let fields: CustomField[] = $state([]);
	let lastCustomFieldsRef: Record<string, string> | null | undefined = undefined;

	// Initialize fields when component mounts or when customFields prop changes from parent
	$effect(() => {
		if (customFields !== lastCustomFieldsRef) {
			lastCustomFieldsRef = customFields;
			fields = Object.entries(customFields || {}).map(([key, value]) => ({
				key,
				value: value || ''
			}));
		}
	});

	const updateCustomFields = () => {
		const updated: Record<string, string> = {};
		fields.forEach(({ key, value }) => {
			if (key.trim()) {
				updated[key.trim()] = value;
			}
		});
		const newValue = Object.keys(updated).length > 0 ? updated : null;

		// Only update if value actually changed
		if (JSON.stringify(newValue) !== JSON.stringify(customFields)) {
			customFields = newValue;
			lastCustomFieldsRef = newValue;
		}
	};

	const addField = () => {
		fields = [...fields, { key: '', value: '' }];
	};

	const removeField = (index: number) => {
		fields = fields.filter((_, i) => i !== index);
		updateCustomFields();
	};
</script>

<div class="space-y-2">
	<div class="flex items-center justify-between">
		<label for="custom-fields-section" class="text-sm font-medium">Custom Fields</label>
		<button
			type="button"
			onclick={addField}
			class="text-primary hover:text-primary/80 flex items-center gap-1 text-xs"
		>
			<Plus size={14} />
			Add Field
		</button>
	</div>

	<div id="custom-fields-section" class="space-y-2">
		{#each fields as field, index (index)}
			<div class="flex gap-2">
				<Input
					type="text"
					placeholder="Field name"
					bind:value={field.key}
					onchange={() => updateCustomFields()}
					class="flex-1"
					disabled={false}
				/>
				<Input
					type="text"
					placeholder="Field value"
					bind:value={field.value}
					onchange={() => updateCustomFields()}
					class="flex-1"
					disabled={false}
				/>
				<IconButton
					icon={X}
					onclick={() => removeField(index)}
					ariaLabel="Remove field"
					buttonStyles="hover:bg-red-100 dark:hover:bg-red-700"
					iconStyles="text-red-500"
				/>
			</div>
		{/each}
	</div>

	{#if fields.length === 0}
		<p class="text-muted-foreground text-xs">
			No custom fields added. Click "Add Field" to get started.
		</p>
	{/if}
</div>
