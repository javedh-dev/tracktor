<script lang="ts">
	let { activeTab = $bindable() } = $props();
	const tabs: {
		name: string;
		id: string;
	}[] = [
		{
			name: 'Dashboard',
			id: 'dashboard'
		},
		{
			name: 'Fuel Logs',
			id: 'fuel'
		},
		{
			name: 'Maintenance',
			id: 'maintenance'
		},
		{
			name: 'Insurance',
			id: 'insurance'
		},
		{
			name: 'Pollution Certificate',
			id: 'pollution'
		}
	];
</script>

<ul class="-mb-px flex flex-wrap" id="default-tab" role="tablist" aria-orientation="horizontal">
	{#each tabs as tab (tab)}
		<li class="me-2" role="presentation">
			<button
				class="inline-block cursor-pointer rounded-t-lg px-4 py-2 text-sm font-medium"
				class:text-blue-600={activeTab === tab.id}
				class:border-blue-600={activeTab === tab.id}
				class:hover:text-gray-600={activeTab !== tab.id}
				class:hover:border-gray-300={activeTab !== tab.id}
				class:dark:text-blue-500={activeTab === tab.id}
				class:dark:border-blue-500={activeTab === tab.id}
				class:dark:hover:text-gray-300={activeTab !== tab.id}
				class:border-transparent={activeTab !== tab.id}
				class:text-gray-500={activeTab !== tab.id}
				class:dark:text-gray-400={activeTab !== tab.id}
				onclick={() => (activeTab = tab.id)}
				type="button"
				role="tab"
				aria-controls={tab.name}
				aria-selected={activeTab === tab.id}>{tab.name}</button
			>
		</li>
	{/each}
</ul>
