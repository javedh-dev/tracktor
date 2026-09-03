<script lang="ts">
  import * as Form from '$ui/form/index.js';
  import FormLabel from '$appui/FormLabel.svelte';
  import Input from '$appui/input.svelte';
  import SearchableSelect from '$appui/SearchableSelect.svelte';
  import SettingsSelectField from './SettingsSelectField.svelte';
  import type { SettingsOption } from '$lib/types/settings';
  import Calendar from '@lucide/svelte/icons/calendar';
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import Currency from '@lucide/svelte/icons/currency';
  import Earth from '@lucide/svelte/icons/earth';
  import Languages from '@lucide/svelte/icons/languages';

  interface Props {
    form: any;
    formData: any;
    processing: boolean;
    localeOptions: Array<SettingsOption>;
    currencyOptions: Array<SettingsOption>;
    weekStartDayOptions: Array<SettingsOption>;
    getTimezoneOptions: () => Array<SettingsOption>;
    isValidFormat: (value: string) => { valid: boolean; ex?: string };
    messages: typeof import('$lib/paraglide/messages');
  }

  let {
    form,
    formData,
    processing,
    localeOptions,
    currencyOptions,
    weekStartDayOptions,
    getTimezoneOptions,
    isValidFormat,
    messages: m
  }: Props = $props();
</script>

<fieldset class="grid gap-4 sm:grid-cols-2" disabled={processing}>
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
          label={m.settings_label_timezone()}
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
          label={m.settings_label_currency()}
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
          {isValidFormat($formData.dateFormat).ex || m.common_invalid_format()}
        </Form.Description>
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <SettingsSelectField
    {form}
    name="weekStartDay"
    label={m.settings_label_week_start_day()}
    description={m.settings_desc_week_start_day()}
    icon={CalendarDays}
    options={weekStartDayOptions}
    placeholder={m.settings_select_week_start_day()}
    bind:value={$formData.weekStartDay}
    disabled={processing}
  />
</fieldset>
