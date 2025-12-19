<script lang="ts">
	import { page } from '$app/stores';
	import * as Card from '$lib/components/ui/card/index.js';
	import Tractor from '@lucide/svelte/icons/tractor';

	let { children } = $props();

	// Use URL pathname for reliable tracking
	let currentPath = $derived($page.url.pathname);
</script>

<div
	id="auth-container"
	class="bg-background flex w-full grow items-center justify-center gap-6 overflow-hidden p-4 md:p-10"
>
	<div id="auth-card-wrapper" class="w-full max-w-2xl">
		<Card.Root id="auth-card-root" class="overflow-hidden p-0">
			<Card.Content id="auth-card-content" class="grid p-0 md:grid-cols-2">
				<div
					id="auth-hero-section"
					class="bg-muted relative hidden items-center justify-center transition-all duration-300 md:flex"
				>
					<img
						id="auth-hero-bg"
						src="hero-bg.svg"
						alt="placeholder"
						class="absolute inset-0 h-full w-full object-cover transition-all duration-300"
					/>
					<Tractor
						id="auth-hero-icon"
						class="text-muted-foreground relative z-10 h-5 w-5 transition-all duration-300 dark:text-zinc-800"
					/>
				</div>
				<div id="auth-form-section" class="flex items-center p-6 md:p-8">
					{#key currentPath}
						<div id="auth-form-wrapper" class="w-full">
							{@render children()}
						</div>
					{/key}
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
