<script lang="ts">
  import DashboardFeaturePage from '$layout/DashboardFeaturePage.svelte';
  import InsuranceTab from '$feature/insurance/InsuranceTab.svelte';
  import { Features } from '$lib/helper/feature.helper';
  import {
    feature_insurance_disabled_title,
    feature_insurance_disabled_hint
  } from '$lib/paraglide/messages/_index.js';
</script>

<DashboardFeaturePage
  feature={Features.INSURANCE}
  containerId="insurance-page-container"
  disabledTitle={feature_insurance_disabled_title()}
  disabledHint={feature_insurance_disabled_hint()}
  tabComponent={InsuranceTab}
/>
