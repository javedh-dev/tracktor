<script lang="ts">
  import * as Sidebar from '$ui/sidebar/index.js';
  import * as Avatar from '$ui/avatar/index.js';
  import * as DropdownMenu from '$ui/dropdown-menu/index.js';
  import VehicleSwitcher from '$layout/VehicleSwitcher.svelte';

  import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
  import Car from '@lucide/svelte/icons/car';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Bell from '@lucide/svelte/icons/bell';
  import BadgeInfo from '@lucide/svelte/icons/badge-info';
  import Shield from '@lucide/svelte/icons/shield';
  import Banknote from '@lucide/svelte/icons/banknote';
  import BarChart3 from '@lucide/svelte/icons/bar-chart-3';
  import Settings from '@lucide/svelte/icons/settings';
  import LogOut from '@lucide/svelte/icons/log-out';
  import UserCog from '@lucide/svelte/icons/user-cog';
  import ToolCase from '@lucide/svelte/icons/tool-case';
  import Database from '@lucide/svelte/icons/database';
  import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';

  import { configStore } from '$stores/config.svelte';
  import { authStore } from '$stores/auth.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages';
  import { env } from '$lib/config/env';
  import ProfileForm from '$feature/auth/profile-form.svelte';
  import DataExportImport from '$feature/data-export-import/DataExportImport.svelte';

  type NavItem = {
    label: string;
    href: string;
    icon: typeof LayoutDashboard;
    featureKey?: keyof typeof configStore.configs;
    group: string;
  };

  const NAV_ITEMS: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      group: 'Overview'
    },
    {
      label: 'Vehicles',
      href: '/vehicles',
      icon: Car,
      group: 'Overview'
    },
    {
      label: m.nav_fuel_logs(),
      href: '/fuel',
      icon: Fuel,
      featureKey: 'featureFuelLog',
      group: 'Logs'
    },
    {
      label: m.nav_maintenance(),
      href: '/maintenance',
      icon: Wrench,
      featureKey: 'featureMaintenance',
      group: 'Logs'
    },
    {
      label: m.nav_reminders(),
      href: '/reminders',
      icon: Bell,
      featureKey: 'featureReminders',
      group: 'Logs'
    },
    {
      label: m.nav_pollution(),
      href: '/pollution',
      icon: BadgeInfo,
      featureKey: 'featurePucc',
      group: 'Logs'
    },
    {
      label: m.nav_insurance(),
      href: '/insurance',
      icon: Shield,
      featureKey: 'featureInsurance',
      group: 'Logs'
    },
    {
      label: 'Expenses',
      href: '/expenses',
      icon: Banknote,
      group: 'Logs'
    },
    {
      label: 'Reports',
      href: '/reports',
      icon: BarChart3,
      group: 'Insights'
    }
  ];

  const visibleNavItems = $derived(
    NAV_ITEMS.filter((item) => {
      if (!item.featureKey) return true;
      return configStore.configs[item.featureKey] === true;
    })
  );

  const navGroups = $derived.by(() => {
    const groups: { label: string; items: NavItem[] }[] = [];
    for (const item of visibleNavItems) {
      let group = groups.find((g) => g.label === item.group);
      if (!group) {
        group = { label: item.group, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    }
    return groups;
  });

  const userInitial = $derived(authStore.user?.username?.charAt(0)?.toUpperCase() || 'U');

  function handleNavClick(href: string) {
    goto(href, { noScroll: true, keepFocus: true });
  }

  // The underlying Sidebar.MenuButton always renders `data-active="false"` instead of
  // omitting the attribute, which makes Tailwind's presence-based `data-active:` variant
  // match on every item. Passing `data-active` explicitly (as an extra, undeclared prop)
  // overrides that, since it lands in the component's `...restProps` spread last.
  function navActiveProps(href: string) {
    const active = page.url.pathname.startsWith(href);
    return { isActive: active, 'data-active': active || undefined };
  }
</script>

<Sidebar.Sidebar variant="sidebar" collapsible="icon">
  <Sidebar.Header>
    <VehicleSwitcher />
  </Sidebar.Header>

  <Sidebar.Content>
    {#each navGroups as group (group.label)}
      <Sidebar.Group>
        <Sidebar.GroupLabel>{group.label}</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {#each group.items as item (item.href)}
              <Sidebar.MenuItem>
                <Sidebar.MenuButton
                  {...navActiveProps(item.href)}
                  onclick={() => handleNavClick(item.href)}
                  tooltipContent={item.label}
                >
                  <item.icon class="h-4 w-4" />
                  <span>{item.label}</span>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            {/each}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    {/each}

    <Sidebar.Separator />

    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              {...navActiveProps('/settings')}
              onclick={() => handleNavClick('/settings')}
              tooltipContent={m.settings_title()}
            >
              <Settings class="h-4 w-4" />
              <span>{m.settings_title()}</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>

  <Sidebar.Footer>
    {#if authStore.isLoggedIn}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger class="w-full" data-slot="sidebar-user-trigger">
          <Sidebar.MenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            data-active={undefined}
            tooltipContent={authStore.user?.username || m.profile_menu_item()}
          >
            <Avatar.Root size="sm" class="size-6 rounded-lg">
              <Avatar.AvatarFallback class="rounded-lg">
                {userInitial}
              </Avatar.AvatarFallback>
            </Avatar.Root>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">
                {authStore.user?.username || m.profile_menu_item()}
              </span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </Sidebar.MenuButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content side="right" align="end" sideOffset={4} class="w-56 rounded-lg">
          <DropdownMenu.Label class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar.Root size="sm" class="size-8 rounded-lg">
                <Avatar.AvatarFallback class="rounded-lg">
                  {userInitial}
                </Avatar.AvatarFallback>
              </Avatar.Root>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">
                  {authStore.user?.username || m.profile_menu_item()}
                </span>
              </div>
            </div>
          </DropdownMenu.Label>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            onclick={() => {
              sheetStore.openSheet(ProfileForm, m.profile_sheet_title(), m.profile_sheet_desc());
            }}
            disabled={authStore.isAuthDisabled || env.DEMO_MODE}
          >
            <UserCog class="h-4 w-4" />
            {m.profile_menu_item()}
          </DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>
              <ToolCase class="h-4 w-4" />
              <span>{m.tools_menu()}</span>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent sideOffset={-4} class="min-w-48">
              <DropdownMenu.Item
                onclick={() => {
                  sheetStore.openSheet(
                    DataExportImport,
                    m.data_export_import_sheet_title(),
                    m.data_export_import_sheet_desc()
                  );
                }}
              >
                <Database class="h-4 w-4" />
                {m.data_export_import_menu_item()}
              </DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onclick={authStore.logout}>
            <LogOut class="h-4 w-4" />
            {m.logout_menu_item()}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {/if}
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Sidebar>
