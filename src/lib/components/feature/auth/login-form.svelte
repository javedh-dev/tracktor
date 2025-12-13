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
	let processing = $state(false);

	$effect(() => {
		// Check if users exist when component mounts
		authStore.checkAuthStatus();
	});

	const handleLogin = async (event: Event) => {
		event.preventDefault();
		if (!username || !password || processing) return;

		processing = true;
		try {
			const success = await authStore.login(username, password);
			if (success) {
				goto('/dashboard');
			}
		} finally {
			processing = false;
		}
	};
</script>

<form onsubmit={handleLogin}>
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
			<Button type="submit" disabled={processing} class="transition-all duration-300">
				{processing ? 'Signing in...' : 'Login'}
			</Button>
		</Field>
		<FieldDescription class="text-center">
			Don't have an account? <a
				href={'/register'}
				class="transition-all duration-300 hover:underline">Sign up</a
			>
		</FieldDescription>
	</FieldGroup>
</form>
