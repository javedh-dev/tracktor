<script lang="ts">
  import * as Form from '$ui/form/index.js';
  import { Switch } from '$ui/switch';

  interface Props {
    form: any;
    name: string;
    label: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
  }

  let { form, name, label, description, checked = $bindable(), disabled = false }: Props = $props();
</script>

<Form.Field {form} {name} class="w-full">
  <Form.Control>
    {#snippet children({ props })}
      <div class="border-border flex items-center justify-between gap-4 rounded-lg border p-4">
        <div class="flex flex-col gap-1">
          <Form.Label for={name} class="font-medium">{label}</Form.Label>
          <Form.Description class="text-xs">
            {description}
          </Form.Description>
        </div>
        <Switch {...props} bind:checked id={name} {disabled} />
      </div>
    {/snippet}
  </Form.Control>
</Form.Field>
