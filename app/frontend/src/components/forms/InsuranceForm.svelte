<script lang="ts">
	import Button from '$components/common/Button.svelte';
	import FormField from '$components/common/FormField.svelte';
	import StatusBlock from '$components/common/StatusBlock.svelte';
	import { env } from '$env/dynamic/public';
	import { handleApiError } from '$lib/models/Error';
	import type { Status } from '$lib/models/status';
	import { getCurrencySymbol } from '$lib/utils/formatting';
	import { BadgeDollarSign, Building2, Calendar1, IdCard, Notebook } from '@lucide/svelte';
	import { t } from '$lib/stores/i18n';

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
				message: $t('forms.validation.insuranceRequired'),
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
					body: JSON.stringify(insurance)
				}
			);

			if (response.ok) {
				status = {
					message: editMode ? $t('forms.success.insuranceUpdated') : $t('forms.success.insuranceAdded'),
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
			status = {
				message: $t('forms.errors.connectionFailed'),
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
		placeholder={$t('forms.placeholders.provider')}
		bind:value={insurance.provider}
		icon={Building2}
		label={$t('forms.labels.provider')}
		required={true}
		ariaLabel="Provider"
	/>
	<FormField
		id="policy-number"
		type="text"
		placeholder={$t('forms.placeholders.policyNumber')}
		bind:value={insurance.policyNumber}
		icon={IdCard}
		label={$t('forms.labels.policyNumber')}
		required={true}
		ariaLabel="Policy Number"
	/>
	<div class="grid grid-flow-row grid-cols-2 gap-4">
		<FormField
			id="start-date"
			type="date"
			placeholder={$t('forms.placeholders.startDate')}
			bind:value={insurance.startDate}
			icon={Calendar1}
			required={true}
			label={$t('forms.labels.startDate')}
			ariaLabel="Start Date"
		/>

		<FormField
			id="end-date"
			type="date"
			placeholder={$t('forms.placeholders.endDate')}
			bind:value={insurance.endDate}
			icon={Calendar1}
			label={$t('forms.labels.endDate')}
			required={true}
			ariaLabel="End Date"
		/>
	</div>
	<FormField
		id="cost"
		type="number"
		placeholder="{$t('forms.placeholders.costCurrency')} ( {getCurrencySymbol()} )"
		bind:value={insurance.cost}
		icon={BadgeDollarSign}
		label={$t('forms.labels.cost')}
		required={true}
		ariaLabel="Cost"
	/>
	<FormField
		id="notes"
		type="text"
		placeholder={$t('forms.placeholders.notes')}
		bind:value={insurance.notes}
		icon={Notebook}
		label={$t('forms.labels.notes')}
		required={false}
		ariaLabel="Notes"
	/>
	<Button type="submit" variant="primary" text={editMode ? $t('forms.buttons.update') : $t('forms.buttons.add')} />
</form>
<StatusBlock message={status.message} type={status.type} />
