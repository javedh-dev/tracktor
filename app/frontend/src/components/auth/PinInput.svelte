<script lang="ts">
	let pin = Array(6).fill('');
	let inputs: HTMLInputElement[] = $state([]);

	const { complete } = $props();

	function handleInput(event: Event, index: number) {
		const input = event.target as HTMLInputElement;
		const value = input.value;

		if (value.length > 1) {
			input.value = value.slice(-1);
		}

		pin[index] = input.value;

		if (input.value && index < 5) {
			inputs[index + 1].focus();
		}

		if (pin.every((digit) => digit !== '')) {
			complete(pin.join(''));
		}
	}

	function handleKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Backspace' && !pin[index] && index > 0) {
			inputs[index - 1].focus();
		}
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
			oninput={(e) => handleInput(e, i)}
			onkeydown={(e) => handleKeydown(e, i)}
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
