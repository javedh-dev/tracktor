<script lang="ts">
	export let complete: (pin: string) => void;
	let pin = Array(6).fill('');
	let inputs: HTMLInputElement[] = $state([]);

	function onInput(e: Event, i: number) {
		const input = e.target as HTMLInputElement;
		input.value = input.value.slice(-1); // Always keep only last digit
		pin[i] = input.value;
		if (input.value && i < pin.length - 1) inputs[i + 1].focus();
		if (pin.every((d) => d !== '')) complete(pin.join(''));
	}

	function onKeydown(e: KeyboardEvent, i: number) {
		if (e.key === 'Backspace' && !pin[i] && i > 0) inputs[i - 1].focus();
	}
</script>

<div class="flex justify-center space-x-2">
	{#each pin as _, i}
		<input
			bind:this={inputs[i]}
			type="tel"
			inputmode="numeric"
			pattern="[0-9]*"
			maxlength="1"
			on:input={(e) => onInput(e, i)}
			on:keydown={(e) => onKeydown(e, i)}
			aria-label={`PIN digit ${i + 1}`}
		/>
	{/each}
</div>

<style>
	@reference "../../styles/app.css";
	input {
		@apply h-10 w-10 rounded-md border-2 border-gray-300 bg-white text-center text-xl text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:h-12 sm:w-12 sm:text-2xl dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400;
		-webkit-text-security: disc;
	}
</style>
