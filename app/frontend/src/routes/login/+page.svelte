<script lang="ts">
	import LoginForm from '$feature/login/LoginForm.svelte';
	import { authStore } from '$lib/stores/auth.store';
</script>

<div class="bg-background flex w-full grow items-center justify-center gap-6 p-4 md:p-10">
	<div class=" w-full max-w-lg justify-center">
		<LoginForm oncomplete={(pin: string) => authStore.login(pin)} />
	</div>
</div>
