<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import { onMount } from 'svelte';

	// Use onMount to avoid race conditions with navigation
	onMount(() => {
		if (authStore.isLoggedIn) {
			goto('/dashboard', { replaceState: true });
		} else {
			goto('/login', { replaceState: true });
		}
	});
</script>
