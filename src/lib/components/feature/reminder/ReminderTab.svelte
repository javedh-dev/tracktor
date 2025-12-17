<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import { sheetStore } from '$lib/stores/sheet.svelte';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';
	import ReminderForm from './ReminderForm.svelte';
	import ReminderList from './ReminderList.svelte';
</script>

<TabContainer
	title="Reminders"
	addAction={() =>
		sheetStore.openSheet(ReminderForm, 'Add Reminder', '', { vehicleId: vehicleStore.selectedId })}
	addActionDisabled={!vehicleStore.selectedId}
>
	<ReminderList />
</TabContainer>
