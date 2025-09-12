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
	import { formatDistance } from '$utils/formatting';
	import { vehicleModelStore, vehiclesStore } from '$stores/vehicle';
	import { maintenanceModelStore } from '$stores/maintenance';
	import { fuelLogModelStore } from '$stores/fuel-log';
	import { insuranceModelStore } from '$stores/insurance';
	import { puccModelStore } from '$stores/pucc';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import IconButton from '../../ui/app/IconButton.svelte';
	import DeleteConfirmation from '../../ui/app/DeleteConfirmation.svelte';
	import * as Card from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge/badge.svelte';

	const { vehicle, updateCallback } = $props();
	let deleteDialog = $state(false);

	async function deleteVehicle(vehicleId: string) {
		try {
			const response = await fetch(`${env.PUBLIC_API_BASE_URL || ''}/api/vehicles/${vehicleId}`, {
				method: 'DELETE',
				headers: {
					'X-User-PIN': localStorage.getItem('userPin') || ''
				}
			});
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

	// Dynamic image URL - fallback to default if vehicle doesn't have image
	const imageUrl =
		vehicle.imageUrl || 'https://www.v3cars.com/media/model-imgs/91-92-062100-daytona-grey.webp';
</script>

<Card.Root class="w-sm overflow-hidden p-0 transition-all duration-300 ease-in-out">
	<div class="relative h-72">
		<img
			src={imageUrl}
			alt="{vehicle.make} {vehicle.model}"
			class="h-full w-full rounded-t-lg object-cover opacity-30"
		/>

		<div class="absolute inset-0 flex flex-col py-4">
			<Card.Header class="relative z-10">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Car class="h-8 w-8" />
						<span class="text-2xl font-bold">{vehicle.make} {vehicle.model}</span>
					</div>
					<Badge>{vehicle.year}</Badge>
				</div>
			</Card.Header>

			<Card.Content class="relative z-10 flex-1">
				<div class="flex-1">
					<p class="flex items-center gap-2">
						<IdCard class="h-5 w-5" />
						<span class="font-semibold"> License Plate: </span>
						{vehicle.licensePlate}
					</p>
					<p class="flex items-center gap-2">
						<Fingerprint class="h-5 w-5" />
						<span class="font-semibold"> VIN: </span>
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
							<span
								class={vehicle.insuranceStatus === 'Active' ? 'text-green-600' : 'text-red-600'}
							>
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
			</Card.Content>

			<Card.Footer class="relative z-10 mt-auto">
				<div class="flex w-full justify-between">
					<div class="flex justify-start">
						<IconButton
							buttonStyles="hover:bg-green-100 dark:hover:bg-green-700"
							iconStyles="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-200"
							icon={Fuel}
							onclick={() => fuelLogModelStore.show(vehicle.id, null, false, updateCallback)}
							ariaLabel="Log fuel refill"
						/>
						<IconButton
							buttonStyles="hover:bg-amber-100 dark:hover:bg-amber-700"
							iconStyles="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-200"
							icon={Wrench}
							onclick={() => maintenanceModelStore.show(vehicle.id, null, false, updateCallback)}
							ariaLabel="Maintenence"
						/>
						<IconButton
							buttonStyles="hover:bg-sky-100 dark:hover:bg-sky-700"
							iconStyles="text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-200"
							icon={Shield}
							onclick={() => insuranceModelStore.show(vehicle.id, null, false, updateCallback)}
							ariaLabel="Insurance"
						/>
						<IconButton
							buttonStyles="hover:bg-fuchsia-100 dark:hover:bg-fuchsia-700"
							iconStyles="text-fuchsia-500 hover:text-fuchsia-600 dark:text-fuchsia-400 dark:hover:text-fuchsia-200"
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
			</Card.Footer>
		</div>
	</div>
</Card.Root>
<DeleteConfirmation onConfirm={() => deleteVehicle(vehicle.id)} bind:open={deleteDialog} />
