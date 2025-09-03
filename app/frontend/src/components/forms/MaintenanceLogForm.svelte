<script lang="ts">
	import Button from '$components/common/Button.svelte';
	import FormField from '$components/common/FormField.svelte';
	import StatusBlock from '$components/common/StatusBlock.svelte';
	import { env } from '$env/dynamic/public';
	import { handleApiError } from '$lib/models/Error';
	import type { Status } from '$lib/models/status';
	import { cleanup, getCurrencySymbol, getDistanceUnit } from '$lib/utils/formatting';
	import { BadgeDollarSign, Calendar1, Gauge, Hammer, Notebook } from '@lucide/svelte';

	let {
		vehicleId,
		logToEdit = $bindable(),
		modalVisibility = $bindable(),
		editMode,
		loading,
		callback
	} = $props();

	let log = $state({
		date: null,
		odometer: null,
		serviceCenter: null,
		cost: null,
		notes: null
	});

	let status = $state<Status>({
		message: undefined,
		type: 'INFO'
	});

	$effect(() => {
		if (logToEdit) {
			Object.assign(log, logToEdit);
		}
	});

	async function persistLog() {
		if (!log.date || !log.odometer || !log.serviceCenter || log.cost === null) {
			status = {
				message: 'Date, Odometer, Service Center, and Cost are required.',
				type: 'ERROR'
			};
			return;
		}

		try {
			const response = await fetch(
				`${env.PUBLIC_API_BASE_URL || ''}/api/vehicles/${vehicleId}/maintenance-logs/${editMode ? logToEdit.id : ''}`,
				{
					method: `${editMode ? 'PUT' : 'POST'}`,
					headers: {
						'Content-Type': 'application/json',
						'X-User-PIN': localStorage.getItem('userPin') || ''
					},
					body: JSON.stringify(cleanup(log))
				}
			);

			if (response.ok) {
				status = {
					message: `Maintenance log  ${editMode ? 'updated' : 'added'} successfully!`,
					type: 'SUCCESS'
				};
				Object.assign(log, {
					date: '',
					odometer: null,
					serviceCenter: '',
					cost: null,
					notes: ''
				});
				modalVisibility = false;
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
		}
		loading = false;
		if (status.type === 'SUCCESS') {
			logToEdit = null;
			callback(true);
		}
	}
</script>

<form
	onsubmit={(e) => {
		persistLog();
		e.preventDefault();
	}}
	class="space-y-6"
>
	<div class="grid grid-flow-row grid-cols-2 gap-4">
		<FormField
			id="date"
			type="date"
			placeholder="Date"
			bind:value={log.date}
			icon={Calendar1}
			label="Date"
			required={true}
			ariaLabel="Log Date"
		/>
		<FormField
			id="odometer"
			type="number"
			placeholder="Odometer ( {getDistanceUnit()} )"
			bind:value={log.odometer}
			icon={Gauge}
			label="Odometer"
			required={true}
			ariaLabel="Odometer Reading"
		/>
	</div>
	<div class="grid grid-flow-row grid-cols-2 gap-4">
		<FormField
			id="cost"
			type="number"
			placeholder="Cost ( {getCurrencySymbol()} )"
			bind:value={log.cost}
			icon={BadgeDollarSign}
			label="Cost"
			required={true}
			ariaLabel="Service Cost ( {getCurrencySymbol()} )"
		/>
		<FormField
			id="service"
			type="text"
			placeholder="Service Center"
			bind:value={log.serviceCenter}
			icon={Hammer}
			label="Service Center"
			required={true}
			ariaLabel="Service Description"
		/>
	</div>
	<FormField
		id="notes"
		type="text"
		placeholder="Notes"
		bind:value={log.notes}
		icon={Notebook}
		label="Notes"
		required={false}
		ariaLabel="Additional Notes"
	/>
	<Button type="submit" variant="primary" text={editMode ? 'Update' : 'Add'} {loading} />
</form>
<StatusBlock message={status.message} type={status.type} />
