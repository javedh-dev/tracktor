<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import { ToyBrick } from '@lucide/svelte';
	import OverviewTab from './OverviewTab.svelte';
	import type { Component } from 'svelte';
	import FuelLogTab from '../fuel/FuelLogTab.svelte';
	import MaintenenceLogTab from '../maintenance/MaintenenceLogTab.svelte';
	import InsuranceTab from '../insurance/InsuranceTab.svelte';
	import PollutionTab from '../pullution/PollutionTab.svelte';

	let { vehicleId = $bindable() } = $props();
	const tabs: {
		name: string;
		id: string;
		Component: any;
	}[] = [
		{
			name: 'Overview',
			id: 'overview',
			Component: OverviewTab
		},
		{
			name: 'Fuel Logs',
			id: 'fuel',
			Component: FuelLogTab
		},
		{
			name: 'Maintenance',
			id: 'maintenance',
			Component: MaintenenceLogTab
		},
		{
			name: 'Insurance',
			id: 'insurance',
			Component: InsuranceTab
		},
		{
			name: 'Pollution Certificate',
			id: 'pollution',
			Component: PollutionTab
		}
	];
</script>

<Tabs.Root value={tabs[0].id} class="w-full">
	<Tabs.List class="w-full">
		{#each tabs as tab}
			<Tabs.Trigger value={tab.id}>{tab.name}</Tabs.Trigger>
		{/each}
	</Tabs.List>
	{#each tabs as { id, Component }}
		<Tabs.Content value={id} class="w-full">
			<Component {vehicleId}></Component>
		</Tabs.Content>
	{/each}
</Tabs.Root>
