<script lang="ts">
	import AppSheet from '$lib/components/layout/AppSheet.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { formatDate, parseDate } from '$lib/helper/format.helper';
	import { saveInsurance } from '$lib/services/insurance.service';
	import { insuranceStore } from '$lib/stores/insurance.svelte';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';
	import { insuranceSchema } from '$lib/domain/insurance';
	import Banknote from '@lucide/svelte/icons/banknote';
	import Calendar1 from '@lucide/svelte/icons/calendar-1';
	import IdCard from '@lucide/svelte/icons/id-card';
	import Building2 from '@lucide/svelte/icons/building-2';
	import { toast } from 'svelte-sonner';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';

	// let open = $state(false);
	// let insuranceToEdit: Insurance | undefined = $state();
	// let vehicleId: string | undefined = $state();

	// insuranceModelStore.subscribe((data) => {
	// 	open = data.show;
	// 	insuranceToEdit = data.entryToEdit;
	// 	vehicleId = data.vehicleId;
	// });

	const form = superForm(defaults(zod4(insuranceSchema)), {
		validators: zod4(insuranceSchema),
		SPA: true,
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				saveInsurance({
					...f.data,
					startDate: parseDate(f.data.startDate),
					endDate: parseDate(f.data.endDate)
				}).then((res) => {
					if (res.status == 'OK') {
						vehicleStore.refreshVehicles();
						toast.success(
							`Insurance ${insuranceStore.selectedId ? 'updated' : 'saved'} successfully...!!!`
						);
						insuranceStore.openForm(false);
					} else {
						toast.error(`Error while saving : ${res.error}`);
					}
				});
			}
		}
	});
	const { form: formData, enhance } = form;

	$effect(() => {
		const insuranceToEdit = insuranceStore.insurances?.find(
			(ins) => ins.id == insuranceStore.selectedId
		);
		if (insuranceToEdit) {
			formData.set({
				...insuranceToEdit,
				startDate: formatDate(insuranceToEdit.startDate),
				endDate: formatDate(insuranceToEdit.endDate)
			});
		}
		formData.update((data) => {
			return { ...data, vehicleId: insuranceStore.vehicleId || '' };
		});
	});
</script>

<AppSheet
	open={insuranceStore.openSheet}
	close={() => insuranceStore.openForm(false)}
	title="Add Insurance"
>
	<form use:enhance onsubmit={(e) => e.preventDefault()}>
		<div class="flex flex-col gap-4">
			<Form.Field {form} name="provider" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Insurance provider name">Provider</Form.Label>
						<Input {...props} bind:value={$formData.provider} icon={Building2} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="policyNumber" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Insurance policy number">Policy Number</Form.Label>
						<Input {...props} bind:value={$formData.policyNumber} icon={IdCard} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="startDate" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Insurance start date">Start Date</Form.Label>
						<Input {...props} bind:value={$formData.startDate} icon={Calendar1} type="calendar" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="endDate" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Insurance end date">End Date</Form.Label>
						<Input {...props} bind:value={$formData.endDate} icon={Calendar1} type="calendar" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="cost" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Insurance cost">Cost</Form.Label>
						<Input
							{...props}
							bind:value={$formData.cost}
							icon={Banknote}
							type="number"
							step=".01"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="notes" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Additional notes">Notes</Form.Label>
						<Textarea
							{...props}
							placeholder="Add more details. If any..."
							class="resize-none"
							bind:value={$formData.notes}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Button>Submit</Form.Button>
		</div>
	</form>
</AppSheet>
