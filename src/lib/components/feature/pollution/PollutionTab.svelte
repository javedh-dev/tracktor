<script lang="ts">
  import FeatureTabShell from '$appui/FeatureTabShell.svelte';
  import PollutionCertificateForm from './PollutionCertificateForm.svelte';
  import PollutionCertificateList from './PollutionCertificateList.svelte';
  import * as m from '$lib/paraglide/messages';
</script>

<FeatureTabShell
  title={m.pollution_tab_title()}
  listComponent={PollutionCertificateList}
  addSheetTitle={m.pollution_add_action()}
  addSheetComponent={PollutionCertificateForm}
/>
