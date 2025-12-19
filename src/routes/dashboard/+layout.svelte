<script lang="ts">
	import AppSheet from '$layout/AppSheet.svelte';
	import DashboardNav from '$layout/DashboardNav.svelte';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import VehicleForm from '$feature/vehicle/VehicleForm.svelte';
	import VehicleList from '$feature/vehicle/VehicleList.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { configStore } from '$lib/stores/config.svelte';
	import { sheetStore } from '$stores/sheet.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import { authStore } from '$stores/auth.svelte';
	import Button from '$ui/button/button.svelte';
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let { children } = $props();

	let isLoading = $state(true);

	onMount(async () => {
		configStore.refreshConfigs();

		await authStore.checkAuthStatus();
		if (!authStore.isLoggedIn) {
			goto('/login', { replaceState: true });
			return;
		}

		vehicleStore.refreshVehicles();
		isLoading = false;
	});

	// Watch for config changes and redirect to first enabled feature if current is disabled
	$effect(() => {
		const currentPath = $page.url.pathname;
		const configs = configStore.configs;

		// Feature to path mapping
		const featureMap = [
			{ key: 'featureOverview', path: '/dashboard/overview' },
			{ key: 'featureFuelLog', path: '/dashboard/fuel' },
			{ key: 'featureMaintenance', path: '/dashboard/maintenance' },
			{ key: 'featureInsurance', path: '/dashboard/insurance' },
			{ key: 'featurePucc', path: '/dashboard/pollution' },
			{ key: 'featureReminders', path: '/dashboard/reminders' }
		];

		// Check if current page's feature is disabled
		const currentFeature = featureMap.find((f) => currentPath.includes(f.path));

		if (currentFeature) {
			const featureKey = currentFeature.key as keyof typeof configs;
			if (configs[featureKey] === false) {
				// Find first enabled feature and redirect
				const firstEnabled = featureMap.find((f) => {
					const fKey = f.key as keyof typeof configs;
					return configs[fKey] !== false;
				});

				if (firstEnabled) {
					goto(firstEnabled.path, { replaceState: true });
				}
			}
		}
	});
</script>

<main id="dashboard-layout-main">
	{#if vehicleStore.processing || isLoading}
		<div id="dashboard-loading-container" class="mx-auto p-4 lg:container lg:p-6">
			<div id="dashboard-loading-header" class="mb-2 flex items-center justify-between gap-4">
				<Skeleton class="h-8 w-48" />
				<Skeleton class="h-8 w-32" />
			</div>

			<div id="dashboard-loading-cards" class="my-4 flex gap-4 overflow-hidden">
				<Skeleton class="h-72 w-80 shrink-0 rounded-2xl" />
				<Skeleton class="h-72 w-80 shrink-0 rounded-2xl" />
				<Skeleton class="h-72 w-80 shrink-0 rounded-2xl" />
			</div>

			<div id="dashboard-loading-content" class="mt-8">
				<div id="dashboard-loading-tabs" class="mb-4 flex gap-2">
					<Skeleton class="h-10 w-24" />
					<Skeleton class="h-10 w-24" />
					<Skeleton class="h-10 w-24" />
				</div>
				<Skeleton class="h-64 w-full rounded-xl" />
			</div>
		</div>
	{:else}
		<div id="dashboard-content-container" class="mx-auto p-4 lg:container lg:p-6">
			<div id="dashboard-header" class="mb-2 flex items-center justify-between">
				<h1 id="dashboard-title" class="text-2xl font-semibold lg:text-3xl">Your Garage</h1>
				<Button
					id="dashboard-add-vehicle-btn"
					variant="outline"
					size="default"
					class="cursor-pointer"
					onclick={() => sheetStore.openSheet(VehicleForm, 'Add Vehicle')}
				>
					<LabelWithIcon icon={CirclePlus} label="Add Vehicle" />
				</Button>
			</div>

			<VehicleList />

			<div id="dashboard-details-section" class="mt-8">
				{#if vehicleStore.selectedId}
					<div id="dashboard-vehicle-content" class="space-y-6">
						<DashboardNav />
						<div id="dashboard-vehicle-details" class="bg-secondary rounded-2xl p-4 lg:p-6">
							{@render children()}
						</div>
					</div>
				{:else}
					<div
						id="dashboard-empty-state"
						class="bg-muted text-muted-foreground border-border flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed text-center"
					>
						<p id="dashboard-empty-message" class="text-lg font-medium">
							Select a vehicle to view its details
						</p>
						<p id="dashboard-empty-hint" class="text-sm">
							Choose one from the garage above to load its dashboard.
						</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</main>

<AppSheet />
