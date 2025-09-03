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
	import FormField from '../common/FormField.svelte';
	import type { NewVehicle } from '$lib/models/vehicle';
	import { env } from '$env/dynamic/public';
	import { vehiclesStore } from '$lib/stores/vehicle';
	import { browser } from '$app/environment';
	import Button from '$components/common/Button.svelte';
	import StatusBlock from '$components/common/StatusBlock.svelte';
	import type { Status } from '$lib/models/status';
	import { handleApiError, type ApiError } from '$lib/models/Error';
	import { t } from '$lib/stores/i18n';
	import ColorPicker from '../common/ColorPicker.svelte';

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
				message: $t('forms.validation.vehicleRequired'),
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
					message: editMode ? $t('forms.success.vehicleUpdated') : $t('forms.success.vehicleAdded'),
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
				message: $t('forms.errors.connectionFailed'),
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
			placeholder={$t('forms.placeholders.make')}
			bind:value={vehicle.make}
			icon={Building2}
			label={$t('forms.labels.make')}
			required={true}
			ariaLabel="Vehicle Make"
		/>
		<FormField
			id="model"
			type="text"
			placeholder={$t('forms.placeholders.model')}
			bind:value={vehicle.model}
			icon={Car}
			label={$t('forms.labels.model')}
			required={true}
			ariaLabel="Vehicle Model"
		/>
	</div>
	<div class="grid grid-flow-row grid-cols-2 gap-4">
		<FormField
			id="year"
			type="number"
			placeholder={$t('forms.placeholders.year')}
			bind:value={vehicle.year}
			icon={Calendar1}
			label={$t('forms.labels.year')}
			required={true}
			ariaLabel="Vehicle Year"
		/>
		<!-- Reemplazar el FormField de color con: -->
		<ColorPicker
			bind:value={vehicle.color}
			label={$t('forms.labels.color')}
			required
			on:change={(e) => vehicle.color = e.detail}
		/>
	</div>

	<FormField
		id="licensePlate"
		type="text"
		placeholder={$t('forms.placeholders.licensePlate')}
		bind:value={vehicle.licensePlate}
		icon={IdCard}
		label={$t('forms.labels.licensePlate')}
		required={true}
		ariaLabel="License Plate"
	/>
	<FormField
		id="vin"
		type="text"
		placeholder={$t('forms.placeholders.vinNumber')}
		bind:value={vehicle.vin}
		icon={Fingerprint}
		label={$t('forms.labels.vinNumber')}
		ariaLabel="VIN Number"
	/>

	<FormField
		id="odometer"
		type="number"
		placeholder={$t('forms.placeholders.odometerReading')}
		bind:value={vehicle.odometer}
		icon={Gauge}
		label={$t('forms.labels.odometer')}
		ariaLabel="Odometer"
	/>
	<Button type="submit" variant="primary" text={editMode ? $t('forms.buttons.update') : $t('forms.buttons.add')} />

	{#if editMode}
		<input type="hidden" name="id" value={vehicleToEdit?.id || ''} />
	{/if}
</form>
<StatusBlock message={status.message} type={status.type} />
