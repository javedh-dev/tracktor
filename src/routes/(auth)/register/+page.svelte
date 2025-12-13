<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import RegisterForm from '$lib/components/feature/auth/register-form.svelte';
	import { authStore } from '$stores/auth.svelte';

	$effect(() => {
		if (env.TRACKTOR_DISABLE_AUTH === 'true' || authStore.isLoggedIn) {
			goto('/dashboard', { replaceState: true });
		}
	});
</script>

<RegisterForm />
