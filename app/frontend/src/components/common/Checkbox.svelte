<script lang="ts">
	let {
		id,
		checked = $bindable(),
		icon = null,
		label = undefined,
		ariaLabel = '',
		disabled = false,
		inputClass = '',
		onInput = undefined
	} = $props();
	const Icon = icon;
</script>

<div class="flex flex-row items-center space-x-4 pl-2">
	<input
		{id}
		type="checkbox"
		bind:checked
		class={`rounded-sm border border-gray-300 p-2 text-blue-500 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400 ${inputClass}`}
		aria-label={ariaLabel}
		{disabled}
		oninput={onInput}
	/>
	{#if label}
		<label for={id} class="flex flex-row items-center gap-2 pl-1 text-lg text-gray-400">
			{#if icon}
				<Icon class="inline-block h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
			{/if}
			{label}
		</label>
	{/if}
</div>
