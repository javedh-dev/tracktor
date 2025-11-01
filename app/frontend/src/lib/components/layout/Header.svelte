<script lang="ts">
	import LogOut from '@lucide/svelte/icons/log-out';
	import Tractor from '@lucide/svelte/icons/tractor';
	import Settings from '@lucide/svelte/icons/settings';
	import ThemeToggle from '$lib/components/app/ThemeToggle.svelte';
	import { Button } from '$lib/components/ui/button';
	import LabelWithIcon from '../app/LabelWithIcon.svelte';
	import { authStore } from '$stores/auth.svelte';
	import { sheetStore } from '$lib/stores/sheet.svelte';
	import SettingsForm from '../features/settings/SettingsForm.svelte';
	import { env } from '$env/dynamic/public';
</script>

<header
	class="flex h-auto shrink-0 justify-center gap-2 border-b py-3 text-center transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
>
	<div class="flex w-full items-center px-2 lg:px-6">
		<LabelWithIcon
			icon={Tractor}
			iconClass="h-8 w-8"
			style="text-primary flex flex-row items-center gap-2 text-2xl font-semibold"
			label="Tracktor"
		/>
		<div class="ml-auto flex items-center gap-2">
			<div class="flex items-center gap-2">
				<ThemeToggle />
				{#if authStore.isLoggedIn}
					<Button
						variant="ghost"
						onclick={() => {
							sheetStore.openSheet(SettingsForm, 'Settings');
						}}
					>
						<Settings class="h-[1.2rem] w-[1.2rem]" />
					</Button>
					{#if env.TRACKTOR_DISABLE_AUTH !== 'true'}
						<Button variant="ghost" onclick={authStore.logout}>
							<LogOut class="h-[1.2rem] w-[1.2rem]" />
						</Button>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</header>
