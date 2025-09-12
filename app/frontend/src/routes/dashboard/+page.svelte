<script lang="ts">
	import { PlusCircle } from '@lucide/svelte';
	import FuelLogModal from '$appui/modals/FuelLogModal.svelte';
	import VehicleModal from '$appui/modals/VehicleModal.svelte';
	import VehicleList from '$appui/lists/VehicleList.svelte';
	import type { Vehicle } from '$models/vehicle';
	import { Jumper } from 'svelte-loading-spinners';
	import MaintenanceLogModal from '$appui/modals/MaintenanceLogModal.svelte';
	import { vehicleModelStore, vehiclesStore } from '$stores/vehicle';
	import PollutionCertificateModal from '$appui/modals/PollutionCertificateModal.svelte';
	import InsuranceModal from '$appui/modals/InsuranceModal.svelte';
	import { browser } from '$app/environment';
	import ConfigModal from '$appui/modals/ConfigModal.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import TabHeader from '$lib/components/custom/tabs/DashboardTabs.svelte';
	import DashboardTabs from '$lib/components/custom/tabs/DashboardTabs.svelte';

	let vehicles = $state<Vehicle[]>([]);
	let loading = $state(true);
	let error = $state('');

	let selectedVehicleId = $state<string | undefined>(undefined);

	let activeTab = $state('dashboard');

	vehiclesStore.subscribe((data) => {
		vehicles = data.vehicles;
		loading = data.loading;
		error = data.error;
		selectedVehicleId = data.selectedVehicleId;
		if (vehicles.length > 0) {
			selectedVehicleId = selectedVehicleId || vehicles[0].id;
		} else {
			selectedVehicleId = undefined;
		}
	});

	function updateCallback(status: boolean) {
		if (status) {
			fetchVehicles();
		}
	}

	const fetchVehicles = () => {
		if (browser) {
			const pin = localStorage.getItem('userPin') || undefined;
			if (pin) vehiclesStore.fetchVehicles(pin);
		}
	};

	fetchVehicles();
</script>

<div class="container mx-auto p-6 transition-colors">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Your Vehicles</h1>
		<Button variant="outline" size="lg" onclick={() => vehicleModelStore.show()}>
			<PlusCircle />
			Add Vehicle
		</Button>
	</div>
	{#if loading}
		<p class="flex items-center justify-center gap-5 text-lg text-gray-500 dark:text-gray-400">
			<Jumper size="40" color="#155dfc" unit="px" duration="2s" />
			Loading Vehicles...
		</p>
	{:else if error}
		<p class="text-lg text-red-500 dark:text-red-400">Error: {error}</p>
	{:else}
		<VehicleList {vehicles} {selectedVehicleId} {updateCallback} />
	{/if}

	{#if selectedVehicleId}
		<DashboardTabs vehicleId={selectedVehicleId} />
	{:else if vehicles.length > 0 && !loading}
		<div class="py-12 text-center">
			<p class="text-lg text-gray-500 dark:text-gray-400">
				Select a vehicle to view fuel and mileage data.
			</p>
		</div>
	{/if}

	<VehicleModal />
	<FuelLogModal />
	<MaintenanceLogModal />
	<PollutionCertificateModal />
	<InsuranceModal />
	<ConfigModal />
</div>
