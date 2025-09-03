<script lang="ts">
	import Button from '$components/common/Button.svelte';

	let { modalVisibility = $bindable(), loading = false, callback } = $props();

	let status = $state<{
		message: string | null;
		type: 'ERROR' | 'SUCCESS' | null;
	}>({
		message: null,
		type: null
	});

	import { config, type Config } from '$lib/stores/config';

	let localConfig: Config[] = $state([]);

	const dateFormatOptions = [
		{ value: 'dd/MM/yyyy', label: 'dd/MM/yyyy (e.g., 31/12/2000)' },
		{ value: 'MM/dd/yyyy', label: 'MM/dd/yyyy (e.g., 12/25/2000)' },
		{ value: 'yyyy-MM-dd', label: 'yyyy-MM-dd (e.g., 2000-12-31)' },
		{ value: 'dd MMM, yyyy', label: 'dd MMM, yyyy (e.g., 31 Dec, 2000)' }
	];

	const currencyOptions = [
		{ value: 'INR', label: 'INR (₹)' },
		{ value: 'USD', label: 'USD ($)' },
		{ value: 'EUR', label: 'EUR (€)' },
		{ value: 'GBP', label: 'GBP (£)' }
	];

	const uomOptions = [
		{ value: 'metric', label: 'Metric' },
		{ value: 'imperial', label: 'Imperial' }
	];

	config.subscribe((value) => {
		localConfig = JSON.parse(JSON.stringify(value));
	});

	async function saveConfig() {
		await config.save(localConfig);
		callback(true);
		modalVisibility = false;
	}
</script>

<form
	class="space-y-6"
	onsubmit={(e) => {
		saveConfig();
		e.preventDefault();
	}}
	aria-labelledby="fuel-refill-form-title"
>
	{#each localConfig as item}
		<div
			class="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
		>
			<label
				for={item.key}
				class="mb-2 block text-lg font-semibold text-gray-800 capitalize dark:text-gray-200"
			>
				{item.key.replace(/([A-Z])/g, ' $1')}
			</label>
			<p class="mb-4 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>

			{#if item.key === 'dateFormat'}
				<select
					id={item.key}
					bind:value={item.value}
					class="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
				>
					{#each dateFormatOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			{:else if item.key === 'currency'}
				<select
					id={item.key}
					bind:value={item.value}
					class="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
				>
					{#each currencyOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			{:else if item.key === 'unitOfMeasure'}
				<select
					id={item.key}
					bind:value={item.value}
					class="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
				>
					{#each uomOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			{:else}
				<input
					type="text"
					id={item.key}
					bind:value={item.value}
					class="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
				/>
			{/if}
		</div>
	{/each}
	<Button type="submit" variant="primary" text="Update" {loading} />
</form>
{#if status.message}
	<p
		class={`mt-4 text-center text-sm ${status.type === 'ERROR' ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}
	>
		{#if status.type === 'ERROR'}
			<span class="font-semibold">Error:</span> {status.message}
		{:else}
			{status.message}
		{/if}
	</p>
{/if}
