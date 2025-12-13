<script lang="ts">
	import { FieldGroup, Field, FieldLabel, FieldDescription } from '$ui/field/index.js';
	import Input from '$appui/input.svelte';
	import { Button } from '$ui/button/index.js';
	import { authStore } from '$stores/auth.svelte';
	import { goto } from '$app/navigation';
	import UserIcon from '@lucide/svelte/icons/circle-user-round';
	import RectangleEllipsis from '@lucide/svelte/icons/rectangle-ellipsis';

	const id = crypto.randomUUID();
	let username = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let processing = $state(false);

	$effect(() => {
		// Check if users exist when component mounts
		authStore.checkAuthStatus();
	});

	const handleRegister = async (event: Event) => {
		event.preventDefault();
		if (!username || !password || !confirmPassword || processing) return;

		if (password !== confirmPassword) {
			// You might want to add proper error handling here
			return;
		}

		processing = true;
		try {
			const success = await authStore.register(username, password);
			if (success) {
				goto('/dashboard');
			}
		} finally {
			processing = false;
		}
	};
</script>

<form onsubmit={handleRegister}>
	<FieldGroup class="w-full">
		<Field>
			<FieldLabel for="email-{id}">Username</FieldLabel>
			<Input
				id="email-{id}"
				icon={UserIcon}
				type="text"
				required
				bind:value={username}
				placeholder="username"
			/>
		</Field>
		<Field>
			<FieldLabel for="password-{id}">Password</FieldLabel>
			<Input
				id="password-{id}"
				type="password"
				required
				placeholder="********"
				icon={RectangleEllipsis}
				bind:value={password}
			/>
		</Field>
		<Field>
			<FieldLabel for="confirm-password-{id}">Confirm Password</FieldLabel>
			<Input
				id="confirm-password-{id}"
				type="password"
				required
				placeholder="********"
				icon={RectangleEllipsis}
				bind:value={confirmPassword}
			/>
		</Field>
		<Field>
			<Button type="submit" disabled={processing} class="transition-all duration-300">
				{processing ? 'Creating account...' : 'Sign up'}
			</Button>
		</Field>
		<FieldDescription class="text-center">
			Already have an account? <a
				href={'/login'}
				class="transition-all duration-300 hover:underline">Sign in</a
			>
		</FieldDescription>
	</FieldGroup>
</form>
