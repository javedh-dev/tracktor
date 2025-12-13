<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import LoginForm from '$feature/login/LoginForm.svelte';
	import { authStore } from '$stores/auth.svelte';

	$effect(() => {
		if (env.TRACKTOR_DISABLE_AUTH === 'true' || authStore.isLoggedIn) {
			goto('/dashboard', { replaceState: true });
		}
	});
</script>

<div class="bg-background flex w-full grow items-center justify-center gap-6 p-4 md:p-10">
	<div class=" w-full max-w-lg justify-center">
		<LoginForm oncomplete={(pin: string) => authStore.login(pin)} />
	</div>
</div>
