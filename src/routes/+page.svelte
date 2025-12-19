<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$stores/auth.svelte';
	import { onMount } from 'svelte';
	import { env } from '$lib/config/env';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import Tractor from '@lucide/svelte/icons/tractor';

	let authCheckComplete = $state(false);

	onMount(async () => {
		if (env.DISABLE_AUTH) {
			goto('/dashboard', { replaceState: true });
			return;
		}

		await authStore.checkAuthStatus();
		authCheckComplete = true;

		if (authStore.isLoggedIn) {
			goto('/dashboard', { replaceState: true });
		} else {
			goto('/login', { replaceState: true });
		}
	});
</script>

{#if !authCheckComplete}
	<div
		id="root-auth-loading-container"
		class="bg-background flex w-full grow items-center justify-center gap-6 overflow-hidden p-4 md:p-10"
	>
		<div id="root-loading-card-wrapper" class="w-full max-w-2xl">
			<Card.Root id="root-loading-card" class="overflow-hidden p-0">
				<Card.Content id="root-loading-card-content" class="grid p-0 md:grid-cols-2">
					<div
						id="root-loading-hero-section"
						class="bg-muted relative hidden items-center justify-center transition-all duration-300 md:flex"
					>
						<img
							id="root-loading-hero-bg"
							src="hero-bg.svg"
							alt="placeholder"
							class="absolute inset-0 h-full w-full object-cover transition-all duration-300"
						/>
						<Tractor
							id="root-loading-hero-icon"
							class="text-muted-foreground relative z-10 h-5 w-5 transition-all duration-300 dark:text-zinc-800"
						/>
					</div>
					<div id="root-loading-form-section" class="flex items-center p-6 md:p-8">
						<div id="root-loading-form-content" class="w-full space-y-6">
							<div id="root-loading-field-1" class="space-y-2">
								<Skeleton class="h-4 w-20" />
								<Skeleton class="h-10 w-full" />
							</div>
							<div id="root-loading-field-2" class="space-y-2">
								<Skeleton class="h-4 w-16" />
								<Skeleton class="h-10 w-full" />
							</div>
							<Skeleton id="root-loading-button" class="h-10 w-full" />
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
{/if}
