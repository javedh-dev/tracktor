<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import LoginForm from '$feature/auth/login-form.svelte';
	import { authStore } from '$stores/auth.svelte';
	import { onMount } from 'svelte';
	import Loading from '$ui/loading.svelte';

	let authCheckComplete = $state(false);

	onMount(async () => {
		// If auth is disabled, go straight to dashboard
		if (env.TRACKTOR_DISABLE_AUTH === 'true') {
			goto('/dashboard', { replaceState: true });
			return;
		}

		// Wait for auth status check to complete
		await authStore.checkAuthStatus();
		authCheckComplete = true;

		// If already logged in, redirect to dashboard
		if (authStore.isLoggedIn) {
			goto('/dashboard', { replaceState: true });
		}
	});
</script>

{#if !authCheckComplete}
	<Loading message="Checking authentication..." />
{:else}
	<LoginForm />
{/if}
