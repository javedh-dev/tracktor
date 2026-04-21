<script lang="ts">
  import Currency from '@lucide/svelte/icons/currency';
  import Fuel from '@lucide/svelte/icons/fuel';
  import RulerDimensionLine from '@lucide/svelte/icons/ruler-dimension-line';
  import Rabbit from '@lucide/svelte/icons/rabbit';
  import type { SettingsOption } from '$lib/types/settings';
  import SettingsSelectField from './SettingsSelectField.svelte';

  interface Props {
    form: any;
    formData: any;
    processing: boolean;
    uodOptions: SettingsOption[];
    uovOptions: SettingsOption[];
    gasUnitOptions: SettingsOption[];
    mileageUnitFormatOptions: SettingsOption[];
    messages: typeof import('$lib/paraglide/messages');
  }

  let {
    form,
    formData,
    processing,
    uodOptions,
    uovOptions,
    gasUnitOptions,
    mileageUnitFormatOptions,
    messages: m
  }: Props = $props();

  let unitOfLpg = $state('liter');
  let unitOfCng = $state('kilogram');

  $effect(() => {
    unitOfLpg = (formData.unitOfLpg || formData.unitOfVolume || 'liter') as string;
    unitOfCng = (formData.unitOfCng || formData.unitOfVolume || 'kilogram') as string;
  });

  $effect(() => {
    if (formData.unitOfLpg !== unitOfLpg) {
      formData.update((fd: any) => ({ ...fd, unitOfLpg }));
    }
  });

  $effect(() => {
    if (formData.unitOfCng !== unitOfCng) {
      formData.update((fd: any) => ({ ...fd, unitOfCng }));
    }
  });
</script>

<fieldset class="grid gap-4 lg:grid-cols-2" disabled={processing}>
  <SettingsSelectField
    {form}
    name="unitOfDistance"
    label={m.settings_label_unit_distance()}
    description={m.settings_desc_unit_distance()}
    icon={RulerDimensionLine}
    options={uodOptions}
    placeholder={m.settings_select_unit_system()}
    bind:value={$formData.unitOfDistance}
    disabled={processing}
  />
  <SettingsSelectField
    {form}
    name="mileageUnitFormat"
    label={m.settings_label_mileage_format()}
    description={m.settings_desc_mileage_format()}
    icon={Rabbit}
    options={mileageUnitFormatOptions}
    placeholder={m.settings_select_unit_system()}
    bind:value={$formData.mileageUnitFormat}
    disabled={processing}
  />
  <div class="space-y-3 lg:col-span-2">
    <div class="space-y-1">
      <p class="text-sm font-medium">{m.settings_fuel_types_label()}</p>
      <p class="text-muted-foreground text-xs">{m.settings_fuel_types_desc()}</p>
    </div>
    <div class="grid gap-4 lg:grid-cols-3">
      <SettingsSelectField
        {form}
        name="unitOfVolume"
        label={m.fuel_type_label_petrol_diesel()}
        description={m.settings_desc_unit_volume()}
        icon={Currency}
        options={uovOptions}
        placeholder={m.settings_select_unit_system()}
        bind:value={$formData.unitOfVolume}
        disabled={processing}
      />
      <SettingsSelectField
        {form}
        name="unitOfLpg"
        label={m.fuel_type_label_lpg()}
        description={m.settings_desc_unit_volume()}
        icon={Fuel}
        options={gasUnitOptions}
        placeholder={m.settings_select_unit_system()}
        bind:value={unitOfLpg}
        disabled={processing}
      />
      <SettingsSelectField
        {form}
        name="unitOfCng"
        label={m.fuel_type_label_cng()}
        description={m.settings_desc_unit_volume()}
        icon={Fuel}
        options={gasUnitOptions}
        placeholder={m.settings_select_unit_system()}
        bind:value={unitOfCng}
        disabled={processing}
      />
    </div>
  </div>
</fieldset>
