<script lang="ts">
  import SettingsSelectField from './SettingsSelectField.svelte';
  import type { SettingsOption } from '$lib/types/settings';
  import Palette from '@lucide/svelte/icons/palette';
  import MoonStar from '@lucide/svelte/icons/moon-star';

  interface Props {
    form: any;
    formData: any;
    processing: boolean;
    themeOptions: Array<SettingsOption>;
    darkVariantOptions: Array<SettingsOption>;
    messages: typeof import('$lib/paraglide/messages');
  }

  let {
    form,
    formData,
    processing,
    themeOptions,
    darkVariantOptions,
    messages: m
  }: Props = $props();
</script>

<fieldset class="grid gap-4 sm:grid-cols-2" disabled={processing}>
  <SettingsSelectField
    {form}
    name="theme"
    label={m.settings_label_theme()}
    description={m.settings_desc_theme()}
    icon={Palette}
    options={themeOptions}
    placeholder={m.settings_select_theme()}
    bind:value={$formData.theme}
    disabled={processing}
  />
  <SettingsSelectField
    {form}
    name="darkVariant"
    label={m.settings_label_dark_mode()}
    description={m.settings_desc_dark_mode()}
    icon={MoonStar}
    options={darkVariantOptions}
    placeholder={m.settings_select_dark_mode()}
    bind:value={$formData.darkVariant}
    disabled={processing}
  />
</fieldset>
