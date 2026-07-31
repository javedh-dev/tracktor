<script lang="ts">
  import FilterTabs from '$dashboard/FilterTabs.svelte';
  import CirclePlus from '@lucide/svelte/icons/circle-plus';
  import { Features } from '$lib/helper/feature.helper';
  import FeaturePageShell from '$feature/shared/FeaturePageShell.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import ReminderForm from '$feature/reminder/ReminderForm.svelte';
  import ReminderList from '$feature/reminder/ReminderList.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import Button from '$ui/button/button.svelte';
  import type { Reminder } from '$lib/domain';
  import * as m from '$lib/paraglide/messages';
  import {
    feature_reminders_disabled_title,
    feature_reminders_disabled_hint
  } from '$lib/paraglide/messages/_index.js';

  let typeFilter = $state<string>('upcoming');

  const tabs = [
    { id: 'upcoming', label: m.reminder_filter_all() },
    { id: 'service', label: m.reminder_filter_service() },
    { id: 'puc', label: m.reminder_filter_puc() },
    { id: 'insurance', label: m.reminder_filter_insurance() },
    { id: 'others', label: m.reminder_filter_others() }
  ];

  function matchesTypeFilter(reminder: Reminder): boolean {
    switch (typeFilter) {
      case 'service':
        return reminder.type === 'maintenance';
      case 'puc':
        return reminder.type === 'pollution';
      case 'insurance':
        return reminder.type === 'insurance';
      case 'others':
        return !['maintenance', 'pollution', 'insurance'].includes(reminder.type);
      default:
        return true;
    }
  }

  const upcomingFilter = (reminder: Reminder) =>
    !reminder.isCompleted && matchesTypeFilter(reminder);
  const completedFilter = (reminder: Reminder) =>
    reminder.isCompleted && matchesTypeFilter(reminder);
</script>

<FeaturePageShell
  feature={Features.REMINDERS}
  title={m.reminder_page_title()}
  description={m.reminder_page_description()}
  disabledTitle={feature_reminders_disabled_title()}
  disabledHint={feature_reminders_disabled_hint()}
>
  {#snippet actions()}
    <Button
      variant="default"
      onclick={() => sheetStore.openSheet(ReminderForm, m.reminder_add_action())}
    >
      <LabelWithIcon icon={CirclePlus} label={m.reminder_add_action()} />
    </Button>
  {/snippet}
  <FilterTabs {tabs} bind:value={typeFilter} />

  <div class="space-y-3">
    <h3 class="text-lg font-semibold">{m.reminder_section_upcoming()}</h3>
    <ReminderList filter={upcomingFilter} />
  </div>

  <div class="space-y-3">
    <h3 class="text-lg font-semibold">{m.reminder_section_completed()}</h3>
    <ReminderList filter={completedFilter} />
  </div>
</FeaturePageShell>
