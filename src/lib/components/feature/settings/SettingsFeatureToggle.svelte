<script lang="ts">
	import * as Form from '$ui/form/index.js';
	import { Checkbox } from '$ui/checkbox';

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

<Form.Field {form} {name} class="flex items-start space-x-3">
	<Form.Control>
		{#snippet children({ props })}
			<Checkbox {...props} bind:checked id={name} {disabled} />
			<div class="flex flex-col gap-1">
				<Form.Label for={name} class="font-medium">{label}</Form.Label>
				<Form.Description class="text-xs">
					{description}
				</Form.Description>
			</div>
		{/snippet}
	</Form.Control>
</Form.Field>
