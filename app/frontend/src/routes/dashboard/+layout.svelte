<script lang="ts">
	import AppSheet from '$lib/components/layout/AppSheet.svelte';

	let { children } = $props();
</script>

<main>
	{@render children()}
</main>

<AppSheet />
