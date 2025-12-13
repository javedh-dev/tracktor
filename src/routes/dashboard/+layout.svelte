<script lang="ts">
	import AppSheet from '$layout/AppSheet.svelte';

	let { children } = $props();
</script>

<main>
	{@render children()}
</main>

<AppSheet />
