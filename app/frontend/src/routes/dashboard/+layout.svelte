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
	import Button from '$lib/components/ui/button/button.svelte';

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

<header
	class="flex h-auto shrink-0 justify-center gap-2 border-b py-3 text-center transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
>
	<div class="flex w-full items-center px-6">
		<h1 class="text-primary flex flex-row items-center gap-2 text-2xl font-semibold">
			<Tractor class="h-8 w-8" /> Tracktor
		</h1>
		<div class="ml-auto flex items-center gap-2">
			<div class="flex items-center justify-center gap-2 align-middle">
				<ThemeToggle />
				<Button
					variant="ghost"
					onclick={() => {
						configModelStore.show((status: boolean) => {
							status && fetchVehicles();
						});
					}}
				>
					<Settings class="h-[1.2rem] w-[1.2rem]" />
				</Button>
				<Button variant="ghost" onclick={logout}>
					<LogOut class="h-[1.2rem] w-[1.2rem]" />
				</Button>
			</div>
		</div>
	</div>
</header>

<main>
	{@render children()}
</main>
