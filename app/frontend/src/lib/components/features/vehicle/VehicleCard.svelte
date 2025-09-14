<script lang="ts">
	import LicensePlate from './LicensePlate.svelte';

	import {
		Gauge,
		Pencil,
		Trash2,
		Fuel,
		Wrench,
		Shield,
		BadgeCheck,
		CircleDotDashed,
		ShieldCheck,
		BadgeAlert,
		ShieldAlert,
		IdCard
	} from '@lucide/svelte/icons';
	import { formatDistance } from '$helper/formatting';
	import { vehicleModelStore, vehiclesStore } from '$stores/vehicle';
	import { maintenanceModelStore } from '$stores/maintenance';
	import { fuelLogModelStore } from '$stores/fuel-log';
	import { insuranceModelStore } from '$stores/insurance';
	import { puccModelStore } from '$stores/pucc';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import IconButton from '$appui/IconButton.svelte';
	import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
	import * as Card from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import IconWithTooltip from '$appui/IconWithTooltip.svelte';
	import LabelWithIcon from '$lib/components/ui/app/LabelWithIcon.svelte';

	const { vehicle, updateCallback, onclick, onkeydown, isSelected = false } = $props();
	let deleteDialog = $state(false);

	const deleteVehicle = async (vehicleId: string) => {
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
	};

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

<div tabindex="0" role="button" {onclick} {onkeydown}>
	<Card.Root
		class={`hover:border-primary h-full w-sm cursor-pointer gap-2 rounded-2xl border-2 p-0 pb-4 transition-all duration-300 ease-in-out ${isSelected ? 'border-primary' : 'border-transparent'}`}
	>
		<Card.Header class="relative h-38 overflow-hidden p-0 ">
			<div class="w-full">
				<img
					src={imageUrl}
					alt="car"
					class="rounded-t-xl object-cover opacity-30 dark:opacity-30"
				/>
			</div>
			<div class="absolute inset-0 flex flex-col justify-between p-4">
				<div class="flex flex-col">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="text-2xl font-bold">{vehicle.make} {vehicle.model}</span>
						</div>
						<p class="flex items-center gap-2">
							{#if vehicle.color}
								<Badge class="m-1 h-5 w-8" style={`background-color: ${vehicle.color}`} />
							{/if}
						</p>
					</div>
					<div class="mt-2 flex flex-row justify-between text-sm font-medium">
						<LabelWithIcon
							icon={IdCard}
							iconClass="h-5 w-5"
							style="mono text-zinc-600 flex items-center gap-2"
							label={vehicle.vin ? vehicle.vin : '-'}
						/>
						<LabelWithIcon
							icon={Gauge}
							iconClass="h-5 w-5"
							style="mono text-foreground flex items-center gap-2"
							label={vehicle.odometer ? formatDistance(vehicle.odometer) : '-'}
						/>
					</div>
				</div>

				<div class="flex flex-row justify-between">
					<IconWithTooltip
						icon={vehicle.insuranceStatus === 'Active' ? ShieldCheck : ShieldAlert}
						className={vehicle.insuranceStatus === 'Active'
							? 'dark:text-green-600 text-green-800'
							: 'dark:text-rose-600 text-rose-800'}
						tooltip={`Insurance is ${vehicle.insuranceStatus}`}
						side="right"
					/>
					<IconWithTooltip
						icon={vehicle.puccStatus === 'Active' ? BadgeCheck : BadgeAlert}
						className={vehicle.puccStatus === 'Active'
							? 'dark:text-green-600 text-green-800'
							: 'dark:text-rose-600 text-rose-800'}
						tooltip={`Pollution Status is ${vehicle.puccStatus}`}
						side="left"
					/>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="px-4">
			<div class="flex items-center justify-between">
				<LicensePlate registrationNumber={vehicle.licensePlate} />
				<Badge variant="outline" class="text-sm">{vehicle.year}</Badge>
			</div>
		</Card.Content>
		<Card.Footer class="px-3">
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
	</Card.Root>
</div>
<DeleteConfirmation onConfirm={() => deleteVehicle(vehicle.id)} bind:open={deleteDialog} />
