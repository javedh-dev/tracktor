<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$lib/config/env';
	import LoginForm from '$feature/auth/login-form.svelte';
	import { authStore } from '$stores/auth.svelte';
	import { onMount } from 'svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	let authCheckComplete = $state(false);

	onMount(async () => {
		if (env.DISABLE_AUTH) {
			goto('/dashboard', { replaceState: true });
			return;
		}
		await authStore.checkAuthStatus();
		authCheckComplete = true;

		if (authStore.isLoggedIn) goto('/dashboard', { replaceState: true });
		if (!authStore.hasUsers) goto('/register', { replaceState: true });
	});
</script>

{#if !authCheckComplete}
	<div id="login-loading-content" class="w-full space-y-6">
		<div id="login-loading-field-1" class="space-y-2">
			<Skeleton class="h-4 w-20" />
			<Skeleton class="h-10 w-full" />
		</div>
		<div id="login-loading-field-2" class="space-y-2">
			<Skeleton class="h-4 w-16" />
			<Skeleton class="h-10 w-full" />
		</div>
		<Skeleton id="login-loading-button" class="h-10 w-full" />
	</div>
{:else}
	<LoginForm />
{/if}
