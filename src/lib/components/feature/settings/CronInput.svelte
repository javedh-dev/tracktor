<script lang="ts">
	import Input from '$appui/input.svelte';
	import * as Select from '$ui/select';
	import Clock from '@lucide/svelte/icons/clock';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';

	interface Props {
		value: string;
		disabled?: boolean;
		placeholder?: string;
	}

	let { value = $bindable(), disabled = false, placeholder = '* * * * *' }: Props = $props();

	// Common cron presets
	const presets = [
		{ label: 'Every minute', value: '* * * * *' },
		{ label: 'Every 5 minutes', value: '*/5 * * * *' },
		{ label: 'Every 15 minutes', value: '*/15 * * * *' },
		{ label: 'Every 30 minutes', value: '*/30 * * * *' },
		{ label: 'Every hour', value: '0 * * * *' },
		{ label: 'Every 2 hours', value: '0 */2 * * *' },
		{ label: 'Every 6 hours', value: '0 */6 * * *' },
		{ label: 'Every 12 hours', value: '0 */12 * * *' },
		{ label: 'Daily at midnight', value: '0 0 * * *' },
		{ label: 'Daily at 2:00 AM', value: '0 2 * * *' },
		{ label: 'Daily at 8:00 AM', value: '0 8 * * *' },
		{ label: 'Daily at noon', value: '0 12 * * *' },
		{ label: 'Weekly (Monday)', value: '0 0 * * 1' },
		{ label: 'Monthly (1st)', value: '0 0 1 * *' }
	];

	// Basic cron validation
	function validateCron(expr: string): { valid: boolean; message: string } {
		if (!expr || expr.trim() === '') {
			return { valid: false, message: 'Expression required' };
		}

		const parts = expr.trim().split(/\s+/);
		if (parts.length !== 5) {
			return { valid: false, message: 'Must have 5 parts' };
		}

		// Basic validation for each part
		const [minute, hour, day, month, weekday] = parts;

		// Check if parts contain valid characters
		const validPattern = /^[\d*/,-]+$/;
		if (
			!validPattern.test(minute) ||
			!validPattern.test(hour) ||
			!validPattern.test(day) ||
			!validPattern.test(month) ||
			!validPattern.test(weekday)
		) {
			return { valid: false, message: 'Invalid characters' };
		}

		return { valid: true, message: 'Valid expression' };
	}

	// Get next execution times (simplified - just for display)
	function getNextExecutionHint(expr: string): string {
		const preset = presets.find((p) => p.value === expr);
		if (preset) {
			return preset.label;
		}

		const parts = expr.trim().split(/\s+/);
		if (parts.length !== 5) return 'Invalid expression';

		const [minute, hour, day, month, weekday] = parts;

		// Simple interpretation
		if (minute === '*' && hour === '*') {
			return 'Every minute';
		}
		if (minute.startsWith('*/') && hour === '*') {
			return `Every ${minute.slice(2)} minutes`;
		}
		if (hour === '*') {
			return `Every hour at minute ${minute}`;
		}
		if (day === '*' && month === '*' && weekday === '*') {
			return `Daily at ${hour}:${minute.padStart(2, '0')}`;
		}

		return 'Custom schedule';
	}

	let validation = $derived(validateCron(value));
	let hint = $derived(validation.valid ? getNextExecutionHint(value) : validation.message);

	let selectedPreset = $state<string | undefined>(undefined);

	$effect(() => {
		if (selectedPreset) {
			value = selectedPreset;
		}
	});
</script>

<div class="space-y-2">
	<div class="flex gap-2">
		<div class="flex-1">
			<Input
				bind:value
				{placeholder}
				{disabled}
				class="mono font-mono"
				aria-label="Cron expression"
			/>
		</div>
		<Select.Root bind:value={selectedPreset} type="single" {disabled}>
			<Select.Trigger class="w-[140px]">
				<Clock class="mr-2 h-4 w-4" />
				Presets
			</Select.Trigger>
			<Select.Content>
				{#each presets as preset}
					<Select.Item value={preset.value}>
						{preset.label}
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	<div class="flex items-center gap-2 text-xs">
		{#if validation.valid}
			<Check class="h-3 w-3 text-green-600 dark:text-green-400" />
			<span class="text-muted-foreground">{hint}</span>
		{:else}
			<X class="text-destructive h-3 w-3" />
			<span class="text-destructive">{hint}</span>
		{/if}
	</div>
</div>
