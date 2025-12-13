<script lang="ts">
	import { cn } from '$lib/utils';
	import ShieldEllipsis from '@lucide/svelte/icons/shield-ellipsis';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import * as Card from '$ui/card';
	import * as Button from '$ui/button';
	import * as Form from '$ui/form';
	import { Input } from '$ui/input';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import { Jumper } from 'svelte-loading-spinners';
	import { authStore } from '$stores/auth.svelte';
	import { goto } from '$app/navigation';

	let { class: className = '', ...restProps } = $props();

	let username = $state('');
	let password = $state('');
	let processing = $state(false);
	let isRegistering = $state(false);

	$effect(() => {
		// Check if users exist when component mounts
		authStore.checkAuthStatus();
	});

	const handleLogin = async () => {
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

	const handleRegister = async () => {
		if (!username || !password || processing) return;

		processing = true;
		try {
			const success = await authStore.register(username, password);
			if (success) {
				isRegistering = false;
				username = '';
				password = '';
			}
		} finally {
			processing = false;
		}
	};

	const handleSubmit = (event: Event) => {
		event.preventDefault();
		if (isRegistering) {
			handleRegister();
		} else {
			handleLogin();
		}
	};
</script>

<Card.Root class={cn('flex flex-col items-center gap-6 py-12', className)} {...restProps}>
	<LabelWithIcon
		icon={isRegistering ? UserPlus : ShieldEllipsis}
		iconClass="lg:h-6 lg:w-6"
		label={isRegistering ? 'Create your account' : 'Sign in to your account'}
		style="gap-4"
	/>

	<form onsubmit={handleSubmit} class="w-full max-w-sm space-y-4">
		<div class="space-y-2">
			<label for="username" class="text-sm font-medium">Username</label>
			<Input
				id="username"
				type="text"
				bind:value={username}
				placeholder="Enter your username"
				disabled={processing}
				required
			/>
		</div>

		<div class="space-y-2">
			<label for="password" class="text-sm font-medium">Password</label>
			<Input
				id="password"
				type="password"
				bind:value={password}
				placeholder="Enter your password"
				disabled={processing}
				required
			/>
		</div>

		<Button.Root type="submit" class="w-full" disabled={processing || !username || !password}>
			{#if processing}
				<Jumper size="16" color="currentColor" duration="1s" />
			{:else}
				{isRegistering ? 'Create Account' : 'Sign In'}
			{/if}
		</Button.Root>
	</form>

	{#if !authStore.hasUsers}
		<p class="text-muted-foreground text-center text-sm">
			No users found. Create the first account to get started.
		</p>
	{:else if !isRegistering}
		<Button.Root variant="ghost" onclick={() => (isRegistering = true)} disabled={processing}>
			Need an account? Register here
		</Button.Root>
	{:else}
		<Button.Root variant="ghost" onclick={() => (isRegistering = false)} disabled={processing}>
			Already have an account? Sign in
		</Button.Root>
	{/if}
</Card.Root>
