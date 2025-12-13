<script lang="ts">
	import { page } from '$app/stores';
	import * as Card from '$lib/components/ui/card/index.js';
	import Tractor from '@lucide/svelte/icons/tractor';

	let { children } = $props();

	// Use URL pathname for reliable tracking
	let currentPath = $derived($page.url.pathname);
</script>

<div
	class="bg-background flex w-full grow items-center justify-center gap-6 overflow-hidden p-4 md:p-10"
>
	<div class="w-full max-w-2xl">
		<Card.Root class="overflow-hidden p-0">
			<Card.Content class="grid p-0 md:grid-cols-2">
				<div class="flex items-center p-6 md:p-8">
					{#key currentPath}
						<div class="w-full">
							{@render children()}
						</div>
					{/key}
				</div>
				<div
					class="bg-muted relative hidden items-center justify-center transition-all duration-300 md:flex"
				>
					<img
						src="hero-bg.svg"
						alt="placeholder"
						class="absolute inset-0 h-full w-full object-cover transition-all duration-300 dark:brightness-[0.4]"
					/>
					<Tractor
						class="text-muted-foreground relative z-10 h-5 w-5 transition-all duration-300 dark:text-zinc-800"
					/>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
