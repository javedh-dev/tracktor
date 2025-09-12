<script lang="ts">
	import {
		Car,
		Calendar1,
		IdCard,
		Fingerprint,
		Paintbrush,
		Gauge,
		Building2
	} from '@lucide/svelte';
	import FormField from '$appui/FormField.svelte';
	import type { NewVehicle } from '$models/vehicle';
	import { env } from '$env/dynamic/public';
	import { vehiclesStore } from '$stores/vehicle';
	import { browser } from '$app/environment';
	import Button from '$appui/Button.svelte';
	import StatusBlock from '$appui/StatusBlock.svelte';
	import type { Status } from '$models/status';
	import { handleApiError, type ApiError } from '$models/Error';
	import { cleanup } from '$utils/formatting';

	let { vehicleToEdit = null, editMode = false, modalVisibility = $bindable(), loading } = $props();

	const vehicle: NewVehicle = $state({
		make: null,
		model: null,
		year: null,
		licensePlate: null,
		vin: null,
		color: null,
		odometer: null
	});

	let status = $state<Status>({
		message: undefined,
		type: 'INFO'
	});

	$effect(() => {
		if (vehicleToEdit) {
			Object.assign(vehicle, vehicleToEdit);
		}
	});

	async function persistVehicle() {
		if (!vehicle.make || !vehicle.model || !vehicle.year || !vehicle.licensePlate) {
			status = {
				message: 'Please fill in all required fields.',
				type: 'ERROR'
			};
			return;
		}
		try {
			if (loading) return; // Prevent multiple submissions
			loading = true;
			status = {
				message: undefined,
				type: 'INFO'
			};
			// await simulateNetworkDelay(2000); // Simulate network delay for development
			const response = await fetch(
				`${env.PUBLIC_API_BASE_URL || ''}/api/vehicles/${editMode ? vehicleToEdit.id : ''}`,
				{
					method: editMode ? 'PUT' : 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-User-PIN': localStorage.getItem('userPin') || ''
					},
					body: JSON.stringify(cleanup(vehicle))
				}
			);

			if (response.ok) {
				status = {
					message: `Vehicle ${editMode ? 'updated' : 'added'} successfully!`,
					type: 'SUCCESS'
				};
				Object.assign(vehicle, {
					make: '',
					model: '',
					year: null,
					licensePlate: '',
					vin: '',
					color: '',
					odometer: null
				});
				modalVisibility = false;
				fetchVehicles(); // Refresh the vehicle list after closing the modal
			} else {
				const data: ApiError = await response.json();
				status = handleApiError(data, editMode);
			}
		} catch (e) {
			console.error('Error persisting vehicle:', e);
			status = {
				message: 'Failed to connect to the server.',
				type: 'ERROR'
			};
		}
		loading = false;
	}

	const fetchVehicles = () => {
		if (browser) {
			const pin = localStorage.getItem('userPin') || undefined;
			if (pin) vehiclesStore.fetchVehicles(pin);
		}
	};
</script>

<form
	onsubmit={(e) => {
		persistVehicle();
		e.preventDefault();
	}}
	class="space-y-6"
>
	<div class="grid grid-flow-row grid-cols-2 gap-4">
		<FormField
			id="make"
			type="text"
			placeholder="Make"
			bind:value={vehicle.make}
			icon={Building2}
			label="Manufacturer"
			required={true}
			ariaLabel="Vehicle Make"
		/>
		<FormField
			id="model"
			type="text"
			placeholder="Model"
			bind:value={vehicle.model}
			icon={Car}
			label="Model"
			required={true}
			ariaLabel="Vehicle Model"
		/>
	</div>
	<div class="grid grid-flow-row grid-cols-2 gap-4">
		<FormField
			id="year"
			type="number"
			placeholder="Year"
			bind:value={vehicle.year}
			icon={Calendar1}
			label="Year"
			required={true}
			ariaLabel="Vehicle Year"
		/>
		<FormField
			id="color"
			type="text"
			placeholder="Color"
			bind:value={vehicle.color}
			icon={Paintbrush}
			label="Color"
			ariaLabel="Color"
		/>
	</div>

	<FormField
		id="licensePlate"
		type="text"
		placeholder="License Plate"
		bind:value={vehicle.licensePlate}
		icon={IdCard}
		label="Licence Plate"
		required={true}
		ariaLabel="License Plate"
	/>
	<FormField
		id="vin"
		type="text"
		placeholder="VIN Number"
		bind:value={vehicle.vin}
		icon={Fingerprint}
		label="VIN Number"
		ariaLabel="VIN Number"
	/>

	<FormField
		id="odometer"
		type="number"
		placeholder="Odometer"
		bind:value={vehicle.odometer}
		icon={Gauge}
		label="Odometer"
		ariaLabel="Odometer"
	/>
	<Button type="submit" variant="primary" text={editMode ? 'Update' : 'Add'} />

	{#if editMode}
		<input type="hidden" name="id" value={vehicleToEdit?.id || ''} />
	{/if}
</form>
<StatusBlock message={status.message} type={status.type} />
