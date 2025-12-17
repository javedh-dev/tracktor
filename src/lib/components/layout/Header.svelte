<script lang="ts">
	import LogOut from '@lucide/svelte/icons/log-out';
	import Tractor from '@lucide/svelte/icons/tractor';
	import Settings from '@lucide/svelte/icons/settings';
	import Database from '@lucide/svelte/icons/database';
	import UserCog from '@lucide/svelte/icons/user-cog';
	import CircleUser from '@lucide/svelte/icons/circle-user';
	import ToolCase from '@lucide/svelte/icons/tool-case';
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
	import Notifications from './Notifications.svelte';
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
					<Notifications />
					<Button
						variant="ghost"
						onclick={() => {
							sheetStore.openSheet(SettingsForm, 'Settings');
						}}
					>
						<Settings class="h-[1.2rem] w-[1.2rem]" />
					</Button>
					{#if !env.DISABLE_AUTH}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								class="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
								aria-label="Account menu"
								title="Account"
							>
								<CircleUser class="h-[1.2rem] w-[1.2rem]" />
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end">
								<DropdownMenu.Item
									onclick={() => {
										sheetStore.openSheet(
											ProfileForm,
											'Profile',
											'Update your username and password'
										);
									}}
									disabled={env.DISABLE_AUTH || env.DEMO_MODE}
								>
									<UserCog class="h-[1.2rem] w-[1.2rem]" />
									Profile
								</DropdownMenu.Item>
								<DropdownMenu.Sub>
									<DropdownMenu.SubTrigger
										class="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus-visible:ring-1"
									>
										<ToolCase class="h-[1.2rem] w-[1.2rem]" />
										<span class="flex-1 text-left">Tools</span>
									</DropdownMenu.SubTrigger>
									<DropdownMenu.SubContent alignOffset={-4} class="min-w-48">
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
									</DropdownMenu.SubContent>
								</DropdownMenu.Sub>
								<DropdownMenu.Separator />
								<DropdownMenu.Item onclick={authStore.logout}>
									<LogOut class="h-[1.2rem] w-[1.2rem]" />
									Logout
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</header>
