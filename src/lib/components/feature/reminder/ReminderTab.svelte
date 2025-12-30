<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import { sheetStore } from '$lib/stores/sheet.svelte';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';
	import ReminderForm from './ReminderForm.svelte';
	import ReminderList from './ReminderList.svelte';
	import * as m from '$lib/paraglide/messages';
</script>

<TabContainer
	title={m.reminder_tab_title()}
	addAction={() =>
		sheetStore.openSheet(ReminderForm, m.reminder_add_action(), '', {
			vehicleId: vehicleStore.selectedId
		})}
	addActionDisabled={!vehicleStore.selectedId}
>
	<ReminderList />
</TabContainer>
