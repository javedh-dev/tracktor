<script lang="ts">
	import type { Component } from 'svelte';

	const {
		id = '',
		buttonStyles,
		iconStyles,
		onclick,
		icon: Icon,
		ariaLabel
	}: {
		buttonStyles: string;
		iconStyles: string;
		onclick: () => void;
		icon: Component;
		ariaLabel: string;
		id?: string;
	} = $props();
</script>

<button
	id="icon-button-{id || 'default'}"
	type="button"
	class={`icon-button cursor-pointer rounded-full p-2 transition-colors duration-300 ${buttonStyles}`}
	{onclick}
	aria-label={ariaLabel}
>
	<Icon class={`h-5 w-5 transition-colors duration-300 ${iconStyles}`} />
</button>
