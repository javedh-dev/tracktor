<script lang="ts">
	import * as Form from '$ui/form/index.js';
	import FormLabel from '$appui/FormLabel.svelte';
	import Input from '$appui/input.svelte';
	import { Textarea } from '$ui/textarea';
	import { formatDate, parseDate } from '$lib/helper/format.helper';
	import { maintenanceSchema } from '$lib/domain/maintenance';
	import Banknote from '@lucide/svelte/icons/banknote';
	import Hammer from '@lucide/svelte/icons/hammer';
	import CircleGauge from '@lucide/svelte/icons/circle-gauge';
	import Calendar1 from '@lucide/svelte/icons/calendar-1';
	import { toast } from 'svelte-sonner';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { maintenanceStore } from '$stores/maintenance.svelte';
	import { saveMaintenanceLog } from '$lib/services/maintenance.service';
	import { sheetStore } from '$stores/sheet.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';

	let { data } = $props();

	const form = superForm(defaults(zod4(maintenanceSchema)), {
		validators: zod4(maintenanceSchema),
		SPA: true,
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				saveMaintenanceLog({ ...f.data, date: parseDate(f.data.date) }).then((res) => {
					if (res.status == 'OK') {
						toast.success(`Maintenance Log ${data ? 'updated' : 'saved'} successfully...!!!`);
						sheetStore.closeSheet(maintenanceStore.refreshMaintenanceLogs);
					} else {
						toast.error(`Error while saving : ${res.error}`);
					}
				});
			}
		}
	});
	const { form: formData, enhance } = form;

	$effect(() => {
		if (data) formData.set({ ...data, date: formatDate(data.date) });
		formData.update((fd) => {
			return {
				...fd,
				vehicleId: vehicleStore.selectedId || ''
			};
		});
	});
</script>

<form use:enhance onsubmit={(e) => e.preventDefault()}>
	<div class="flex flex-col gap-4">
		<!-- <div class="flex w-full flex-row gap-4"> -->
		<Form.Field {form} name="date" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="Maintenance Date">Date</FormLabel>
					<Input {...props} bind:value={$formData.date} icon={Calendar1} type="calendar" disabled />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="odometer" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="Current vehicle odometer reading">Odometer</FormLabel>
					<Input {...props} bind:value={$formData.odometer} icon={CircleGauge} type="number" />
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>Model of the vehicle</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="serviceCenter" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="Name of Service center">Service Center</FormLabel>
					<Input {...props} bind:value={$formData.serviceCenter} icon={Hammer} />
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>Model of the vehicle</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="cost" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="Cost of Maintenance">Cost</FormLabel>
					<Input {...props} bind:value={$formData.cost} icon={Banknote} type="number" step=".01" />
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>Model of the vehicle</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="notes" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="More details">Notes</FormLabel>
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
