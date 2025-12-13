<script lang="ts">
	import AppSheet from '$layout/AppSheet.svelte';
	import { configStore } from '$lib/stores/config.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		configStore.refreshConfigs();
	});
</script>

<main>
	{@render children()}
</main>

<AppSheet />
