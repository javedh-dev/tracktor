<script lang="ts">
  import PageHeader from '$dashboard/PageHeader.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import VehicleForm from '$feature/vehicle/VehicleForm.svelte';
  import VehicleList from '$feature/vehicle/VehicleList.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import Button from '$ui/button/button.svelte';
  import CirclePlus from '@lucide/svelte/icons/circle-plus';
  import { app_add_vehicle } from '$lib/paraglide/messages/_index.js';
</script>

<div class="space-y-6">
  <PageHeader title="Vehicles">
    <Button
      variant="default"
      onclick={() => sheetStore.openSheet(VehicleForm, app_add_vehicle())}
    >
      <LabelWithIcon icon={CirclePlus} label={app_add_vehicle()} />
    </Button>
  </PageHeader>

  <VehicleList />
</div>
