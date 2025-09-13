<script lang="ts">
	import Button from '$appui/Button.svelte';
	import FormField from '$appui/FormField.svelte';
	import StatusBlock from '$appui/StatusBlock.svelte';
	import { env } from '$env/dynamic/public';
	import { handleApiError } from '$models/Error';
	import type { Status } from '$models/status';
	import { cleanup, getCurrencySymbol } from '$helper/formatting';
	import { BadgeDollarSign, Building2, Calendar1, IdCard, Notebook } from '@lucide/svelte/icons';

	let {
		vehicleId,
		entryToEdit = $bindable(),
		modalVisibility = $bindable(),
		editMode,
		loading,
		callback
	} = $props();

	let insurance = $state({
		provider: null,
		policyNumber: null,
		startDate: null,
		endDate: null,
		cost: null,
		notes: null
	});

	let status = $state<Status>({
		message: undefined,
		type: 'INFO'
	});

	$effect(() => {
		if (entryToEdit) {
			Object.assign(insurance, entryToEdit);
		}
	});

	async function persistInsurance() {
		if (
			!insurance.provider ||
			!insurance.policyNumber ||
			!insurance.startDate ||
			!insurance.endDate ||
			!insurance.cost
		) {
			status = {
				message: 'Provider, Policy Number, Start Date, End Date, Cost are required.',
				type: 'ERROR'
			};
			return;
		}

		try {
			const response = await fetch(
				`${env.PUBLIC_API_BASE_URL || ''}/api/vehicles/${vehicleId}/insurance/${editMode ? entryToEdit.id : ''}`,
				{
					method: `${editMode ? 'PUT' : 'POST'}`,
					headers: {
						'Content-Type': 'application/json',
						'X-User-PIN': localStorage.getItem('userPin') || ''
					},
					body: JSON.stringify(cleanup(insurance))
				}
			);

			if (response.ok) {
				status = {
					message: `Insurance details ${editMode ? 'updated' : 'added'} successfully!`,
					type: 'SUCCESS'
				};
				Object.assign(insurance, {
					provider: '',
					policyNumber: '',
					startDate: '',
					endDate: '',
					cost: null
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
			entryToEdit = null;
			callback(true);
		}
	}
</script>

<form
	class="space-y-6"
	onsubmit={(e) => {
		persistInsurance();
		e.preventDefault();
	}}
>
	<FormField
		id="provider"
		type="text"
		placeholder="Provider"
		bind:value={insurance.provider}
		icon={Building2}
		label="Provider"
		required={true}
		ariaLabel="Provider"
	/>
	<FormField
		id="policy-number"
		type="text"
		placeholder="Policy Number"
		bind:value={insurance.policyNumber}
		icon={IdCard}
		label="Policy Number"
		required={true}
		ariaLabel="Policy Number"
	/>
	<div class="grid grid-flow-row grid-cols-2 gap-4">
		<FormField
			id="start-date"
			type="date"
			placeholder="Start Date"
			bind:value={insurance.startDate}
			icon={Calendar1}
			required={true}
			label="Start Date"
			ariaLabel="Start Date"
		/>

		<FormField
			id="end-date"
			type="date"
			placeholder="End Date"
			bind:value={insurance.endDate}
			icon={Calendar1}
			label="End Date"
			required={true}
			ariaLabel="End Date"
		/>
	</div>
	<FormField
		id="cost"
		type="number"
		placeholder="Cost ( {getCurrencySymbol()} )"
		bind:value={insurance.cost}
		icon={BadgeDollarSign}
		label="Cost"
		required={true}
		ariaLabel="Cost"
	/>
	<FormField
		id="notes"
		type="text"
		placeholder="Notes"
		bind:value={insurance.notes}
		icon={Notebook}
		label="Notes"
		required={false}
		ariaLabel="Notes"
	/>
	<Button type="submit" variant="primary" text={editMode ? 'Update' : 'Add'} {loading} />
</form>
<StatusBlock message={status.message} type={status.type} />
