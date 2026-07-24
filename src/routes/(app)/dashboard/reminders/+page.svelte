<script lang="ts">
  import DashboardFeaturePage from '$layout/DashboardFeaturePage.svelte';
  import ReminderTab from '$feature/reminder/ReminderTab.svelte';
  import { Features } from '$lib/helper/feature.helper';
  import {
    feature_reminders_disabled_title,
    feature_reminders_disabled_hint
  } from '$lib/paraglide/messages/_index.js';
</script>

<DashboardFeaturePage
  feature={Features.REMINDERS}
  containerId="reminders-page-container"
  disabledTitle={feature_reminders_disabled_title()}
  disabledHint={feature_reminders_disabled_hint()}
  tabComponent={ReminderTab}
/>
