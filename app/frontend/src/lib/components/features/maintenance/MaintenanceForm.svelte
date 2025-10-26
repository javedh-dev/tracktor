<script lang="ts">
	import AppSheet from '$lib/components/layout/AppSheet.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { formatDate, parseDate } from '$lib/helper/format.helper';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';
	import { maintenanceSchema } from '$lib/domain/maintenance';
	import Banknote from '@lucide/svelte/icons/banknote';
	import Hammer from '@lucide/svelte/icons/hammer';
	import CircleGauge from '@lucide/svelte/icons/circle-gauge';
	import Calendar1 from '@lucide/svelte/icons/calendar-1';
	import { toast } from 'svelte-sonner';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { maintenanceStore } from '$lib/stores/maintenance.svelte';
	import { saveMaintenanceLog } from '$lib/services/maintenance.service';

	const form = superForm(defaults(zod4(maintenanceSchema)), {
		validators: zod4(maintenanceSchema),
		SPA: true,
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				saveMaintenanceLog({ ...f.data, date: parseDate(f.data.date) }).then((res) => {
					if (res.status == 'OK') {
						vehicleStore.refreshVehicles();
						toast.success(
							`Maintenance Log ${maintenanceStore.editMode ? 'updated' : 'saved'} successfully...!!!`
						);
						maintenanceStore.openForm(false);
					} else {
						toast.error(`Error while saving : ${res.error}`);
					}
				});
			}
		}
	});
	const { form: formData, enhance } = form;

	$effect(() => {
		if (maintenanceStore.selectedId && maintenanceStore.editMode) {
			const logToEdit = maintenanceStore.maintenanceLogs?.find(
				(log) => log.id == maintenanceStore.selectedId
			);
			if (logToEdit) {
				formData.set({ ...logToEdit, date: formatDate(logToEdit.date) });
			}
		}
		formData.update((data) => {
			return { ...data, vehicleId: maintenanceStore.vehicleId || '' };
		});
	});
</script>

<AppSheet
	open={maintenanceStore.openSheet}
	close={() => maintenanceStore.openForm(false)}
	title="Add Maintenance Log"
>
	<form use:enhance onsubmit={(e) => e.preventDefault()}>
		<div class="flex flex-col gap-4">
			<!-- <div class="flex w-full flex-row gap-4"> -->
			<Form.Field {form} name="date" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Maintenance Date">Date</Form.Label>
						<Input
							{...props}
							bind:value={$formData.date}
							icon={Calendar1}
							type="calendar"
							disabled
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="odometer" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Current vehicle odometer reading">Odometer</Form.Label>
						<Input {...props} bind:value={$formData.odometer} icon={CircleGauge} type="number" />
					{/snippet}
				</Form.Control>
				<!-- <Form.Description>Model of the vehicle</Form.Description> -->
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="serviceCenter" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Name of Service center">Service Center</Form.Label>
						<Input {...props} bind:value={$formData.serviceCenter} icon={Hammer} />
					{/snippet}
				</Form.Control>
				<!-- <Form.Description>Model of the vehicle</Form.Description> -->
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="cost" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Cost of Maintenance">Cost</Form.Label>
						<Input
							{...props}
							bind:value={$formData.cost}
							icon={Banknote}
							type="number"
							step=".01"
						/>
					{/snippet}
				</Form.Control>
				<!-- <Form.Description>Model of the vehicle</Form.Description> -->
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="notes" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="More details">Notes</Form.Label>
						<Textarea
							{...props}
							placeholder="Add more details. If any..."
							class="resize-none"
							bind:value={$formData.notes}
						/>
					{/snippet}
				</Form.Control>
				<!-- <Form.Description>Model of the vehicle</Form.Description> -->
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button>Submit</Form.Button>
		</div>
	</form>
</AppSheet>
