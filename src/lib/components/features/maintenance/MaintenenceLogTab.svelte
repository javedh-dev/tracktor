<script lang="ts">
	import TabContainer from '$lib/components/app/TabContainer.svelte';
	import MaintenanceLogList from './MaintenanceLogList.svelte';
</script>

<TabContainer title="Maintenance History">
	<MaintenanceLogList />
</TabContainer>
