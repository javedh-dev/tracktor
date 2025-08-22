<script lang="ts">
	import Button from '$components/common/Button.svelte';
	import { languageOptions, currentLanguage, setLanguage, t, isLoading } from '$lib/stores/i18n';
	import { config, type Config } from '$lib/stores/config';

	let { modalVisibility = $bindable(), loading = false, callback } = $props();

	let status = $state<{
		message: string | null;
		type: 'ERROR' | 'SUCCESS' | null;
	}>({
		message: null,
		type: null
	});

	let localConfig: Config[] = $state([]);

	// Opciones dinámicas basadas en traducciones - usando $derived en lugar de $:
	const dateFormatOptions = $derived([
		{ value: 'dd/MM/yyyy', label: $t('config.dateFormats.ddmmyyyy') },
		{ value: 'MM/dd/yyyy', label: $t('config.dateFormats.mmddyyyy') },
		{ value: 'yyyy-MM-dd', label: $t('config.dateFormats.yyyymmdd') },
		{ value: 'dd MMM, yyyy', label: $t('config.dateFormats.ddmmmyyyy') }
	]);

	const currencyOptions = $derived([
		{ value: 'INR', label: $t('config.currencies.inr') },
		{ value: 'USD', label: $t('config.currencies.usd') },
		{ value: 'EUR', label: $t('config.currencies.eur') },
		{ value: 'GBP', label: $t('config.currencies.gbp') },
		{ value: 'MXN', label: $t('config.currencies.mxn') },
		{ value: 'ARS', label: $t('config.currencies.ars') },
		{ value: 'COP', label: $t('config.currencies.cop') },
		{ value: 'CLP', label: $t('config.currencies.clp') }
	]);

	const uomOptions = $derived([
		{ value: 'metric', label: $t('config.units.metric') },
		{ value: 'imperial', label: $t('config.units.imperial') }
	]);

	config.subscribe((value) => {
		localConfig = JSON.parse(JSON.stringify(value));
	});

	function handleLanguageChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		setLanguage(target.value);
	}

	async function saveConfig() {
		try {
			await config.save(localConfig);
			status = {
				message: $t('common.success'),
				type: 'SUCCESS'
			};
			callback(true);
			modalVisibility = false;
		} catch (error) {
			status = {
				message: $t('common.error'),
				type: 'ERROR'
			};
		}
	}
</script>

{#if $isLoading}
	<div class="flex items-center justify-center p-8">
		<div class="text-center">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
			<p class="text-gray-500">{$t('common.loading')}</p>
		</div>
	</div>
{:else}
	<form
		class="space-y-6"
		onsubmit={(e) => {
			saveConfig();
			e.preventDefault();
		}}
		aria-labelledby="config-form-title"
	>
		<!-- Selector de idioma dinámico -->
		<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
			<label
				for="language-selector"
				class="mb-2 block text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"
			>
				🌐 {$t('config.language.title')}
			</label>
			<p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
				{$t('config.language.description')}
			</p>
			<select
				id="language-selector"
				value={$currentLanguage}
				onchange={handleLanguageChange}
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
			>
				{#each $languageOptions as option}
					<option value={option.code}>
						{option.flag} {option.nativeName} ({option.name})
					</option>
				{/each}
			</select>
		</div>

		<!-- Configuraciones existentes -->
		{#each localConfig as item}
			<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
				<label
					for={item.key}
					class="mb-2 block text-lg font-semibold text-gray-800 capitalize dark:text-gray-200 flex items-center gap-2"
				>
					{#if item.key === 'dateFormat'}
						📅 {$t('config.regional.dateFormat')}
					{:else if item.key === 'currency'}
						💰 {$t('config.regional.currency')}
					{:else if item.key === 'unitOfMeasure'}
						📏 {$t('config.regional.units')}
					{:else}
						⚙️ {$t(`config.fields.${item.key}`) || item.key.replace(/([A-Z])/g, ' $1')}
					{/if}
				</label>
				<p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
					{$t(`config.descriptions.${item.key}`) || item.description}
				</p>

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
					<div class="flex gap-4">
						{#each uomOptions as option}
							<label class="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
								<input
									type="radio"
									bind:group={item.value}
									value={option.value}
									class="text-blue-600 focus:ring-blue-500"
								/>
								<span class="text-gray-700 dark:text-gray-300">{option.label}</span>
							</label>
						{/each}
					</div>
				{:else}
					<input
						type="text"
						id={item.key}
						bind:value={item.value}
						placeholder={$t(`config.placeholders.${item.key}`) || ''}
						class="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
					/>
				{/if}
			</div>
		{/each}

		<div class="flex justify-end gap-3">
			<Button
				type="button"
				variant="secondary"
				text={$t('common.cancel')}
				onclick={() => (modalVisibility = false)}
			/>
			<Button
				type="submit"
				variant="primary"
				text={$t('common.save')}
				{loading}
			/>
		</div>
	</form>
{/if}

{#if status.message}
	<div class="mt-4 p-4 rounded-lg {status.type === 'ERROR' ? 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'}">
		<p class="text-sm {status.type === 'ERROR' ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}">
			{#if status.type === 'ERROR'}
				<span class="font-semibold">⚠️ {$t('common.error')}:</span> {status.message}
			{:else}
				<span class="font-semibold">✅ {$t('common.success')}:</span> {status.message}
			{/if}
		</p>
	</div>
{/if}
