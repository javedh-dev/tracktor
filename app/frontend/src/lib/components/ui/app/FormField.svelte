<script lang="ts">
	let {
		id,
		type = 'text',
		placeholder = '',
		value = $bindable(),
		icon = null,
		required = false,
		label = undefined,
		ariaLabel = '',
		disabled = false,
		inputClass = '',
		onInput = undefined
	} = $props();
	const Icon = icon;
</script>

<div>
	{#if label}
		<label for={id} class="pl-2 text-lg text-gray-400"
			>{label}<span class="pl-1 text-red-800">{required ? '*' : ''}</span></label
		>
	{/if}
	<div class="relative">
		<input
			{id}
			{type}
			bind:value
			{placeholder}
			class={`w-full rounded-xl border border-gray-300 bg-white py-3 pr-4 pl-12 text-gray-900 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400 ${inputClass}`}
			{required}
			aria-label={ariaLabel}
			{disabled}
			oninput={onInput}
			autocomplete="off"
			step=".01"
		/>
		{#if icon}
			<Icon
				class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500"
				aria-hidden="true"
			/>
		{/if}
	</div>
</div>

<style>
	::-webkit-calendar-picker-indicator {
		filter: contrast(0.2);
	}
</style>
