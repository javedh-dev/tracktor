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
</script>

<fieldset class="flex flex-col gap-4" disabled={processing}>
  <SettingsSelectField
    {form}
    name="unitOfDistance"
    label={m.settings_label_unit_distance()}
    description={m.settings_desc_unit_distance()}
    icon={RulerDimensionLine}
    options={uodOptions}
    placeholder={m.settings_select_unit_system()}
    bind:value={formData.unitOfDistance}
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
    bind:value={formData.mileageUnitFormat}
    disabled={processing}
  />
  <div class="space-y-3">
    <div class="space-y-1">
      <p class="text-sm font-medium">Fuel types</p>
      <p class="text-muted-foreground text-xs">Choose the measurement for each fuel.</p>
    </div>
    <div class="flex flex-col gap-4">
      <SettingsSelectField
        {form}
        name="unitOfVolume"
        label="Petrol/Diesel"
        description={m.settings_desc_unit_volume()}
        icon={Currency}
        options={uovOptions}
        placeholder={m.settings_select_unit_system()}
        bind:value={formData.unitOfVolume}
        disabled={processing}
      />
      <SettingsSelectField
        {form}
        name="unitOfLpg"
        label="LPG"
        description={m.settings_desc_unit_volume()}
        icon={Fuel}
        options={gasUnitOptions}
        placeholder={m.settings_select_unit_system()}
        bind:value={formData.unitOfLpg}
        disabled={processing}
      />
      <SettingsSelectField
        {form}
        name="unitOfCng"
        label="CNG"
        description={m.settings_desc_unit_volume()}
        icon={Fuel}
        options={gasUnitOptions}
        placeholder={m.settings_select_unit_system()}
        bind:value={formData.unitOfCng}
        disabled={processing}
      />
    </div>
  </div>
</fieldset>
