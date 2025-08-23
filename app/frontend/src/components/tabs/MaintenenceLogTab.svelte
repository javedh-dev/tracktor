<script lang="ts">
	import { t } from '$lib/stores/i18n';
	import TabContainer from '$components/common/TabContainer.svelte';
	import MaintenanceLogList from '$components/lists/MaintenanceLogList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title={$t('navigation.maintenance')}>
	<MaintenanceLogList {vehicleId} />
</TabContainer>
