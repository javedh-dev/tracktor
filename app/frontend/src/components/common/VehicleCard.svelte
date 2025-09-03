<script lang="ts">
	import {
		Car,
		IdCard,
		Fingerprint,
		Paintbrush,
		Gauge,
		Pencil,
		Trash2,
		Fuel,
		Wrench,
		Shield,
		BadgeCheck
	} from '@lucide/svelte';
	import { formatDistance } from '$lib/utils/formatting';
	import { vehicleModelStore, vehiclesStore } from '$lib/stores/vehicle';
	import { maintenanceModelStore } from '$lib/stores/maintenance';
	import { fuelLogModelStore } from '$lib/stores/fuel-log';
	import { insuranceModelStore } from '$lib/stores/insurance';
	import { puccModelStore } from '$lib/stores/pucc';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import IconButton from './IconButton.svelte';
	import DeleteConfirmation from './DeleteConfirmation.svelte';

	const { vehicle, updateCallback } = $props();
	let deleteDialog = $state(false);

	async function deleteVehicle(vehicleId: string) {
		try {
			const response = await fetch(
				`${env.PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/vehicles/${vehicleId}`,
				{
					method: 'DELETE',
					headers: {
						'X-User-PIN': localStorage.getItem('userPin') || ''
					}
				}
			);
			if (response.ok) {
				alert('Vehicle deleted successfully.');
				vehicleModelStore.hide();
				fetchVehicles();
			} else {
				const data = await response.json();
				alert(data.message || 'Failed to delete vehicle.');
			}
		} catch (e) {
			console.log(e);
			alert('Failed to connect to the server.');
		}
	}

	const fetchVehicles = () => {
		if (browser) {
			const pin = localStorage.getItem('userPin') || undefined;
			if (pin) vehiclesStore.fetchVehicles(pin);
		}
	};
</script>

<div
	class="flex min-h-60 flex-col justify-between gap-4 rounded-2xl border-2 border-transparent bg-white p-6 shadow-lg transition-all duration-300 ease-in-out hover:border-blue-500 hover:shadow-2xl dark:bg-gray-800 dark:text-gray-100 dark:hover:border-blue-400"
>
	<div class="mb-2 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<Car class="h-7 w-7 text-blue-500 dark:text-blue-400" />
			<span class="text-2xl font-bold text-gray-800 dark:text-gray-100"
				>{vehicle.make} {vehicle.model}</span
			>
		</div>
		<span
			class="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white dark:bg-blue-500 dark:text-gray-100"
			>{vehicle.year}</span
		>
	</div>
	<div class="flex-1 text-gray-600 dark:text-gray-300">
		<p class="flex items-center gap-2">
			<IdCard class="h-5 w-5 text-gray-400 dark:text-gray-500" /><span class="font-semibold"
				>License Plate:</span
			>
			{vehicle.licensePlate}
		</p>
		<p class="flex items-center gap-2">
			<Fingerprint class="h-5 w-5 text-gray-400 dark:text-gray-500" /><span class="font-semibold"
				>VIN:</span
			>
			{vehicle.vin ? vehicle.vin : '-'}
		</p>

		<p class="flex items-center gap-2">
			<Paintbrush class="h-5 w-5 text-gray-400 dark:text-gray-500" />
			<span class="font-semibold">Color:</span>
			{#if vehicle.color}
				<span
					class="m-1 h-4 w-8 rounded border-2 border-sky-500 p-2 dark:border-sky-800"
					style={`background-color: ${vehicle.color}`}
				></span>
			{:else}
				<span>-</span>
			{/if}
		</p>
		<p class="flex items-center gap-2">
			<Gauge class="h-5 w-5 text-gray-400 dark:text-gray-500" />
			<span class="font-semibold">Odometer:</span>
			{vehicle.odometer ? formatDistance(vehicle.odometer) : '-'}
		</p>
		{#if vehicle.insuranceStatus}
			<p class="flex items-center gap-2">
				<Shield class="h-5 w-5 text-gray-400 dark:text-gray-500" />
				<span class="font-semibold">Insurance:</span>
				<span class={vehicle.insuranceStatus === 'Active' ? 'text-green-600' : 'text-red-600'}>
					{vehicle.insuranceStatus}
				</span>
			</p>
		{/if}
		{#if vehicle.puccStatus}
			<p class="flex items-center gap-2">
				<BadgeCheck class="h-5 w-5 text-gray-400 dark:text-gray-500" />
				<span class="font-semibold">PUCC:</span>
				<span class={vehicle.puccStatus === 'Active' ? 'text-green-600' : 'text-red-600'}>
					{vehicle.puccStatus}
				</span>
			</p>
		{/if}
	</div>
	<div class=" flex justify-between">
		<div class="flex justify-start">
			<IconButton
				buttonStyles="hover:bg-green-100 dark:hover:bg-green-700"
				iconStyles=" text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-200"
				icon={Fuel}
				onclick={() => fuelLogModelStore.show(vehicle.id, null, false, updateCallback)}
				ariaLabel="Log fuel refill"
			/>
			<IconButton
				buttonStyles="hover:bg-amber-100 dark:hover:bg-amber-700"
				iconStyles=" text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-200"
				icon={Wrench}
				onclick={() => maintenanceModelStore.show(vehicle.id, null, false, updateCallback)}
				ariaLabel="Maintenence"
			/>
			<IconButton
				buttonStyles="hover:bg-sky-100 dark:hover:bg-sky-700"
				iconStyles=" text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-200"
				icon={Shield}
				onclick={() => insuranceModelStore.show(vehicle.id, null, false, updateCallback)}
				ariaLabel="Insurance"
			/>
			<IconButton
				buttonStyles="hover:bg-fuchsia-100 dark:hover:bg-fuchsia-700"
				iconStyles=" text-fuchsia-500 hover:text-fuchsia-600 dark:text-fuchsia-400 dark:hover:text-fuchsia-200"
				icon={BadgeCheck}
				onclick={() => puccModelStore.show(vehicle.id, null, false, updateCallback)}
				ariaLabel="Pollution Certificate"
			/>
		</div>
		<div class="flex justify-end gap-2">
			<IconButton
				buttonStyles="hover:bg-gray-200 dark:hover:bg-gray-700"
				iconStyles="text-gray-600 dark:text-gray-100 hover:text-sky-500"
				icon={Pencil}
				onclick={() => {
					vehicleModelStore.show(vehicle, true);
				}}
				ariaLabel="Edit"
			/>
			<IconButton
				buttonStyles="hover:bg-gray-200 dark:hover:bg-gray-700"
				iconStyles="text-gray-600 dark:text-gray-100 hover:text-red-500"
				icon={Trash2}
				onclick={() => (deleteDialog = true)}
				ariaLabel="Delete"
			/>
		</div>
	</div>
</div>
<DeleteConfirmation onConfirm={() => deleteVehicle(vehicle.id)} bind:open={deleteDialog} />
