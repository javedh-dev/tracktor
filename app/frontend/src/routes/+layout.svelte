<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '../styles/app.css';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { env } from '$env/dynamic/public';
	import { Jumper } from 'svelte-loading-spinners';
	import { Toaster } from '$lib/components/ui/sonner';
	import LabelWithIcon from '$lib/components/app/LabelWithIcon.svelte';
	import { navigating } from '$app/state';
	import Header from '$lib/components/layout/Header.svelte';
	import { authStore } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';

	let { children } = $props();
	let demoMode = env.PUBLIC_DEMO_MODE === 'true';

	authStore.subscribe((pin) => {
		console.log(pin);
		if (pin) goto('/dashboard', { replaceState: true });
	});
</script>

<ModeWatcher />
<Toaster position="bottom-right" richColors expand />

{#if demoMode}
	<div class="bg-secondary/95 flex flex-col justify-center p-2 lg:flex-row dark:border-b-amber-900">
		<LabelWithIcon
			icon={TriangleAlert}
			iconClass="h-5 w-5"
			style="text-amber-500 dark:text-amber-700 gap-1 flex-col lg:flex-row text-center"
		>
			This is a demo instance. Data will be reset periodically and is not saved permanently. Please
			avoid adding any persoanl info. <strong>Default PIN : 123456</strong>
		</LabelWithIcon>
	</div>
{/if}
{#if navigating.to}
	<div class="flex min-h-screen items-center justify-center">
		<Jumper size="64" color="var(--primary)" duration="2s" />
	</div>
{:else}
	<div class="flex min-h-svh w-full flex-col">
		<Header />
		{@render children()}
	</div>
{/if}
