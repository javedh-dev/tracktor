<script lang="ts">
	import { goto } from '$app/navigation';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Tractor from '@lucide/svelte/icons/tractor';
	import Settings from '@lucide/svelte/icons/settings';
	import ThemeToggle from '$lib/components/app/ThemeToggle.svelte';
	import { configModelStore } from '$lib/stores/setting';
	import { vehiclesStore } from '$stores/vehicle';
	import { Button } from '$lib/components/ui/button';
	import LabelWithIcon from '../app/LabelWithIcon.svelte';
	import { page } from '$app/state';
	import { authStore } from '$lib/stores/auth.store';

	let isAuthenticated = $state(false);

	$effect(() => {
		isAuthenticated = !!$authStore;

		if (!isAuthenticated && page.url.pathname !== '/login') {
			goto('/login', { replaceState: true });
		}
	});

	const fetchVehicles = () => {
		const pin = localStorage.getItem('userPin') || undefined;
		if (pin) vehiclesStore.fetchVehicles(pin);
	};
</script>

<header
	class="flex h-auto shrink-0 justify-center gap-2 border-b py-3 text-center transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
>
	<div class="flex w-full items-center px-2 lg:px-6">
		<LabelWithIcon
			icon={Tractor}
			iconClass="h-8 w-8"
			style="text-primary flex flex-row items-center gap-2 text-2xl font-semibold"
			label="Tracktor"
		/>
		<div class="ml-auto flex items-center gap-2">
			<div class="flex items-center gap-2">
				<ThemeToggle />
				{#if isAuthenticated}
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
					<Button variant="ghost" onclick={authStore.logout}>
						<LogOut class="h-[1.2rem] w-[1.2rem]" />
					</Button>
				{/if}
			</div>
		</div>
	</div>
</header>
