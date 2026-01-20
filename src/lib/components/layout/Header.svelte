<script lang="ts">
	import LogOut from '@lucide/svelte/icons/log-out';
	import Tractor from '@lucide/svelte/icons/tractor';
	import Database from '@lucide/svelte/icons/database';
	import UserCog from '@lucide/svelte/icons/user-cog';
	import CircleUser from '@lucide/svelte/icons/circle-user';
	import ToolCase from '@lucide/svelte/icons/tool-case';
	import ThemeToggle from '$appui/ThemeToggle.svelte';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import { authStore } from '$stores/auth.svelte';
	import { sheetStore } from '$stores/sheet.svelte';
	import DataExportImport from '../feature/data-export-import/DataExportImport.svelte';
	import ProfileForm from '../feature/auth/profile-form.svelte';
	import { env } from '$lib/config/env';
	import Notifications from './Notifications.svelte';
	import * as m from '$lib/paraglide/messages';
	import SettingsModal from '../feature/settings/SettingsModal.svelte';
</script>

<header
	id="app-header"
	class="flex h-auto shrink-0 justify-center gap-2 border-b py-3 text-center transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
>
	<div id="header-container" class="flex w-full items-center px-2 lg:px-6">
		<a
			href="/"
			class="focus-visible:ring-ring text-primary hover:text-primary/80 inline-flex items-center gap-2 rounded-md p-1 text-2xl font-semibold transition focus-visible:ring-1 focus-visible:outline-none"
			aria-label="Go to home"
			id="header-logo-link"
		>
			<LabelWithIcon
				icon={Tractor}
				iconClass="h-8 w-8"
				style="text-primary flex flex-row items-center gap-2 text-2xl font-semibold"
				id="header-logo"
				label={m.app_name()}
			/>
		</a>
		<div id="header-actions" class="flex items-center gap-2 ltr:ml-auto rtl:mr-auto">
			<div class="header-toolbar flex items-center gap-2">
				<ThemeToggle />
				{#if authStore.isLoggedIn}
					<Notifications />
					<SettingsModal />
					{#if !authStore.isAuthDisabled}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								id="account-menu-trigger"
								class="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
								aria-label="Account menu"
								title="Account"
							>
								<CircleUser class="text-primary h-[1.2rem] w-[1.2rem]" />
							</DropdownMenu.Trigger>
							<DropdownMenu.Content id="account-menu" align="end">
								<DropdownMenu.Item
									id="profile-menu-item"
									onclick={() => {
										sheetStore.openSheet(
											ProfileForm,
											m.profile_sheet_title(),
											m.profile_sheet_desc()
										);
									}}
									disabled={authStore.isAuthDisabled || env.DEMO_MODE}
								>
									<UserCog class="h-[1.2rem] w-[1.2rem]" />
									{m.profile_menu_item()}
								</DropdownMenu.Item>
								<DropdownMenu.Sub>
									<DropdownMenu.SubTrigger
										id="tools-submenu-trigger"
										class="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus-visible:ring-1"
									>
										<ToolCase class="h-[1.2rem] w-[1.2rem]" />
										<span class="flex-1 text-left">{m.tools_menu()}</span>
									</DropdownMenu.SubTrigger>
									<DropdownMenu.SubContent id="tools-submenu" alignOffset={-4} class="min-w-48">
										<DropdownMenu.Item
											id="export-import-menu-item"
											onclick={() => {
												sheetStore.openSheet(
													DataExportImport,
													m.data_export_import_sheet_title(),
													m.data_export_import_sheet_desc()
												);
											}}
										>
											<Database class="h-[1.2rem] w-[1.2rem]" />
											{m.data_export_import_menu_item()}
										</DropdownMenu.Item>
									</DropdownMenu.SubContent>
								</DropdownMenu.Sub>
								<DropdownMenu.Separator />
								<DropdownMenu.Item id="logout-menu-item" onclick={authStore.logout}>
									<LogOut class="h-[1.2rem] w-[1.2rem]" />
									{m.logout_menu_item()}
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</header>
