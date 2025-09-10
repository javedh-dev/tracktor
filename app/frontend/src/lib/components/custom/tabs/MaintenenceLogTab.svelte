<script lang="ts">
	import TabContainer from '$components/common/TabContainer.svelte';
	import MaintenanceLogList from '$components/lists/MaintenanceLogList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title="Maintenance History">
	<MaintenanceLogList {vehicleId} />
</TabContainer>
