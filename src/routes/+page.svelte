<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$stores/auth.svelte';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import Loading from '$ui/loading.svelte';

	let authCheckComplete = $state(false);

	// Use onMount to avoid race conditions with navigation
	onMount(async () => {
		// If auth is disabled, go straight to dashboard
		if (env.TRACKTOR_DISABLE_AUTH === 'true') {
			goto('/dashboard', { replaceState: true });
			return;
		}

		// Wait for auth status check to complete
		await authStore.checkAuthStatus();
		authCheckComplete = true;

		// Now redirect based on auth status
		if (authStore.isLoggedIn) {
			goto('/dashboard', { replaceState: true });
		} else {
			goto('/login', { replaceState: true });
		}
	});
</script>

{#if !authCheckComplete}
	<Loading message="Checking authentication..." />
{/if}
