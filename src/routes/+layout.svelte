<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '../styles/app.css';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { Toaster } from '$ui/sonner';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import { navigating } from '$app/state';
	import Header from '$layout/Header.svelte';
	import { onMount } from 'svelte';
	import { env } from '$lib/config/env';
	import { toast } from 'svelte-sonner';
	import { configStore } from '$lib/stores/config.svelte';

	let { children } = $props();
	let demoMode = env.DEMO_MODE;
	let customCss = $state('');
	let isDashboardTransition = $derived(
		navigating.to &&
			navigating.to.url.pathname.startsWith('/dashboard') &&
			navigating.from?.url.pathname.startsWith('/dashboard')
	);
	let showGlobalLoader = $derived(
		navigating.to && !navigating.to.route.id?.includes('(auth)') && !isDashboardTransition
	);

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
		detectSWUpdate();
		configStore.getCustomCss().then((css) => {
			customCss = css;
			if (customCss) {
				const style = document.createElement('style');
				style.innerHTML = customCss;
				document.head.appendChild(style);
			}
		});
	});
</script>

<ModeWatcher />
<Toaster position="bottom-right" richColors expand />

{#if demoMode}
	<div
		id="demo-mode-banner"
		class="demo-mode-banner bg-secondary/95 flex flex-col justify-center p-2 lg:flex-row dark:border-b-amber-900"
	>
		<LabelWithIcon
			icon={TriangleAlert}
			iconClass="h-5 w-5"
			style="text-amber-500 dark:text-amber-700 gap-1 flex-col lg:flex-row text-center lg:text-sm text-xs"
		>
			This is a demo instance. Data will be reset periodically and is not saved permanently. Please
			avoid adding any personal info.
			{#if !env.DISABLE_AUTH}
				<strong>Default Login: demo / demo</strong>
			{/if}
		</LabelWithIcon>
	</div>
{/if}
{#if showGlobalLoader}
	<div id="global-loading-layout" class="flex min-h-svh w-full flex-col">
		<header
			id="global-loading-header"
			class="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
		>
			<div
				id="global-loading-header-content"
				class="container flex h-14 max-w-screen-2xl items-center"
			>
				<Skeleton class="h-8 w-8 rounded-full" />
				<div id="global-loading-header-title" class="ml-4 flex items-center space-x-2">
					<Skeleton class="h-6 w-24" />
				</div>
				<div
					id="global-loading-header-actions"
					class="flex flex-1 items-center justify-end space-x-2"
				>
					<Skeleton class="h-8 w-8 rounded-full" />
				</div>
			</div>
		</header>
		<main id="global-loading-content" class="flex-1 space-y-4 p-8 pt-6">
			<div id="global-loading-title-section" class="flex items-center justify-between space-y-2">
				<Skeleton class="h-8 w-48" />
			</div>
			<div id="global-loading-body" class="space-y-4">
				<Skeleton class="h-32 w-full rounded-xl" />
				<Skeleton class="h-32 w-full rounded-xl" />
			</div>
		</main>
	</div>
{:else}
	<div id="app-container" class="flex min-h-svh w-full flex-col">
		<Header />
		{@render children()}
	</div>
{/if}
