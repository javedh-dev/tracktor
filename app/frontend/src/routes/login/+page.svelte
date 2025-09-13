<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import LoginForm from '$feature/login/LoginForm.svelte';
	import ThemeToggle from '$appui/ThemeToggle.svelte';
	import { verifyPin } from '$services/auth.service';
	import { simulateNetworkDelay } from '$helper/dev';
	import { toast } from 'svelte-sonner';

	const oncomplete = (pin: string) => {
		console.log(pin);
		verifyPin(pin).then(async (verified) => {
			if (verified) {
				if (browser) {
					localStorage.setItem('userPin', pin);
				}
				toast.success('Login Successfull...!');
				await simulateNetworkDelay(300);
				goto('/dashboard', { replaceState: true });
			} else {
				toast.error('Incorrect Pin. Please try again...!');
			}
		});
	};
</script>

<div class="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
	<div class="w-full max-w-lg">
		<div class="absolute top-16 right-12">
			<ThemeToggle />
		</div>
		<LoginForm {oncomplete} />
	</div>
</div>
