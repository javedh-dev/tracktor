<script lang="ts">
	import Button from '$components/common/Button.svelte';
	import FormField from '$components/common/FormField.svelte';
	import StatusBlock from '$components/common/StatusBlock.svelte';
	import { env } from '$env/dynamic/public';
	import { handleApiError } from '$lib/models/Error';
	import type { Status } from '$lib/models/status';
	import { Calendar1, IdCard, Notebook, TestTube, TestTube2 } from '@lucide/svelte';
	import { t } from '$lib/stores/i18n';

	let {
		vehicleId,
		entryToEdit = $bindable(),
		modalVisibility = $bindable(),
		editMode,
		loading,
		callback
	} = $props();

	let certificate = $state({
		certificateNumber: null,
		issueDate: null,
		expiryDate: null,
		testingCenter: null,
		notes: null
	});

	let status = $state<Status>({
		message: undefined,
		type: 'INFO'
	});

	$effect(() => {
		if (entryToEdit) {
			Object.assign(certificate, entryToEdit);
		}
	});

	async function persistCertificate() {
		if (
			!certificate.certificateNumber ||
			!certificate.issueDate ||
			!certificate.expiryDate ||
			!certificate.testingCenter
		) {
			status = {
				message: $t('forms.validation.pollutionRequired'),
				type: 'ERROR'
			};
			return;
		}

		try {
			const response = await fetch(
				`${env.PUBLIC_API_BASE_URL || ''}/api/vehicles/${vehicleId}/pucc/${editMode ? entryToEdit.id : ''}`,
				{
					method: `${editMode ? 'PUT' : 'POST'}`,
					headers: {
						'Content-Type': 'application/json',
						'X-User-PIN': localStorage.getItem('userPin') || ''
					},
					body: JSON.stringify(certificate)
				}
			);

			if (response.ok) {
				status = {
					message: editMode ? $t('forms.success.pollutionUpdated') : $t('forms.success.pollutionAdded'),
					type: 'SUCCESS'
				};
				Object.assign(certificate, {
					certificateNumber: '',
					issueDate: '',
					expiryDate: '',
					testingCenter: '',
					notes: ''
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
	onsubmit={(e) => {
		persistCertificate();
		e.preventDefault();
	}}
	class="space-y-6"
>
	<FormField
		id="certificate-number"
		type="text"
		placeholder={$t('forms.placeholders.certificateNumber')}
		bind:value={certificate.certificateNumber}
		icon={IdCard}
		label={$t('forms.labels.certificateNumber')}
		required={true}
		ariaLabel="Certificate Number"
	/>
	<div class="grid grid-flow-row grid-cols-2 gap-4">
		<FormField
			id="issue-date"
			type="date"
			placeholder={$t('forms.placeholders.issueDate')}
			bind:value={certificate.issueDate}
			icon={Calendar1}
			label={$t('forms.labels.issueDate')}
			required={true}
			ariaLabel="Issue Date"
		/>
		<FormField
			id="expiry-date"
			type="date"
			placeholder={$t('forms.placeholders.expiryDate')}
			bind:value={certificate.expiryDate}
			icon={Calendar1}
			label={$t('forms.labels.expiryDate')}
			required={true}
			ariaLabel="Expiry Date"
		/>
	</div>
	<FormField
		id="testing-center"
		type="text"
		placeholder={$t('forms.placeholders.testingCenter')}
		bind:value={certificate.testingCenter}
		icon={TestTube2}
		label={$t('forms.labels.testingCenter')}
		required={true}
		ariaLabel="Testing Center"
	/>
	<FormField
		id="notes"
		type="text"
		placeholder={$t('forms.placeholders.notes')}
		bind:value={certificate.notes}
		icon={Notebook}
		label={$t('forms.labels.notes')}
		required={false}
		ariaLabel="Notes"
	/>
	<Button type="submit" variant="primary" text={editMode ? $t('forms.buttons.update') : $t('forms.buttons.add')} />
</form>
<StatusBlock message={status.message} type={status.type} />
