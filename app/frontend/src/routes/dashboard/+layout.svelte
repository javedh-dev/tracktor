<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';

	let { children } = $props();
</script>

<Header />
<main>
	{@render children()}
</main>
