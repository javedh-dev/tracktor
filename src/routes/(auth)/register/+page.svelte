<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$lib/config/env';
	import RegisterForm from '$lib/components/feature/auth/register-form.svelte';
	import { authStore } from '$stores/auth.svelte';
	import { onMount } from 'svelte';
	import Loading from '$lib/components/app/loading.svelte';

	let authCheckComplete = $state(false);

	onMount(async () => {
		if (env.DISABLE_AUTH) {
			goto('/dashboard', { replaceState: true });
			return;
		}

		await authStore.checkAuthStatus();
		authCheckComplete = true;

		if (authStore.isLoggedIn) goto('/dashboard', { replaceState: true });
		if (authStore.hasUsers) goto('/login', { replaceState: true });
	});
</script>

{#if !authCheckComplete}
	<Loading message="Checking authentication..." />
{:else}
	<RegisterForm />
{/if}
