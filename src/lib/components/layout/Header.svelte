<script lang="ts">
	import LogOut from '@lucide/svelte/icons/log-out';
	import Tractor from '@lucide/svelte/icons/tractor';
	import Settings from '@lucide/svelte/icons/settings';
	import Database from '@lucide/svelte/icons/database';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import UserCog from '@lucide/svelte/icons/user-cog';
	import ThemeToggle from '$appui/ThemeToggle.svelte';
	import { Button } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import { authStore } from '$stores/auth.svelte';
	import { sheetStore } from '$stores/sheet.svelte';
	import SettingsForm from '../feature/settings/SettingsForm.svelte';
	import DataExportImport from '../feature/data-export-import/DataExportImport.svelte';
	import ProfileForm from '../feature/auth/profile-form.svelte';
	import { env } from '$lib/config/env';
	import ToolCase from '@lucide/svelte/icons/tool-case';
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
					<DropdownMenu.Root>
						<DropdownMenu.Trigger
							class="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center gap-1 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
						>
							<ToolCase class="h-[1.2rem] w-[1.2rem]" />
							<ChevronDown class="h-3 w-3" />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Item
								onclick={() => {
									sheetStore.openSheet(ProfileForm, 'Profile', 'Update your username and password');
								}}
								disabled={env.DISABLE_AUTH || env.DEMO_MODE}
							>
								<UserCog class="h-[1.2rem] w-[1.2rem]" />
								Profile
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onclick={() => {
									sheetStore.openSheet(
										DataExportImport,
										'Data Export/Import',
										'Export or import your database with optional encryption'
									);
								}}
							>
								<Database class="h-[1.2rem] w-[1.2rem]" />
								Export/Import Data
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
					<Button
						variant="ghost"
						onclick={() => {
							sheetStore.openSheet(SettingsForm, 'Settings');
						}}
					>
						<Settings class="h-[1.2rem] w-[1.2rem]" />
					</Button>
					{#if !env.DISABLE_AUTH}
						<Button variant="ghost" onclick={authStore.logout}>
							<LogOut class="h-[1.2rem] w-[1.2rem]" />
						</Button>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</header>
