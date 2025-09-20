<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import OverviewTab from '../features/overview/OverviewTab.svelte';
	import FuelLogTab from '../features/fuel/FuelLogTab.svelte';
	import MaintenenceLogTab from '../features/maintenance/MaintenenceLogTab.svelte';
	import InsuranceTab from '../features/insurance/InsuranceTab.svelte';
	import PollutionTab from '../features/pollution/PollutionTab.svelte';
	import { BadgeInfo, Fuel, Shield, SquareKanban, Wrench } from '@lucide/svelte/icons';
	import LabelWithIcon from '../ui/app/LabelWithIcon.svelte';

	let { vehicleId = $bindable() } = $props();

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
			<Component {vehicleId} />
		</Tabs.Content>
	{/each}
</Tabs.Root>
