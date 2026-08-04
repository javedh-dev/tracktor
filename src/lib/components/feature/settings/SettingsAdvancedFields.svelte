<script lang="ts">
  import * as Form from '$ui/form/index.js';
  import FormLabel from '$appui/FormLabel.svelte';
  import { Textarea } from '$lib/components/ui/textarea';

  interface Props {
    form: any;
    formData: any;
    processing: boolean;
    messages: typeof import('$lib/paraglide/messages');
  }

  let { form, formData, processing, messages: m }: Props = $props();
</script>

<fieldset disabled={processing}>
  <Form.Field {form} name="customCss" class="w-full">
    <Form.Control>
      {#snippet children({ props })}
        <FormLabel description={m.settings_desc_custom_css()}
          >{m.settings_label_custom_css()}</FormLabel
        >
        <Textarea
          {...props}
          placeholder={m.settings_custom_css_placeholder()}
          class="mono h-40 resize-none"
          bind:value={$formData.customCss}
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
</fieldset>
