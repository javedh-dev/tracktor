<script lang="ts">
	import TabContainer from '$appui/common/TabContainer.svelte';
	import MaintenanceLogList from '$appui/lists/MaintenanceLogList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title="Maintenance History">
	<MaintenanceLogList {vehicleId} />
</TabContainer>
