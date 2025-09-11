<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { tick } from 'svelte';
	import { LogOut, Tractor, Settings } from '@lucide/svelte';
	import ThemeToggle from '$appui/common/ThemeToggle.svelte';
	import { env } from '$env/dynamic/public';
	import { configModelStore } from '$stores/config';
	import { vehiclesStore } from '$stores/vehicle';
	import IconButton from '$appui/common/IconButton.svelte';

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

	function logout() {
		if (browser) {
			localStorage.removeItem('userPin');
			isAuthenticated = false;
		}
	}

	const fetchVehicles = () => {
		if (browser) {
			const pin = localStorage.getItem('userPin') || undefined;
			if (pin) vehiclesStore.fetchVehicles(pin);
		}
	};
</script>

<header class="bg-white shadow-sm transition-colors dark:bg-gray-800">
	<nav class="container mx-auto flex items-center justify-between p-4">
		<a
			href="/dashboard"
			class="flex items-center gap-2 text-2xl font-bold text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-400"
		>
			<Tractor class="h-8 w-8" />
			Tracktor
		</a>
		<div class="flex items-center justify-center gap-2 align-middle">
			<ThemeToggle />
			<IconButton
				buttonStyles="hover:bg-gray-200 dark:hover:bg-gray-700"
				iconStyles="text-gray-600 dark:text-gray-100 hover:text-sky-500"
				icon={Settings}
				onclick={() => {
					configModelStore.show((status: boolean) => {
						status && fetchVehicles();
					});
				}}
				ariaLabel="Settings"
			/>
			<IconButton
				buttonStyles="hover:bg-gray-200 dark:hover:bg-gray-700"
				iconStyles="text-gray-600 dark:text-gray-100 hover:text-red-500"
				icon={LogOut}
				onclick={logout}
				ariaLabel="Logout"
			/>
		</div>
	</nav>
</header>
<main class="text-gray-600 dark:text-gray-100">
	{@render children()}
</main>
