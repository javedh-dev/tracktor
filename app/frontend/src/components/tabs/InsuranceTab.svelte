<script lang="ts">
	import { t } from '$lib/stores/i18n';
	import TabContainer from '$components/common/TabContainer.svelte';
	import InsuranceDetailsList from '$components/lists/InsuranceList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title={$t('navigation.insurance')}>
	<InsuranceDetailsList {vehicleId} />
</TabContainer>
