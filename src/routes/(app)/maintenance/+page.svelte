<script lang="ts">
  import DashboardFeaturePage from '$layout/DashboardFeaturePage.svelte';
  import MaintenenceLogTab from '$feature/maintenance/MaintenenceLogTab.svelte';
  import { Features } from '$lib/helper/feature.helper';
  import {
    feature_maintenance_disabled_title,
    feature_maintenance_disabled_hint
  } from '$lib/paraglide/messages/_index.js';
</script>

<DashboardFeaturePage
  feature={Features.MAINTENANCE}
  containerId="maintenance-page-container"
  disabledTitle={feature_maintenance_disabled_title()}
  disabledHint={feature_maintenance_disabled_hint()}
  tabComponent={MaintenenceLogTab}
/>
