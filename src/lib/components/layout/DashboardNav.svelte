<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import BadgeInfo from '@lucide/svelte/icons/badge-info';
	import Fuel from '@lucide/svelte/icons/fuel';
	import Shield from '@lucide/svelte/icons/shield';
	import SquareKanban from '@lucide/svelte/icons/square-kanban';
	import Wrench from '@lucide/svelte/icons/wrench';
	import Bell from '@lucide/svelte/icons/bell';
	import { configStore } from '$stores/config.svelte';
	import * as m from '$lib/paraglide/messages';

	type Section = {
		label: string;
		href: string;
		icon: typeof SquareKanban;
		featureKey?: keyof typeof configStore.configs;
	};

	const sections: Section[] = [
		{
			label: m.nav_overview(),
			href: '/dashboard/overview',
			icon: SquareKanban,
			featureKey: 'featureOverview'
		},
		{ label: m.nav_fuel_logs(), href: '/dashboard/fuel', icon: Fuel, featureKey: 'featureFuelLog' },
		{
			label: m.nav_maintenance(),
			href: '/dashboard/maintenance',
			icon: Wrench,
			featureKey: 'featureMaintenance'
		},
		{
			label: m.nav_insurance(),
			href: '/dashboard/insurance',
			icon: Shield,
			featureKey: 'featureInsurance'
		},
		{
			label: m.nav_pollution(),
			href: '/dashboard/pollution',
			icon: BadgeInfo,
			featureKey: 'featurePucc'
		},
		{
			label: m.nav_reminders(),
			href: '/dashboard/reminders',
			icon: Bell,
			featureKey: 'featureReminders'
		}
	];

	let visibleSections = $derived(
		sections.filter((section) => {
			if (!section.featureKey) return true;
			return configStore.configs[section.featureKey] === true;
		})
	);

	let currentPath = $derived($page.url.pathname);

	const linkClasses = (href: string) => {
		const isActive = currentPath.startsWith(href);
		return `focus-visible:ring-primary border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
			isActive
				? 'border-primary bg-primary/10 text-primary'
				: 'border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground'
		} rounded-md px-3 py-2 lg:py-1 text-left text-sm font-medium flex items-center justify-start`;
	};

	const spaLink = (node: HTMLAnchorElement) => {
		const handleClick = (event: MouseEvent) => {
			if (
				event.defaultPrevented ||
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey
			) {
				return;
			}

			const target = node.getAttribute('target');
			if (target && target !== '_self') return;

			const rel = node.getAttribute('rel');
			if (rel?.split(/\s+/).includes('external')) return;

			event.preventDefault();
			const href = node.getAttribute('href');
			if (!href) return;
			void goto(href, { noScroll: true, keepFocus: true });
		};

		node.addEventListener('click', handleClick);
		return {
			destroy() {
				node.removeEventListener('click', handleClick);
			}
		};
	};
</script>

<nav
	id="dashboard-nav"
	class="xs:p-4 flex h-auto w-full flex-row gap-2 lg:items-center lg:bg-transparent lg:p-0"
>
	{#each visibleSections as section}
		<a
			use:spaLink
			id="nav-{section.label.toLowerCase().replace(/\s+/g, '-')}"
			href={section.href}
			aria-current={currentPath.startsWith(section.href) ? 'page' : undefined}
			class="{linkClasses(section.href)} nav-link"
		>
			<LabelWithIcon
				icon={section.icon}
				label={section.label}
				iconClass="h-4 w-4"
				labelClass="hidden lg:inline-block"
			/>
		</a>
	{/each}
</nav>
