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

	let isLoading = $derived(!vehicleStore.selectedId && vehicleStore.processing);

	const tabs: {
		name: string;
		id: string;
		Component: any;
		Icon?: any;
	}[] = [
		{
			name: 'Overview',
			id: 'overview',
			Component: OverviewTab,
			Icon: SquareKanban
		},
		{
			name: 'Fuel Logs',
			id: 'fuel',
			Component: FuelLogTab,
			Icon: Fuel
		},
		{
			name: 'Maintenance',
			id: 'maintenance',
			Component: MaintenenceLogTab,
			Icon: Wrench
		},
		{
			name: 'Insurance',
			id: 'insurance',
			Component: InsuranceTab,
			Icon: Shield
		},
		{
			name: 'Pollution Certificate',
			id: 'pollution',
			Component: PollutionTab,
			Icon: BadgeInfo
		}
	];

	let currentTab = $state(tabs[0].id);
</script>

{#if isLoading}
	<div class="w-full">
		<div
			class="mb-4 grid h-auto w-full grid-cols-2 gap-2 lg:flex lg:flex-row lg:items-center lg:gap-4"
		>
			{#each [0, 1, 2, 3, 4] as i (i)}
				<Skeleton class="h-10 w-full rounded-md lg:w-28" />
			{/each}
		</div>
		<div class="bg-secondary rounded-md p-2 lg:p-8">
			<Skeleton class="mb-6 h-8 w-48" />
			<div class="space-y-4">
				<Skeleton class="h-32 w-full rounded-lg" />
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Skeleton class="h-64 w-full rounded-lg" />
					<Skeleton class="h-64 w-full rounded-lg" />
				</div>
			</div>
		</div>
	</div>
{:else}
	<Tabs.Root bind:value={currentTab} class="w-full">
		<Tabs.List
			class="grid h-auto w-full grid-cols-2 flex-col items-start lg:flex lg:flex-row lg:items-center"
		>
			{#each tabs as tab}
				<Tabs.Trigger value={tab.id} class="justify-start lg:justify-center">
					<LabelWithIcon icon={tab.Icon} label={tab.name} />
				</Tabs.Trigger>
			{/each}
		</Tabs.List>
		{#each tabs as { id, Component } (id)}
			<Tabs.Content class="w-full" value={id}>
				<Component />
			</Tabs.Content>
		{/each}
	</Tabs.Root>
{/if}
