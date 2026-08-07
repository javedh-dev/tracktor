<script lang="ts">
  import SettingsFeatureToggle from './SettingsFeatureToggle.svelte';

  interface Props {
    form: any;
    formData: any;
    processing: boolean;
    messages: typeof import('$lib/paraglide/messages');
  }

  let { form, formData, processing, messages: m }: Props = $props();
</script>

<fieldset class="grid gap-4 lg:grid-cols-3" disabled={processing}>
  <div class="space-y-4 lg:col-span-3">
    <div class="text-muted-foreground text-sm">{m.settings_features_intro()}</div>
    <div class="grid gap-4 lg:grid-cols-3">
      <SettingsFeatureToggle
        {form}
        name="featureFuelLog"
        label={m.feature_label_fuel()}
        description={m.feature_desc_fuel()}
        bind:checked={$formData.featureFuelLog}
        disabled={processing}
      />
      <SettingsFeatureToggle
        {form}
        name="featureMaintenance"
        label={m.feature_label_maintenance()}
        description={m.feature_desc_maintenance()}
        bind:checked={$formData.featureMaintenance}
        disabled={processing}
      />
      <SettingsFeatureToggle
        {form}
        name="featureCompliance"
        label={m.feature_label_compliance()}
        description={m.feature_desc_compliance()}
        bind:checked={$formData.featureCompliance}
        disabled={processing}
      />
      <SettingsFeatureToggle
        {form}
        name="featureReminders"
        label={m.feature_label_reminders()}
        description={m.feature_desc_reminders()}
        bind:checked={$formData.featureReminders}
        disabled={processing}
      />
      <SettingsFeatureToggle
        {form}
        name="featureOverview"
        label={m.feature_label_overview()}
        description={m.feature_desc_overview()}
        bind:checked={$formData.featureOverview}
        disabled={processing}
      />
    </div>
  </div>
</fieldset>
