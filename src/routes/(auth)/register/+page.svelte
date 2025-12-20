<script lang="ts">
	import { goto } from '$app/navigation';
	import RegisterForm from '$lib/components/feature/auth/register-form.svelte';
	import { authStore } from '$stores/auth.svelte';
	import { onMount } from 'svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	let authCheckComplete = $state(false);

	onMount(async () => {
		await authStore.checkAuthStatus();
		authCheckComplete = true;

		if (authStore.isLoggedIn) goto('/dashboard', { replaceState: true });
		if (authStore.hasUsers) goto('/login', { replaceState: true });
	});
</script>

{#if !authCheckComplete}
	<div id="register-loading-content" class="w-full space-y-6">
		<div id="register-loading-field-1" class="space-y-2">
			<Skeleton class="h-4 w-20" />
			<Skeleton class="h-10 w-full" />
		</div>
		<div id="register-loading-field-2" class="space-y-2">
			<Skeleton class="h-4 w-16" />
			<Skeleton class="h-10 w-full" />
		</div>
		<div id="register-loading-field-3" class="space-y-2">
			<Skeleton class="h-4 w-28" />
			<Skeleton class="h-10 w-full" />
		</div>
		<Skeleton id="register-loading-button" class="h-10 w-full" />
	</div>
{:else}
	<RegisterForm />
{/if}
