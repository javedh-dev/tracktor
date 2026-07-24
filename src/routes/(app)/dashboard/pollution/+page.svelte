<script lang="ts">
  import DashboardFeaturePage from '$layout/DashboardFeaturePage.svelte';
  import PollutionTab from '$feature/pollution/PollutionTab.svelte';
  import { Features } from '$lib/helper/feature.helper';
  import {
    feature_pucc_disabled_title,
    feature_pucc_disabled_hint
  } from '$lib/paraglide/messages/_index.js';
</script>

<DashboardFeaturePage
  feature={Features.PUCC}
  containerId="pollution-page-container"
  disabledTitle={feature_pucc_disabled_title()}
  disabledHint={feature_pucc_disabled_hint()}
  tabComponent={PollutionTab}
/>
