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
