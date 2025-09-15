<script lang="ts">
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import { REGEXP_ONLY_DIGITS } from 'bits-ui';

	let { oncomplete } = $props();

	let pin = $state('');

	const handleChange = () => {
		if (pin.length == 6) {
			oncomplete(pin);
		}
	};
</script>

<InputOTP.Root
	maxlength={6}
	bind:value={pin}
	pattern={REGEXP_ONLY_DIGITS}
	pushPasswordManagerStrategy={'increase-width'}
	onValueChange={handleChange}
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
