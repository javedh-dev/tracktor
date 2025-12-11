<script lang="ts">
	import VehicleList from '$lib/components/features/vehicle/VehicleList.svelte';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import DashboardTabs from '$lib/components/layout/DashboardTabs.svelte';
	import { onMount } from 'svelte';
	import LabelWithIcon from '$lib/components/app/LabelWithIcon.svelte';
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import { Jumper } from 'svelte-loading-spinners';
	import { sheetStore } from '$lib/stores/sheet.svelte';
	import VehicleForm from '$lib/components/features/vehicle/VehicleForm.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		if (!authStore.isLoggedIn) {
			goto('/login', { replaceState: true });
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
