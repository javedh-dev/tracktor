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
      <p class="text-sm font-medium">Fuel types</p>
      <p class="text-muted-foreground text-xs">Choose the measurement for each fuel.</p>
    </div>
    <div class="grid gap-4 lg:grid-cols-3">
      <SettingsSelectField
        {form}
        name="unitOfVolume"
        label="Petrol/Diesel"
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
        label="LPG"
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
        label="CNG"
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
