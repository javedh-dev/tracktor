<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import MaintenanceLogList from '$lib/components/features/dashboard/maintenance/MaintenanceLogList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title="Maintenance History">
	<MaintenanceLogList {vehicleId} />
</TabContainer>
