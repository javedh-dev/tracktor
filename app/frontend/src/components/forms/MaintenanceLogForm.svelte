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
			// Instead of copying all fields blindly with Object.assign(log, logToEdit), whitelist only the fields you actually need when populating the form:
			// This ensures log state only has the fields your backend expects (plus notes).
			// No id, vehicleId, createdAt, updatedAt will be sent.
			Object.assign(log, {
				date: logToEdit.date ?? '',
				odometer: logToEdit.odometer ?? 0,
				serviceCenter: logToEdit.serviceCenter ?? '',
				cost: logToEdit.cost ?? 0,
				notes: logToEdit.notes ?? ''
			});
		}
	});

	async function persistLog() {
		loading = true;
		// 1️⃣ Validate required fields first
		// This prevents 0 from being rejected. Right now, if odometer = 0 or cost = 0, !log.odometer is true and triggers the 400 error.
		if (
			!log.date ||
			log.odometer === null ||
			log.odometer === undefined ||
			!log.serviceCenter ||
			log.cost === null ||
			log.cost === undefined
		) {
			status = {
				message: 'Date, Odometer, Service Center, and Cost are required.',
				type: 'ERROR'
			};
			loading = false;

			return;
		}

		try {
			// 2️⃣ Construct the payload
			// For updates (PUT), send ONLY the fields backend expects
			const payload = editMode
				? {
						date: log.date,
						odometer: Number(log.odometer),
						serviceCenter: log.serviceCenter,
						cost: Number(log.cost),
						notes: log.notes ?? ''
					}
				: cleanup(log); // For POST, keep using cleanup

			// 3️⃣ Send the request
			const response = await fetch(
				`${env.PUBLIC_API_BASE_URL || ''}/api/vehicles/${vehicleId}/maintenance-logs/${editMode ? logToEdit.id : ''}`,
				{
					method: `${editMode ? 'PUT' : 'POST'}`,
					headers: {
						'Content-Type': 'application/json',
						'X-User-PIN': localStorage.getItem('userPin') || ''
					},
					body: JSON.stringify(payload)
				}
			);

			// 4️⃣ Handle response
			if (response.ok) {
				status = {
					message: `Maintenance log  ${editMode ? 'updated' : 'added'} successfully!`,
					type: 'SUCCESS'
				};

				// Reset form fields
				Object.assign(log, {
					date: '',
					odometer: null,
					serviceCenter: '',
					cost: null,
					notes: ''
				});
				modalVisibility = false;
			} else {
				let data;
				try {
					data = await response.json();
				} catch {
					data = { message: 'Unknown server error' };
				}
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

		// 5️⃣ Callback if successful
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
			id="serviceCenter"
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
