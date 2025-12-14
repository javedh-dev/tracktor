<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$stores/auth.svelte';
	import { onMount } from 'svelte';
	import { env } from '$lib/config/env';
	import Loading from '$ui/loading.svelte';

	let authCheckComplete = $state(false);

	onMount(async () => {
		if (env.DISABLE_AUTH) {
			goto('/dashboard', { replaceState: true });
			return;
		}

		await authStore.checkAuthStatus();
		authCheckComplete = true;

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
