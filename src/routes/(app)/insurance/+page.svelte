<script lang="ts">
  import InsuranceTab from '$feature/insurance/InsuranceTab.svelte';
  import { Features } from '$lib/helper/feature.helper';
  import FeaturePageShell from '$feature/shared/FeaturePageShell.svelte';
  import {
    feature_insurance_disabled_title,
    feature_insurance_disabled_hint,
    insurance_page_title,
    insurance_page_description
  } from '$lib/paraglide/messages/_index.js';
</script>

<FeaturePageShell
  feature={Features.INSURANCE}
  title={insurance_page_title()}
  description={insurance_page_description()}
  disabledTitle={feature_insurance_disabled_title()}
  disabledHint={feature_insurance_disabled_hint()}
>
  <InsuranceTab />
</FeaturePageShell>
