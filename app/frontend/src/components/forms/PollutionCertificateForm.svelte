<script lang="ts">
	import Button from '$components/common/Button.svelte';
	import FormField from '$components/common/FormField.svelte';
	import StatusBlock from '$components/common/StatusBlock.svelte';
	import { env } from '$env/dynamic/public';
	import { handleApiError } from '$lib/models/Error';
	import type { Status } from '$lib/models/status';
	import { cleanup } from '$lib/utils/formatting';
	import { Calendar1, IdCard, Notebook, TestTube2 } from '@lucide/svelte';

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
				message: 'Certificate Number, Issue Date, Expiry Date, Testing Center are required.',
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
					body: JSON.stringify(cleanup(certificate))
				}
			);

			if (response.ok) {
				status = {
					message: `Pollution Certificate ${editMode ? 'updated' : 'added'} successfully!`,
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
	onsubmit={(e) => {
		persistCertificate();
		e.preventDefault();
	}}
	class="space-y-6"
>
	<FormField
		id="certificate-number"
		type="text"
		placeholder="Certificate Number"
		bind:value={certificate.certificateNumber}
		icon={IdCard}
		label="Certificate Number"
		required={true}
		ariaLabel="Certificate Number"
	/>
	<div class="grid grid-flow-row grid-cols-2 gap-4">
		<FormField
			id="issue-date"
			type="date"
			placeholder="Issue Date"
			bind:value={certificate.issueDate}
			icon={Calendar1}
			label="Issue Date"
			required={true}
			ariaLabel="Issue Date"
		/>
		<FormField
			id="expiry-date"
			type="date"
			placeholder="Expiry Date"
			bind:value={certificate.expiryDate}
			icon={Calendar1}
			label="Expiry date"
			required={true}
			ariaLabel="Expiry Date"
		/>
	</div>
	<FormField
		id="testing-center"
		type="text"
		placeholder="Testing Center"
		bind:value={certificate.testingCenter}
		icon={TestTube2}
		label="Testing Center"
		required={true}
		ariaLabel="Testing Center"
	/>
	<FormField
		id="notes"
		type="text"
		placeholder="Notes"
		bind:value={certificate.notes}
		icon={Notebook}
		label="Notes"
		required={false}
		ariaLabel="Notes"
	/>
	<Button type="submit" variant="primary" text={editMode ? 'Update' : 'Add'} {loading} />
</form>
<StatusBlock message={status.message} type={status.type} />
