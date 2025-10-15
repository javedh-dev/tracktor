<script lang="ts">
	import { cn } from '$lib/utils';
	import ShieldEllipsis from '@lucide/svelte/icons/shield-ellipsis';
	import * as Card from '$lib/components/ui/card';
	import LabelWithIcon from '$lib/components/app/LabelWithIcon.svelte';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import { REGEXP_ONLY_DIGITS } from 'bits-ui';
	import { Jumper } from 'svelte-loading-spinners';
	import { authStore } from '$lib/stores/auth.store';

	let { class: className = '', oncomplete, ...restProps } = $props();

	let pin = $state('');
	let disabled = $state(!authStore.isPinConfigured());
	let processing = $state(false);

	const handleChange = () => {
		if (pin.length == 6 && !processing) {
			processing = true;
			oncomplete(pin).finally(() => {
				processing = false;
			});
		}
	};
</script>

<Card.Root class={cn('flex flex-col items-center gap-6 py-12', className)} {...restProps}>
	<LabelWithIcon
		icon={ShieldEllipsis}
		iconClass="lg:h-6 lg:w-6"
		label="Enter your 6-digit PIN to access the app"
		style="gap-4"
	/>

	<InputOTP.Root
		maxlength={6}
		bind:value={pin}
		pattern={REGEXP_ONLY_DIGITS}
		pushPasswordManagerStrategy={'increase-width'}
		onValueChange={handleChange}
		disabled={disabled || processing}
	>
		{#snippet children({ cells })}
			{#each cells as cell (cell)}
				<InputOTP.Group>
					<InputOTP.Slot
						cell={{
							char: cell.char && '◉',
							hasFakeCaret: cell.hasFakeCaret,
							isActive: cell.isActive
						}}
						class="text-base lg:text-lg"
					/>
				</InputOTP.Group>
			{/each}
		{/snippet}
	</InputOTP.Root>
	{#if processing}
		<Jumper size="32" color="var(--primary)" duration="2s" />
	{/if}
</Card.Root>
