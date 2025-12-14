<script lang="ts">
	import VehicleList from '$feature/vehicle/VehicleList.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import Button from '$ui/button/button.svelte';
	import DashboardTabs from '$layout/DashboardTabs.svelte';
	import { onMount } from 'svelte';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import { Jumper } from 'svelte-loading-spinners';
	import { sheetStore } from '$stores/sheet.svelte';
	import VehicleForm from '$feature/vehicle/VehicleForm.svelte';
	import { authStore } from '$stores/auth.svelte';
	import { goto } from '$app/navigation';

	onMount(async () => {
		// Wait for auth status check to complete
		await authStore.checkAuthStatus();

		if (!authStore.isLoggedIn) {
			goto('/login', { replaceState: true });
			return;
		}

		vehicleStore.refreshVehicles();
	});
</script>

{#if vehicleStore.processing}
	<div class="flex min-h-screen items-center justify-center">
		<Jumper size="64" color="var(--primary)" duration="2s" />
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
