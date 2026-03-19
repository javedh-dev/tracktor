<script lang="ts">
  import * as Form from '$ui/form/index.js';
  import FormLabel from '$appui/FormLabel.svelte';
  import Input from '$appui/input.svelte';
  import SearchableSelect from '$appui/SearchableSelect.svelte';
  import { Textarea } from '$lib/components/ui/textarea';
  import type { SettingsOption } from '$lib/types/settings';
  import Calendar from '@lucide/svelte/icons/calendar';
  import Currency from '@lucide/svelte/icons/currency';
  import Earth from '@lucide/svelte/icons/earth';
  import Languages from '@lucide/svelte/icons/languages';
  import Palette from '@lucide/svelte/icons/palette';
  import SettingsSelectField from './SettingsSelectField.svelte';

  interface Props {
    form: any;
    formData: any;
    processing: boolean;
    themeOptions: Array<SettingsOption>;
    localeOptions: Array<SettingsOption>;
    currencyOptions: Array<SettingsOption>;
    getTimezoneOptions: () => Array<SettingsOption>;
    isValidFormat: (value: string) => { valid: boolean; ex?: string };
    messages: typeof import('$lib/paraglide/messages');
  }

  let {
    form,
    formData,
    processing,
    themeOptions,
    localeOptions,
    currencyOptions,
    getTimezoneOptions,
    isValidFormat,
    messages: m
  }: Props = $props();
</script>

<fieldset class="grid gap-4 lg:grid-cols-3" disabled={processing}>
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
    name="locale"
    label={m.settings_label_locale()}
    description={m.settings_desc_locale()}
    icon={Languages}
    options={localeOptions}
    placeholder={m.settings_select_language()}
    bind:value={$formData.locale}
    disabled={processing}
  />
  <Form.Field {form} name="timezone" class="w-full">
    <Form.Control>
      {#snippet children({ props })}
        <FormLabel description={m.settings_desc_timezone()}>{m.settings_label_timezone()}</FormLabel
        >
        <SearchableSelect
          bind:value={$formData.timezone}
          options={getTimezoneOptions()}
          icon={Earth}
          {...props}
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="currency" class="w-full">
    <Form.Control>
      {#snippet children({ props })}
        <FormLabel description={m.settings_desc_currency()}>{m.settings_label_currency()}</FormLabel
        >
        <SearchableSelect
          bind:value={$formData.currency}
          icon={Currency}
          options={currencyOptions}
          {...props}
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="dateFormat" class="w-full">
    <Form.Control>
      {#snippet children({ props })}
        <FormLabel description={m.settings_desc_date_format()}
          >{m.settings_label_date_format()}</FormLabel
        >
        <Input
          {...props}
          bind:value={$formData.dateFormat}
          icon={Calendar}
          type="text"
          class="mono"
        />
        <Form.Description>
          {m.common_example_prefix()}
          {isValidFormat(formData.dateFormat).ex || m.common_invalid_format()}
        </Form.Description>
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="customCss" class="w-full lg:col-span-3">
    <Form.Control>
      {#snippet children({ props })}
        <FormLabel description={m.settings_desc_custom_css()}
          >{m.settings_label_custom_css()}</FormLabel
        >
        <Textarea
          {...props}
          placeholder="Add your custom CSS here..."
          class="mono h-40 resize-none"
          bind:value={$formData.customCss}
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
</fieldset>
