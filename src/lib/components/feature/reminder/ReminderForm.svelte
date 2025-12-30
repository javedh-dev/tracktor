<script lang="ts">
	import * as Form from '$ui/form/index.js';
	import FormLabel from '$appui/FormLabel.svelte';
	import Input from '$appui/input.svelte';
	import { Textarea } from '$ui/textarea';
	import {
		REMINDER_TYPES,
		REMINDER_SCHEDULES,
		REMINDER_RECURRENCE_TYPES,
		reminderSchema
	} from '$lib/domain/reminder';
	import { superForm, defaults } from 'sveltekit-superforms';
	import Repeat from '@lucide/svelte/icons/repeat';
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
	import * as m from '$lib/paraglide/messages';

	let { data }: { data?: Partial<Reminder> } = $props();
	let processing = $state(false);

	const form = superForm(defaults(zod4(reminderSchema)), {
		validators: zod4(reminderSchema),
		SPA: true,
		resetForm: false,
		onUpdated: async ({ form: f }) => {
			if (f.valid) {
				processing = true;
				saveReminder({
					...f.data,
					dueDate: parseDate(f.data.dueDate),
					recurrenceEndDate: f.data.recurrenceEndDate ? parseDate(f.data.recurrenceEndDate) : null
				}).then((res) => {
					if (res.status === 'OK') {
						toast.success(m[data ? 'reminder_toast_updated' : 'reminder_toast_created']());
						sheetStore.closeSheet(reminderStore.refreshReminders);
					} else {
						toast.error(res.error || m.reminder_toast_error_fallback());
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
				recurrenceType: data.recurrenceType || fd.recurrenceType,
				recurrenceInterval: data.recurrenceInterval || fd.recurrenceInterval,
				recurrenceEndDate: data.recurrenceEndDate
					? formatDate(data.recurrenceEndDate)
					: fd.recurrenceEndDate,
				note: data.note ?? fd.note,
				isCompleted: data.isCompleted ?? fd.isCompleted
			}));
		}
	});
</script>

<form id="reminder-form" use:enhance onsubmit={(e) => e.preventDefault()}>
	<fieldset class="flex flex-col gap-4" disabled={processing}>
		<Form.Field {form} name="dueDate" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description={m.reminder_form_due_date_desc()} required
						>{m.reminder_form_due_date_label()}</FormLabel
					>
					<Input {...props} bind:value={$formData.dueDate} type="calendar" icon={Calendar1} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="type" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description={m.reminder_form_type_desc()} required
						>{m.reminder_form_type_label()}</FormLabel
					>
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
					<FormLabel description={m.reminder_form_schedule_desc()} required
						>{m.reminder_form_schedule_label()}</FormLabel
					>
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

		<Form.Field {form} name="recurrenceType" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description={m.reminder_form_recurrence_type_desc()}
						>{m.reminder_form_recurrence_type_label()}</FormLabel
					>
					<Select.Root bind:value={$formData.recurrenceType} type="single">
						<Select.Trigger {...props} class="w-full">
							<div class="flex items-center gap-2">
								<Repeat class="h-4 w-4" />
								<span>
									{REMINDER_RECURRENCE_TYPES[
										$formData.recurrenceType as keyof typeof REMINDER_RECURRENCE_TYPES
									] || 'Select recurrence'}
								</span>
							</div>
						</Select.Trigger>
						<Select.Content>
							{#each Object.entries(REMINDER_RECURRENCE_TYPES) as [value, label]}
								<Select.Item {value}>{label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		{#if $formData.recurrenceType && $formData.recurrenceType !== 'none'}
			<Form.Field {form} name="recurrenceInterval" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<FormLabel description={m.reminder_form_recurrence_interval_desc()}>
							Repeat every {$formData.recurrenceInterval || 1}
							{$formData.recurrenceType === 'yearly'
								? 'year(s)'
								: $formData.recurrenceType === 'monthly'
									? 'month(s)'
									: $formData.recurrenceType === 'weekly'
										? 'week(s)'
										: 'day(s)'}
						</FormLabel>
						<Input {...props} bind:value={$formData.recurrenceInterval} type="number" min="1" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="recurrenceEndDate" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<FormLabel description={m.reminder_form_recurrence_end_date_desc()}
							>{m.reminder_form_recurrence_end_date_label()}</FormLabel
						>
						<Input
							{...props}
							bind:value={$formData.recurrenceEndDate}
							icon={Calendar1}
							type="calendar"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{/if}

		<Form.Field {form} name="note" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description={m.reminder_form_note_desc()}
						>{m.reminder_form_note_label()}</FormLabel
					>
					<Textarea
						{...props}
						placeholder={m.reminder_form_note_placeholder()}
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
						<span>{m.reminder_form_is_completed_label()}</span>
					</label>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<SubmitButton {processing} class="w-full">{m.common_submit()}</SubmitButton>
	</fieldset>
</form>
