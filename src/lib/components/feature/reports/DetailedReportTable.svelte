<script lang="ts">
  import * as Tabs from '$ui/tabs';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Shield from '@lucide/svelte/icons/shield';
  import FuelLogList from '$feature/fuel/FuelLogList.svelte';
  import MaintenanceLogList from '$feature/maintenance/MaintenanceLogList.svelte';
  import ComplianceList from '$feature/compliance/ComplianceList.svelte';
  import * as m from '$lib/paraglide/messages';
</script>

<Tabs.Root value="fuel">
  <Tabs.List>
    <Tabs.Trigger value="fuel">
      <LabelWithIcon icon={Fuel} iconClass="h-4 w-4" label={m.reports_type_fuel()} />
    </Tabs.Trigger>
    <Tabs.Trigger value="maintenance">
      <LabelWithIcon icon={Wrench} iconClass="h-4 w-4" label={m.reports_type_maintenance()} />
    </Tabs.Trigger>
    <Tabs.Trigger value="compliance">
      <LabelWithIcon icon={Shield} iconClass="h-4 w-4" label={m.reports_type_compliance()} />
    </Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="fuel" class="pt-4">
    <FuelLogList />
  </Tabs.Content>
  <Tabs.Content value="maintenance" class="pt-4">
    <MaintenanceLogList />
  </Tabs.Content>
  <Tabs.Content value="compliance" class="pt-4">
    <ComplianceList />
  </Tabs.Content>
</Tabs.Root>
