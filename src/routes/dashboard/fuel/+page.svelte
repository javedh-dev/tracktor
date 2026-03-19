<script lang="ts">
  import DashboardFeaturePage from '$layout/DashboardFeaturePage.svelte';
  import FuelLogTab from '$feature/fuel/FuelLogTab.svelte';
  import { Features } from '$lib/helper/feature.helper';
  import {
    feature_fuel_disabled_title,
    feature_fuel_disabled_hint
  } from '$lib/paraglide/messages/_index.js';
</script>

<DashboardFeaturePage
  feature={Features.FUEL_LOG}
  containerId="fuel-page-container"
  disabledTitle={feature_fuel_disabled_title()}
  disabledHint={feature_fuel_disabled_hint()}
  tabComponent={FuelLogTab}
/>
