<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '../styles/app.css';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { Jumper } from 'svelte-loading-spinners';
	import { Toaster } from '$ui/sonner';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import { navigating } from '$app/state';
	import Header from '$layout/Header.svelte';
	import { configStore } from '$stores/config.svelte';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { toast } from 'svelte-sonner';

	let { children } = $props();
	let demoMode = env.TRACKTOR_DEMO_MODE === 'true';

	async function detectSWUpdate() {
		const registrations = await navigator?.serviceWorker?.ready;
		registrations?.addEventListener('updatefound', () => {
			const newSW = registrations.installing;
			newSW?.addEventListener('statechange', () => {
				if (newSW.state === 'installed') {
					toast.info('New Update is available. Reloading..!');
					setTimeout(() => {
						newSW.postMessage({ type: 'SKIP_WAITING' });
						window.location.reload();
					}, 2000);
				}
			});
		});
	}

	onMount(() => {
		configStore.refreshConfigs();
		detectSWUpdate();
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
			avoid adding any personal info.
			{#if env.TRACKTOR_DISABLE_AUTH !== 'true'}
				<strong>Default Login: admin / password123</strong>
			{/if}
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
