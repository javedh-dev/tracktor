<script lang="ts">
	import Button from '$components/common/Button.svelte';
	import StatusBlock from '$components/common/StatusBlock.svelte';
	import { env } from '$env/dynamic/public';
	import { handleApiError } from '$lib/models/Error';
	import type { Status } from '$lib/models/status';
	import { cleanup, getCurrencySymbol } from '$lib/utils/formatting';
	import FormField from '../common/FormField.svelte';
	import { Calendar1, Gauge, Fuel, FileText, BadgeDollarSign } from '@lucide/svelte';

	let {
		vehicleId,
		logToEdit,
		modalVisibility = $bindable(),
		loading = false,
		editMode = false,
		callback
	} = $props();

	let refill = $state({
		date: null,
		odometer: null,
		fuelAmount: null,
		cost: null,
		notes: null
	});

	let status = $state<Status>({
		message: undefined,
		type: 'INFO'
	});

	$effect(() => {
		Object.assign(refill, logToEdit);
	});

	async function persistLog() {
		if (!vehicleId) {
			status = {
				message: 'No vehicle selected.',
				type: 'ERROR'
			};
			return;
		}
		if (!refill.date || !refill.odometer || !refill.fuelAmount || !refill.cost) {
			status = {
				message: 'Date, Odometer, Fuel Amount, and Cost are required.',
				type: 'ERROR'
			};
			return;
		}
		try {
			const response = await fetch(
				`${env.PUBLIC_API_BASE_URL || ''}/api/vehicles/${vehicleId}/fuel-logs/${editMode ? logToEdit.id : ''}`,
				{
					method: `${editMode ? 'PUT' : 'POST'}`,
					headers: {
						'Content-Type': 'application/json',
						'X-User-PIN': localStorage.getItem('userPin') || ''
					},
					body: JSON.stringify(cleanup(refill))
				}
			);
			if (response.ok) {
				status = {
					message: `Fuel refill log ${editMode ? 'updated' : 'added'} successfully!`,
					type: 'SUCCESS'
				};
				Object.assign(refill, {
					date: '',
					odometer: '',
					fuelAmount: '',
					cost: '',
					notes: ''
				});
			} else {
				const data = await response.json();
				status = handleApiError(data, editMode);
			}
		} catch (e) {
			console.error(e);
			status = {
				message: 'Failed to connect to the server.',
				type: 'ERROR'
			};
		} finally {
			loading = false;
			if (status.type === 'SUCCESS') {
				modalVisibility = false;
				callback(true);
			}
		}
	}
</script>

<form class="space-y-6" onsubmit={persistLog} aria-labelledby="fuel-refill-form-title">
	<div class="grid grid-flow-row grid-cols-2 gap-4">
		<FormField
			id="date"
			type="date"
			placeholder="Date"
			bind:value={refill.date}
			icon={Calendar1}
			required={true}
			label="Date"
			ariaLabel="Refill Date"
		/>
		<FormField
			id="odometer"
			type="number"
			label="Odometer"
			placeholder="Odometer Reading"
			bind:value={refill.odometer}
			icon={Gauge}
			required={true}
			ariaLabel="Odometer Reading"
			inputClass="step-0.01"
		/>
	</div>
	<div class="grid grid-flow-row grid-cols-2 gap-4">
		<FormField
			id="fuelAmount"
			type="number"
			placeholder="Fuel Amount (Litres)"
			bind:value={refill.fuelAmount}
			icon={Fuel}
			label="Fuel Amount"
			required={true}
			ariaLabel="Fuel Amount"
			inputClass="step-0.01"
		/>
		<FormField
			id="cost"
			type="number"
			placeholder={`Cost ( ${getCurrencySymbol()} )`}
			bind:value={refill.cost}
			icon={BadgeDollarSign}
			label="Cost"
			required={true}
			ariaLabel="Fuel Cost"
			inputClass="step-0.01"
		/>
	</div>

	<FormField
		id="notes"
		type="text"
		placeholder="Notes"
		bind:value={refill.notes}
		icon={FileText}
		label="Notes"
		ariaLabel="Notes"
	/>
	<Button type="submit" variant="primary" text={editMode ? 'Update' : 'Add'} {loading} />
</form>
<StatusBlock message={status.message} type={status.type} />
