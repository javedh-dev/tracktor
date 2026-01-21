<script lang="ts">
	import { FieldGroup, Field, FieldLabel } from '$ui/field/index.js';
	import Input from '$appui/input.svelte';
	import { authStore } from '$stores/auth.svelte';
	import { goto } from '$app/navigation';
	import UserIcon from '@lucide/svelte/icons/circle-user-round';
	import RectangleEllipsis from '@lucide/svelte/icons/rectangle-ellipsis';
	import SubmitButton from '$appui/SubmitButton.svelte';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages';

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
			toast.error(m.auth_password_mismatch());
			confirmPassword = '';
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

<form id="auth-register-form" onsubmit={handleRegister}>
	<fieldset disabled={processing} class="w-full">
		<FieldGroup class="w-full">
			<Field>
				<FieldLabel for="email">{m.auth_username()}</FieldLabel>
				<Input
					id="email"
					icon={UserIcon}
					type="text"
					required
					bind:value={username}
					placeholder={m.auth_username_placeholder()}
				/>
			</Field>
			<Field>
				<FieldLabel for="password">{m.auth_password()}</FieldLabel>
				<Input
					id="password"
					type="password"
					required
					placeholder={m.auth_password_placeholder()}
					icon={RectangleEllipsis}
					bind:value={password}
				/>
			</Field>
			<Field>
				<FieldLabel for="confirm-password">{m.auth_confirm_password()}</FieldLabel>
				<Input
					id="confirm-password"
					type="password"
					required
					placeholder={m.auth_password_placeholder()}
					icon={RectangleEllipsis}
					bind:value={confirmPassword}
				/>
			</Field>
			<Field>
				<SubmitButton
					{processing}
					class="transition-all duration-300"
					loadingText={m.auth_signup_loading()}
				>
					{m.auth_signup_button()}
				</SubmitButton>
			</Field>
			<!-- <FieldDescription class="text-center">
			Already have an account? <a
				href={'/login'}
				class="transition-all duration-300 hover:underline">Sign in</a
			>
		</FieldDescription> -->
		</FieldGroup>
	</fieldset>
</form>
