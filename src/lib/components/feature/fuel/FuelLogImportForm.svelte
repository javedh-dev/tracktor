<script lang="ts">
	import { FileDropZone } from '$lib/components/app';
	import {
		parseCsvPreview,
		importFuelLogsFromCsv,
		type ParsedCsvRow
	} from '$lib/helper/csv.helper';
	import { fuelLogStore } from '$stores/fuel-log.svelte';
	import { sheetStore } from '$stores/sheet.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import Button from '$ui/button/button.svelte';
	import Checkbox from '$ui/checkbox/checkbox.svelte';
	import Badge from '$ui/badge/badge.svelte';
	import { Separator } from '$ui/separator';
	import * as Select from '$ui/select/index.js';
	import * as Table from '$ui/table/index.js';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import Check from '@lucide/svelte/icons/check';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import { toast } from 'svelte-sonner';
	import Input from '$lib/components/app/input.svelte';
	import { isValidFormat, parseWithFormat } from '$lib/helper/format.helper';
	import { configStore } from '$lib/stores/config.svelte';
	import * as m from '$lib/paraglide/messages';

	type FuelLogColumnKey =
		| 'date'
		| 'odometer'
		| 'fuelAmount'
		| 'cost'
		| 'filled'
		| 'missedLast'
		| 'notes';

	interface ColumnDefinition {
		key: FuelLogColumnKey;
		label: string;
		required: boolean;
		hint?: string;
	}

	const stepOrder = [1, 2, 3] as const;

	const columns: ColumnDefinition[] = [
		{ key: 'date', label: m.col_date(), required: true, hint: m.fuel_import_col_date_hint() },
		{
			key: 'odometer',
			label: m.col_odometer(),
			required: false,
			hint: m.fuel_import_col_odometer_hint()
		},
		{
			key: 'fuelAmount',
			label: m.col_fuel_amount(),
			required: false,
			hint: m.fuel_import_col_fuel_hint()
		},
		{ key: 'cost', label: m.col_cost(), required: true, hint: m.fuel_import_col_cost_hint() },
		{
			key: 'filled',
			label: m.form_full_tank(),
			required: false,
			hint: m.fuel_import_col_filled_hint()
		},
		{
			key: 'missedLast',
			label: m.col_missed_last(),
			required: false,
			hint: m.fuel_import_col_missed_hint()
		},
		{ key: 'notes', label: m.col_notes(), required: false, hint: m.fuel_import_col_notes_hint() }
	];

	const defaultMapping = (): Record<FuelLogColumnKey, string> => ({
		date: '',
		odometer: '',
		fuelAmount: '',
		cost: '',
		filled: '',
		missedLast: '',
		notes: ''
	});

	const autoMapHints: Record<FuelLogColumnKey, string[]> = {
		date: ['date', 'refuel date', 'refill date'],
		odometer: ['odo', 'odometer', 'mileage'],
		fuelAmount: ['fuel', 'volume', 'litre', 'liter', 'quantity', 'energy', 'kwh'],
		cost: ['cost', 'price', 'amount', 'total'],
		filled: ['full', 'filled', 'tank'],
		missedLast: ['missed', 'skip', 'skipped'],
		notes: ['note', 'remarks', 'comment', 'description']
	};

	let step = $state<(typeof stepOrder)[number]>(1);
	let file = $state<File>();
	let delimiter = $state(',');
	let hasHeaders = $state(true);
	let dateFormat = $state(configStore.configs.dateFormat || 'MM/dd/yyyy');
	let csvHeaders = $state<string[]>([]);
	let csvRows = $state<ParsedCsvRow[]>([]);
	let mapping = $state<Record<FuelLogColumnKey, string>>(defaultMapping());
	let parseError = $state<string>();
	let processing = $state<'idle' | 'parsing' | 'importing'>('idle');

	const selectedVehicle = $derived(
		vehicleStore.vehicles?.find((vehicle) => vehicle.id === vehicleStore.selectedId)
	);

	const selectedVehicleLabel = $derived(
		selectedVehicle
			? `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.licensePlate})`
			: m.fuel_import_no_vehicle()
	);

	const requiredKeys = $derived(columns.filter((c) => c.required).map((c) => c.key));

	const mappedPreview = $derived(
		csvRows.slice(0, 10).map((row) => {
			const preview: Record<FuelLogColumnKey, string> = {
				date: '',
				odometer: '',
				fuelAmount: '',
				cost: '',
				filled: '',
				missedLast: '',
				notes: ''
			};

			for (const column of columns) {
				const selectedHeader = mapping[column.key];
				if (selectedHeader && selectedHeader !== '__skip') {
					preview[column.key] = row[selectedHeader] ?? '';
				}
			}
			return preview;
		})
	);

	const mappingValid = $derived(
		requiredKeys.every((key) => {
			const value = mapping[key];
			return Boolean(value && value !== '__skip');
		})
	);

	const canProceedFromUpload = $derived(
		Boolean(file) && processing === 'idle' && dateFormat.trim().length > 0
	);
	const canProceedFromMapping = $derived(mappingValid && processing === 'idle');
	const canImport = $derived(mappingValid && csvRows.length > 0 && processing === 'idle');

	const dateValidationErrors = $derived(
		(() => {
			const errors: Record<number, string> = {};
			const dateHeader = mapping.date;
			if (!dateHeader || dateHeader === '__skip') return errors;

			for (let i = 0; i < Math.min(mappedPreview.length, csvRows.length); i++) {
				const dateStr = csvRows[i][dateHeader];
				if (dateStr && !parseWithFormat(dateStr, dateFormat)) {
					errors[i] = m.fuel_import_date_invalid();
				}
			}
			return errors;
		})()
	);

	const hasDateErrors = $derived(Object.keys(dateValidationErrors).length > 0);

	const buildAutoMapping = (headers: string[]) => {
		const next = defaultMapping();
		for (const header of headers) {
			const normalized = header.toLowerCase();
			for (const column of columns) {
				if (next[column.key]) continue;
				if (autoMapHints[column.key].some((hint) => normalized.includes(hint))) {
					next[column.key] = header;
				}
			}
		}
		return next;
	};

	const resetParsedState = () => {
		csvHeaders = [];
		csvRows = [];
		mapping = defaultMapping();
		parseError = undefined;
		step = 1;
	};

	const handleFileChange = (value: File | undefined) => {
		file = value;
		resetParsedState();
	};

	const handleParse = async () => {
		if (!file) return;
		processing = 'parsing';
		parseError = undefined;
		try {
			const parsed = await parseCsvPreview(file, { delimiter, hasHeaders });
			csvHeaders = parsed.headers || [];
			csvRows = parsed.rows || [];
			if (!csvHeaders.length) {
				parseError = m.fuel_import_error_no_headers();
				return;
			}
			mapping = buildAutoMapping(csvHeaders);
			step = 2;
		} catch (err: any) {
			parseError = err?.message || m.fuel_import_error_generic();
			toast.error(parseError ?? m.fuel_import_error_generic());
		} finally {
			processing = 'idle';
		}
	};

	const goToPreview = () => {
		if (!canProceedFromMapping) return;
		step = 3;
	};

	const handleImport = async () => {
		if (!canImport || !vehicleStore.selectedId) return;
		processing = 'importing';
		try {
			const rowsForImport = csvRows.map((row) => {
				const mappedRow: Record<string, string> = {};
				for (const column of columns) {
					const header = mapping[column.key];
					if (header && header !== '__skip') {
						mappedRow[column.key] = row[header] ?? '';
					}
				}
				return mappedRow;
			});

			const result = await importFuelLogsFromCsv(
				rowsForImport,
				vehicleStore.selectedId,
				dateFormat
			);

			if (result.failed === 0) {
				toast.success(m.fuel_import_success({ count: result.imported }));
				sheetStore.closeSheet(() => fuelLogStore.refreshFuelLogs());
			} else {
				const message = m.fuel_import_failed_count({
					imported: result.imported,
					failed: result.failed
				});
				toast.error(message);
				if (result.errors.length > 0) {
					console.error('Import errors:', result.errors);
				}
			}
		} catch (err: any) {
			toast.error(err?.message || m.fuel_import_error_generic());
		} finally {
			processing = 'idle';
		}
	};
</script>

<div class="max-w-4xl space-y-6">
	<div class="space-y-1">
		<p class="text-sm font-bold">
			Vehicle: <Badge variant="outline">{selectedVehicleLabel}</Badge>
		</p>
	</div>
	<div class="flex flex-nowrap items-center gap-3 overflow-x-auto pb-1">
		{#each stepOrder as stepId, index}
			<div class="flex flex-col items-center gap-2">
				<Badge variant={step >= stepId ? 'default' : 'outline'} class="w-8 justify-center">
					{#if step > stepId}
						<Check class="h-4 w-4" />
					{:else}
						{stepId}
					{/if}
				</Badge>
			</div>
			{#if index < stepOrder.length - 1}
				<div class="flex-1">
					<Separator orientation="horizontal" />
				</div>
			{/if}
		{/each}
	</div>
	{#if step === 1}
		<section>
			<div class="space-y-6">
				<div class="space-y-1">
					<p class="text-lg font-semibold">{m.fuel_import_step_1_title()}</p>
					<p class="text-muted-foreground text-sm">
						{m.fuel_import_step_1_desc()}
					</p>
				</div>
				<Separator class="my-4" orientation="horizontal" />
				<div class="space-y-2">
					<FileDropZone
						variant="attachment"
						accept=".csv,.tsv,.txt,text/csv,text/plain"
						bind:file
						onFileSelect={handleFileChange}
						placeholder={m.fuel_import_drop_placeholder()}
					/>
				</div>
				<div class="flex flex-row items-center gap-2">
					<Checkbox bind:checked={hasHeaders} id="has-headers-checkbox" />
					<p class="text-muted-foreground text-sm">{m.fuel_import_headers_checkbox()}</p>
				</div>
				<div class="space-y-2">
					<p class="text-sm font-semibold">{m.fuel_import_delimiter_title()}</p>
					<p class="text-muted-foreground text-xs">{m.fuel_import_delimiter_desc()}</p>
					<Select.Root type="single" bind:value={delimiter}>
						<Select.Trigger class="w-full">
							{#if delimiter === ','}
								{m.fuel_import_delimiter_comma()}
							{:else if delimiter === ';'}
								{m.fuel_import_delimiter_semicolon()}
							{:else if delimiter === '\t'}
								{m.fuel_import_delimiter_tab()}
							{:else if delimiter === '|'}
								{m.fuel_import_delimiter_pipe()}
							{:else}
								{m.fuel_import_delimiter_custom()}
							{/if}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value=",">{m.fuel_import_delimiter_comma()}</Select.Item>
							<Select.Item value=";">{m.fuel_import_delimiter_semicolon()}</Select.Item>
							<Select.Item value="\t">{m.fuel_import_delimiter_tab()}</Select.Item>
							<Select.Item value="|">{m.fuel_import_delimiter_pipe()}</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-2">
					<p class="text-sm font-semibold">{m.fuel_import_date_format_title()}</p>
					<p class="text-muted-foreground text-xs">
						{m.fuel_import_date_format_desc()}
					</p>
					<Input
						placeholder={m.fuel_import_date_format_placeholder()}
						bind:value={dateFormat}
						id="date-format-input"
					/>
					<p class="text-muted-foreground text-xs">
						{m.common_example_prefix()}
						{isValidFormat(dateFormat).ex || m.common_invalid_format()}
					</p>
				</div>

				{#if parseError}
					<div
						class="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md px-3 py-2 text-sm"
					>
						<AlertCircle class="h-4 w-4" />
						<span>{parseError}</span>
					</div>
				{/if}

				<div class="flex justify-end gap-2">
					<Button
						variant="outline"
						onclick={() => sheetStore.closeSheet()}
						class="cursor-pointer"
						size="sm"
					>
						{m.common_cancel()}
					</Button>
					<Button
						onclick={handleParse}
						disabled={!canProceedFromUpload}
						class="cursor-pointer"
						size="sm"
					>
						{#if processing === 'parsing'}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						{m.common_continue()}
					</Button>
				</div>
			</div>
		</section>
	{/if}

	{#if step === 2}
		<section>
			<div class="space-y-1">
				<p class="text-lg font-semibold">{m.fuel_import_step_2_title()}</p>
				<p class="text-muted-foreground text-sm">
					{@html m.fuel_import_step_2_desc()}
				</p>
			</div>
			<Separator class="my-4" orientation="horizontal" />
			{#if csvHeaders.length === 0}
				<div class="text-muted-foreground text-sm">
					{m.fuel_import_error_no_headers()}
				</div>
			{:else}
				<div class="my-6 flex flex-col gap-4">
					{#each columns as column}
						<div class="flex h-full flex-row items-start justify-between rounded-md py-1">
							<div class="space-y-1">
								<p class="text-sm font-semibold">
									{column.label}
									{#if column.required}<span class="text-destructive">*</span>{/if}
								</p>
								{#if column.hint}
									<p class="text-muted-foreground text-xs">{column.hint}</p>
								{/if}
							</div>
							<div>
								<Select.Root type="single" bind:value={mapping[column.key]}>
									<Select.Trigger>
										{#if mapping[column.key] && mapping[column.key] !== '__skip'}
											{mapping[column.key]}
										{:else if !column.required}
											{m.common_skip()}
										{:else}
											{m.common_select_column()}
										{/if}
									</Select.Trigger>
									<Select.Content>
										{#if !column.required}
											<Select.Item value="__skip">{m.common_skip()}</Select.Item>
										{/if}
										{#each csvHeaders as header}
											<Select.Item value={header}>{header}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<div class="flex justify-between gap-2">
				<Button variant="outline" onclick={() => (step = 1)} class="cursor-pointer" size="icon-sm">
					<ChevronLeft class="h-4 w-4" />
				</Button>
				<div class="flex gap-2">
					<Button
						variant="outline"
						onclick={resetParsedState}
						class="cursor-pointer"
						size="icon-sm"
					>
						<RotateCcw class="h-4 w-4" />
					</Button>
					<Button
						onclick={goToPreview}
						disabled={!canProceedFromMapping}
						class="cursor-pointer"
						size="icon-sm"
						variant="default"
					>
						<ChevronRight class="h-4 w-4" />
					</Button>
				</div>
			</div>
		</section>
	{/if}

	{#if step === 3}
		<section>
			<div class="space-y-1">
				<p class="text-lg font-semibold">{m.fuel_import_step_3_title()}</p>
				<p class="text-muted-foreground text-sm">{m.fuel_import_step_3_desc()}</p>
			</div>
			<Separator class="my-4" orientation="horizontal" />

			{#if hasDateErrors}
				<div
					class="bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm"
				>
					<AlertCircle class="h-4 w-4" />
					<span>{m.fuel_import_date_error({ format: dateFormat })}</span>
				</div>
			{/if}

			<div class="my-4 overflow-x-auto rounded-md border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-12">#</Table.Head>
							{#each columns as column}
								<Table.Head>{column.label}</Table.Head>
							{/each}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#if mappedPreview.length === 0}
							<Table.Row>
								<Table.Cell
									colspan={columns.length + 1}
									class="text-muted-foreground text-center text-sm"
								>
									{m.fuel_import_no_preview()}
								</Table.Cell>
							</Table.Row>
						{:else}
							{#each mappedPreview as row, index}
								<Table.Row
									class={dateValidationErrors[index]
										? 'bg-destructive/10 hover:bg-destructive/15'
										: ''}
								>
									<Table.Cell class="font-mono text-xs">{index + 1}</Table.Cell>
									{#each columns as column}
										<Table.Cell
											class={`text-sm ${column.key === 'date' && dateValidationErrors[index] ? 'text-destructive font-semibold' : ''}`}
										>
											{row[column.key] || ''}
										</Table.Cell>
									{/each}
								</Table.Row>
							{/each}
						{/if}
					</Table.Body>
				</Table.Root>
			</div>

			<div class="flex justify-between gap-2">
				<Button variant="outline" onclick={() => (step = 2)} class="cursor-pointer" size="icon-sm">
					<ChevronLeft class="h-4 w-4" />
				</Button>
				<div class="flex items-center gap-2">
					{#if processing === 'importing'}
						<Loader2 class="text-muted-foreground mr-2 inline-block h-4 w-4 animate-spin" />
					{/if}
					<Button
						onclick={handleImport}
						disabled={!canImport || hasDateErrors || processing === 'importing'}
						class="cursor-pointer"
						size="sm"
					>
						{m.common_import()}
					</Button>
				</div>
			</div>
		</section>
	{/if}
</div>
