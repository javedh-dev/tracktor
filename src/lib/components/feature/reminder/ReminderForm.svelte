<script lang="ts">
	import * as Form from '$ui/form/index.js';
	import FormLabel from '$appui/FormLabel.svelte';
	import Input from '$appui/input.svelte';
	import { Textarea } from '$ui/textarea';
	import { REMINDER_TYPES, REMINDER_SCHEDULES, reminderSchema } from '$lib/domain/reminder';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { sheetStore } from '$stores/sheet.svelte';
	import SubmitButton from '$appui/SubmitButton.svelte';
	import type { Reminder } from '$lib/domain';
	import Calendar1 from '@lucide/svelte/icons/calendar-1';
	import BellRing from '@lucide/svelte/icons/bell-ring';
	import Layers from '@lucide/svelte/icons/layers';
	import * as Select from '$ui/select/index.js';
	import { formatDate, parseDate } from '$lib/helper/format.helper';
	import { reminderStore } from '$stores/reminder.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import { saveReminder } from '$lib/services/reminder.service';
	import { toast } from 'svelte-sonner';

	let { data }: { data?: Partial<Reminder> } = $props();
	let processing = $state(false);

	const form = superForm(defaults(zod4(reminderSchema)), {
		validators: zod4(reminderSchema),
		SPA: true,
		resetForm: false,
		onUpdated: async ({ form: f }) => {
			if (f.valid) {
				processing = true;
				saveReminder({ ...f.data, dueDate: parseDate(f.data.dueDate) }).then((res) => {
					if (res.status === 'OK') {
						toast.success(`Reminder ${data ? 'updated' : 'created'} successfully.`);
						sheetStore.closeSheet(reminderStore.refreshReminders);
					} else {
						toast.error(res.error || 'Failed to save reminder.');
					}
					processing = false;
				});
			}
		}
	});

	const { form: formData, enhance } = form;

	const resolveVehicleId = () => data?.vehicleId || vehicleStore.selectedId || '';

	$effect(() => {
		const vehicleId = resolveVehicleId();
		if (vehicleId) {
			formData.update((fd) => ({
				...fd,
				vehicleId
			}));
		}
	});

	$effect(() => {
		if (data?.id) {
			formData.update((fd) => ({
				...fd,
				id: data.id || null,
				vehicleId: resolveVehicleId(),
				type: data.type || fd.type,
				dueDate: data.dueDate ? formatDate(data.dueDate) : fd.dueDate,
				remindSchedule: data.remindSchedule || fd.remindSchedule,
				note: data.note ?? fd.note,
				isCompleted: data.isCompleted ?? fd.isCompleted
			}));
		}
	});
</script>

<form use:enhance onsubmit={(e) => e.preventDefault()}>
	<fieldset class="flex flex-col gap-4" disabled={processing}>
		<Form.Field {form} name="dueDate" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="When should this reminder trigger?" required>Due Date</FormLabel>
					<Input {...props} bind:value={$formData.dueDate} type="calendar" icon={Calendar1} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="type" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="Choose the reminder type" required>Type</FormLabel>
					<Select.Root bind:value={$formData.type} type="single">
						<Select.Trigger {...props} class="w-full">
							<div class="flex items-center gap-2">
								<Layers class="h-4 w-4" />
								<span
									>{REMINDER_TYPES[$formData.type as keyof typeof REMINDER_TYPES] ||
										'Select type'}</span
								>
							</div>
						</Select.Trigger>
						<Select.Content>
							{#each Object.entries(REMINDER_TYPES) as [value, label]}
								<Select.Item {value}>{label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="remindSchedule" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="When should we remind you?" required>Reminder Schedule</FormLabel>
					<Select.Root bind:value={$formData.remindSchedule} type="single">
						<Select.Trigger {...props} class="w-full">
							<div class="flex items-center gap-2">
								<BellRing class="h-4 w-4" />
								<span>
									{REMINDER_SCHEDULES[
										$formData.remindSchedule as keyof typeof REMINDER_SCHEDULES
									] || 'Reminder timing'}
								</span>
							</div>
						</Select.Trigger>
						<Select.Content>
							{#each Object.entries(REMINDER_SCHEDULES) as [value, label]}
								<Select.Item {value}>{label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="note" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="Add more context">Note</FormLabel>
					<Textarea
						{...props}
						placeholder="Detail what needs attention"
						class="resize-none"
						bind:value={$formData.note}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="isCompleted">
			<Form.Control>
				{#snippet children({ props })}
					<label class="flex items-center gap-2 text-sm font-medium">
						<input type="checkbox" {...props} bind:checked={$formData.isCompleted} />
						<span>Mark as done</span>
					</label>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<SubmitButton {processing} class="w-full"
			>{$formData.id ? 'Update' : 'Create'} Reminder</SubmitButton
		>
	</fieldset>
</form>
