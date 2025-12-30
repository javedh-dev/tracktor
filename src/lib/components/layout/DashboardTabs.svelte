<script lang="ts">
	import * as Tabs from '$ui/tabs';
	import OverviewTab from '../feature/overview/OverviewTab.svelte';
	import FuelLogTab from '../feature/fuel/FuelLogTab.svelte';
	import MaintenenceLogTab from '../feature/maintenance/MaintenenceLogTab.svelte';
	import InsuranceTab from '../feature/insurance/InsuranceTab.svelte';
	import PollutionTab from '../feature/pollution/PollutionTab.svelte';
	import Wrench from '@lucide/svelte/icons/wrench';
	import BadgeInfo from '@lucide/svelte/icons/badge-info';
	import Fuel from '@lucide/svelte/icons/fuel';
	import Shield from '@lucide/svelte/icons/shield';
	import SquareKanban from '@lucide/svelte/icons/square-kanban';

	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import {
		nav_overview,
		nav_fuel_logs,
		nav_maintenance,
		nav_insurance,
		nav_pollution
	} from '$lib/paraglide/messages';

	let isLoading = $derived(!vehicleStore.selectedId && vehicleStore.processing);
	let currentTab = $state('overview');

	const tabs: { name: string; id: string; Component: any; Icon?: any }[] = [
		{ name: nav_overview(), id: 'overview', Component: OverviewTab, Icon: SquareKanban },
		{ name: nav_fuel_logs(), id: 'fuel', Component: FuelLogTab, Icon: Fuel },
		{ name: nav_maintenance(), id: 'maintenance', Component: MaintenenceLogTab, Icon: Wrench },
		{ name: nav_insurance(), id: 'insurance', Component: InsuranceTab, Icon: Shield },
		{ name: nav_pollution(), id: 'pollution', Component: PollutionTab, Icon: BadgeInfo }
	];
</script>

{#if isLoading}
	<div class="space-y-2">
		<div
			class="grid h-auto w-full grid-cols-2 flex-col items-start lg:flex lg:flex-row lg:items-center"
		>
			{#each Array(5) as _}
				<Skeleton class="skeleton-tab-trigger h-10 w-full rounded-md lg:w-28" />
			{/each}
		</div>
		<div id="dashboard-tabs-content-skeleton" class="bg-secondary rounded-md p-2 lg:p-8">
			<Skeleton class="skeleton-content-title mb-6 h-8 w-48" />
			<div class="space-y-4">
				<Skeleton class="skeleton-content-block h-32 w-full rounded-lg" />
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Skeleton class="skeleton-content-card h-64 w-full rounded-lg" />
					<Skeleton class="skeleton-content-card h-64 w-full rounded-lg" />
				</div>
			</div>
		</div>
	</div>
{:else}
	<Tabs.Root id="dashboard-tabs" bind:value={currentTab} class="w-full">
		<Tabs.List
			id="dashboard-tabs-list"
			class="grid h-auto w-full grid-cols-2 flex-col items-start lg:flex lg:flex-row lg:items-center"
		>
			{#each tabs as tab}
				<Tabs.Trigger
					id="tab-trigger-{tab.id}"
					value={tab.id}
					class="tab-trigger justify-start lg:justify-center"
				>
					<LabelWithIcon icon={tab.Icon} label={tab.name} />
				</Tabs.Trigger>
			{/each}
		</Tabs.List>
		{#each tabs as { id, Component } (id)}
			<Tabs.Content id="tab-content-{id}" class="tab-content w-full" value={id}>
				<Component />
			</Tabs.Content>
		{/each}
	</Tabs.Root>
{/if}
