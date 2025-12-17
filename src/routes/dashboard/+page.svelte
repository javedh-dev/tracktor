<script lang="ts">
	import VehicleList from '$feature/vehicle/VehicleList.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import Button from '$ui/button/button.svelte';
	import DashboardTabs from '$layout/DashboardTabs.svelte';
	import { onMount } from 'svelte';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { sheetStore } from '$stores/sheet.svelte';
	import VehicleForm from '$feature/vehicle/VehicleForm.svelte';
	import { authStore } from '$stores/auth.svelte';
	import { goto } from '$app/navigation';

	let isLoading = $state(true);

	onMount(async () => {
		// Wait for auth status check to complete
		await authStore.checkAuthStatus();

		if (!authStore.isLoggedIn) {
			goto('/login', { replaceState: true });
			return;
		}

		vehicleStore.refreshVehicles();
		isLoading = false;
	});
</script>

{#if vehicleStore.processing || isLoading}
	<div class="mx-auto p-4 lg:container lg:p-6">
		<div class="mb-2 flex items-center justify-between gap-4">
			<Skeleton class="h-8 w-48" />
			<Skeleton class="h-8 w-32" />
		</div>

		<div class="my-4 flex gap-4 overflow-hidden">
			<Skeleton class="h-72 w-80 shrink-0 rounded-2xl" />
			<Skeleton class="h-72 w-80 shrink-0 rounded-2xl" />
			<Skeleton class="h-72 w-80 shrink-0 rounded-2xl" />
		</div>

		<div class="mt-8">
			<div class="mb-4 flex gap-2">
				<Skeleton class="h-10 w-24" />
				<Skeleton class="h-10 w-24" />
				<Skeleton class="h-10 w-24" />
			</div>
			<Skeleton class="h-64 w-full rounded-xl" />
		</div>
	</div>
{:else}
	<div class="mx-auto p-4 lg:container lg:p-6">
		<div class="mb-2 flex items-center justify-between">
			<h1 class="text-2xl font-semibold lg:text-3xl">Your Garage</h1>
			<Button
				variant="outline"
				size="default"
				class="cursor-pointer"
				onclick={() => sheetStore.openSheet(VehicleForm, 'Add Vehicle')}
			>
				<LabelWithIcon icon={CirclePlus} label="Add Vehicle" />
			</Button>
		</div>

		<VehicleList />

		{#if vehicleStore.selectedId}
			<DashboardTabs />
		{/if}
	</div>
{/if}
