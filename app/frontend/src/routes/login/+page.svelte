<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import LoginForm from '$feature/login/LoginForm.svelte';
	import { verifyPin } from '$services/auth.service';
	import { toast } from 'svelte-sonner';

	const oncomplete = async (pin: string) => {
		const verified = await verifyPin(pin);
		if (verified) {
			if (browser) {
				localStorage.setItem('userPin', pin);
			}
			toast.success('Login Successfull...!');
			goto('/dashboard', { replaceState: true });
		} else {
			toast.error('Incorrect Pin. Please try again...!');
		}
	};
</script>

<div class="bg-background flex w-full grow items-center justify-center gap-6 p-4 md:p-10">
	<div class=" w-full max-w-lg justify-center">
		<LoginForm {oncomplete} />
	</div>
</div>
