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

	type Section = {
		label: string;
		href: string;
		icon: typeof SquareKanban;
	};

	const sections: Section[] = [
		{ label: 'Overview', href: '/dashboard/overview', icon: SquareKanban },
		{ label: 'Fuel Logs', href: '/dashboard/fuel', icon: Fuel },
		{ label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
		{ label: 'Insurance', href: '/dashboard/insurance', icon: Shield },
		{ label: 'Pollution Certificate', href: '/dashboard/pollution', icon: BadgeInfo },
		{ label: 'Reminders', href: '/dashboard/reminders', icon: Bell }
	];

	let currentPath = $derived($page.url.pathname);

	const linkClasses = (href: string) => {
		const isActive = currentPath.startsWith(href);
		return `focus-visible:ring-primary border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
			isActive
				? 'border-primary bg-primary/10 text-primary'
				: 'border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground'
		} rounded-md px-3 py-1 text-left text-sm font-medium flex items-center justify-start`;
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

<nav class="grid h-auto w-full grid-cols-2 gap-2 lg:flex lg:flex-row lg:items-center">
	{#each sections as section}
		<a
			use:spaLink
			href={section.href}
			aria-current={currentPath.startsWith(section.href) ? 'page' : undefined}
			class={linkClasses(section.href)}
		>
			<LabelWithIcon icon={section.icon} label={section.label} iconClass="h-4 w-4" />
		</a>
	{/each}
</nav>
