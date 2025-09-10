<script lang="ts">
	import { browser } from '$app/environment';
	import { darkModeStore } from '$lib/stores/dark-mode';
	import { Moon, Sun } from '@lucide/svelte';
	let darkMode = $state(false);

	if (browser) {
		const storedDark = localStorage.getItem('darkMode');
		darkMode = storedDark === 'true';
		document.documentElement.classList.toggle('dark', storedDark === 'true');
		darkModeStore.set(storedDark === 'true');
	}

	function toggleDarkMode() {
		darkMode = !darkMode;
		document.documentElement.classList.toggle('dark', darkMode);
		if (browser) {
			localStorage.setItem('darkMode', darkMode ? 'true' : 'false');
		}
		darkModeStore.set(darkMode);
	}
</script>

<button
	type="button"
	class="ml-auto flex items-center gap-2 rounded-full bg-gray-200 p-0.5 shadow transition-colors focus:bg-blue-600 dark:bg-gray-700"
	onclick={toggleDarkMode}
	aria-label="Toggle dark mode"
>
	<span class="sr-only">Toggle dark mode</span>
	<div class="relative flex items-center">
		<!-- Switch background -->
		<span
			class="inline-block h-5 w-10 rounded-full bg-gray-400 transition-colors duration-300 dark:bg-gray-700"
		></span>
		<!-- Switch knob -->
		<span
			class="absolute top-0 left-0 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform duration-300 dark:bg-gray-800"
			style="transform: translateX({darkMode ? '20px' : '0px'});"
		>
			{#if darkMode}
				<Moon class="h-4 w-4 text-yellow-500" />
			{:else}
				<Sun class="h-4 w-4 text-red-500" />
			{/if}
		</span>
	</div>
</button>
