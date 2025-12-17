<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$lib/config/env';
	import RegisterForm from '$lib/components/feature/auth/register-form.svelte';
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
		if (authStore.hasUsers) goto('/login', { replaceState: true });
	});
</script>

{#if !authCheckComplete}
	<div class="w-full space-y-6">
		<div class="space-y-2">
			<Skeleton class="h-4 w-20" />
			<Skeleton class="h-10 w-full" />
		</div>
		<div class="space-y-2">
			<Skeleton class="h-4 w-16" />
			<Skeleton class="h-10 w-full" />
		</div>
		<div class="space-y-2">
			<Skeleton class="h-4 w-28" />
			<Skeleton class="h-10 w-full" />
		</div>
		<Skeleton class="h-10 w-full" />
	</div>
{:else}
	<RegisterForm />
{/if}
