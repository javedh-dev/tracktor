<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { ModeWatcher } from 'mode-watcher';
	import '../styles/app.css';
	import { tick } from 'svelte';
	import { TriangleAlert } from '@lucide/svelte';
	import { env } from '$env/dynamic/public';
	import { Jumper } from 'svelte-loading-spinners';
	import { Toaster } from '$lib/components/ui/sonner';
	import * as Alert from '$lib/components/ui/alert/index.js';

	let { children } = $props();

	let isAuthenticated = $state(false);
	let currentPath = $derived(page.url.pathname);
	let checkingAuth = $state(true);
	let demoMode = $state(false);

	$effect(() => {
		demoMode = env.PUBLIC_DEMO_MODE === 'true';
		console.log('env', env);
		if (browser) {
			const pin = localStorage.getItem('userPin');
			isAuthenticated = !!pin;

			if (currentPath !== '/login' && !isAuthenticated) {
				goto('/login', { replaceState: true });
			}
		}
		tick().then(() => {
			checkingAuth = false;
		});
	});
</script>

<ModeWatcher />
<Toaster position="top-right" richColors expand />

{#if demoMode}
	<div class="sticky top-0 w-full">
		<Alert.Root class="rounded-none border-x-0 border-t-0 text-amber-500">
			<TriangleAlert />
			<Alert.Title>
				This is a demo instance. Data will be reset periodically and is not saved permanently.
				Please avoid adding any persoanl info. <strong>Default PIN : 123456</strong>
			</Alert.Title>
		</Alert.Root>
	</div>
{/if}
{#if checkingAuth}
	<div class="flex min-h-screen items-center justify-center">
		<Jumper size="64" color="#155dfc" duration="2s" />
		<p class="text-lg text-gray-600">Validating Auth...</p>
	</div>
{/if}
{@render children()}
