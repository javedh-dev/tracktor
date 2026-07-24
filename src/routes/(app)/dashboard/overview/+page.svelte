<script lang="ts">
  import DashboardFeaturePage from '$layout/DashboardFeaturePage.svelte';
  import OverviewTab from '$feature/overview/OverviewTab.svelte';
  import { Features } from '$lib/helper/feature.helper';
  import {
    feature_overview_disabled_title,
    feature_overview_disabled_hint
  } from '$lib/paraglide/messages/_index.js';
</script>

<DashboardFeaturePage
  feature={Features.OVERVIEW}
  containerId="overview-page-container"
  disabledTitle={feature_overview_disabled_title()}
  disabledHint={feature_overview_disabled_hint()}
  tabComponent={OverviewTab}
/>
