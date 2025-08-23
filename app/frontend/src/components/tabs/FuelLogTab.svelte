<script lang="ts">
	import { t } from '$lib/stores/i18n';
	import TabContainer from '$components/common/TabContainer.svelte';
	import FuelLogList from '$components/lists/FuelLogList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title={$t('navigation.fuelLogs')}>
	<FuelLogList {vehicleId} />
</TabContainer>
