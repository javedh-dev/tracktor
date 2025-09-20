<script lang="ts">
	import type { Component } from 'svelte';
	import { Jumper } from 'svelte-loading-spinners';

	const {
		text,
		type,
		variant,
		icon: Icon = undefined,
		loading = false,
		onclick = () => {}
	}: {
		text: string;
		type: 'submit' | 'button';
		variant: 'primary' | 'hero';
		icon?: Component;
		loading?: boolean;
		onclick?: () => void;
	} = $props();
	const getVariantStyles = () => {
		switch (variant) {
			case 'hero':
				return `border-gray-200 bg-gray-200 text-gray-900 hover:bg-gray-200 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800`;
			case 'primary':
				return `border-blue-700 bg-blue-700 text-gray-100 hover:bg-blue-800 dark:border-blue-800 dark:bg-blue-800 dark:text-gray-50 dark:hover:bg-blue-900`;
		}
	};
</script>

<div class="flex justify-center">
	{#if !loading}
		<button
			{type}
			class={`flex min-w-36 cursor-pointer items-center justify-center gap-2 rounded-full border-2 px-4 py-2 shadow-lg 
			transition-all duration-300 hover:shadow-xl focus:border-blue-600 dark:shadow-black ${getVariantStyles()}`}
			{onclick}
		>
			{#if Icon}
				<Icon class="h-4 w-4" />
			{/if}
			{text}
		</button>
	{:else}
		<Jumper size="40" color="#155dfc" unit="px" duration="2s" />
	{/if}
</div>
