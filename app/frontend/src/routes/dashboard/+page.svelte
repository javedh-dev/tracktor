<script lang="ts">
	import VehicleList from '$feature/vehicle/VehicleList.svelte';
	import { vehicleModelStore, vehiclesStore } from '$stores/vehicle';
	import Button from '$lib/components/ui/button/button.svelte';
	import DashboardTabs from '$lib/components/layout/DashboardTabs.svelte';
	import { onMount } from 'svelte';
	import LabelWithIcon from '$lib/components/app/LabelWithIcon.svelte';
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import { Jumper } from 'svelte-loading-spinners';

	let selectedVehicleId = $state<string | undefined>();
	let loading = $state(false);

	const updateCallback = (success: boolean) => success && fetchVehicles();

	const fetchVehicles = async () => {
		loading = true;
		const pin = localStorage.getItem('userPin') || undefined;
		if (pin) vehiclesStore.fetchVehicles(pin).finally(() => (loading = false));
	};

	onMount(() => fetchVehicles());
</script>

{#if loading}
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
				onclick={() => vehicleModelStore.show()}
			>
				<LabelWithIcon icon={CirclePlus} label="Add Vehicle" />
			</Button>
		</div>

		<VehicleList bind:selectedVehicleId {updateCallback} />

		{#if selectedVehicleId}
			<DashboardTabs vehicleId={selectedVehicleId} />
		{/if}
	</div>
{/if}
