<script lang="ts">
  import * as Form from '$ui/form/index.js';
  import FormLabel from '$appui/FormLabel.svelte';
  import SearchableSelect from '$appui/SearchableSelect.svelte';
  import Car from '@lucide/svelte/icons/car';
  import type { SuperForm } from 'sveltekit-superforms';
  import type { Vehicle } from '$lib/domain/vehicle';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    form: SuperForm<any>;
    formData: any;
    vehicles: Vehicle[];
  }

  let { form, formData, vehicles }: Props = $props();

  const options = $derived(
    vehicles
      .filter((vehicle) => vehicle.id)
      .map((vehicle) => ({
        value: vehicle.id as string,
        label: vehicle.licensePlate
          ? `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`
          : `${vehicle.make} ${vehicle.model}`
      }))
  );
</script>

<Form.Field {form} name="vehicleId" class="w-full">
  <Form.Control>
    {#snippet children({ props })}
      <FormLabel description={m.form_vehicle_desc()} required>{m.form_vehicle_label()}</FormLabel>
      <SearchableSelect
        bind:value={$formData.vehicleId}
        {options}
        icon={Car}
        label={m.form_vehicle_label()}
        {...props}
      />
    {/snippet}
  </Form.Control>
  <Form.FieldErrors />
</Form.Field>
