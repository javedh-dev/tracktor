<script lang="ts">
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Textarea } from '$ui/textarea';
	import * as Tabs from '$ui/tabs';
	import { Checkbox } from '$ui/checkbox';
	import Download from '@lucide/svelte/icons/download';
	import Upload from '@lucide/svelte/icons/upload';
	import Lock from '@lucide/svelte/icons/lock';
	import Unlock from '@lucide/svelte/icons/unlock';
	import { toast } from 'svelte-sonner';

	let exportPassword = $state('');
	let importPassword = $state('');
	let importData = $state('');
	let useEncryption = $state(false);
	let isExporting = $state(false);
	let isImporting = $state(false);

	async function exportData() {
		if (isExporting) return;

		isExporting = true;
		try {
			const response = await fetch('/api/data/export', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					encrypt: useEncryption,
					password: useEncryption ? exportPassword : undefined
				})
			});

			if (!response.ok) {
				throw new Error('Export failed');
			}

			const result = await response.json();

			// Create download
			const blob = new Blob([JSON.stringify(result.data, null, 2)], {
				type: 'application/json'
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `tracktor-export-${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			toast.success('Data exported successfully');
		} catch (error) {
			console.error('Export error:', error);
			toast.error('Failed to export data');
		} finally {
			isExporting = false;
		}
	}

	async function handleImportData() {
		if (isImporting || !importData.trim()) return;

		isImporting = true;
		try {
			let parsedData;
			try {
				parsedData = JSON.parse(importData);
			} catch {
				throw new Error('Invalid JSON format');
			}

			const response = await fetch('/api/data/import', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					data: parsedData,
					password: importPassword || undefined
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Import failed');
			}

			toast.success('Data imported successfully');
			importData = '';
			importPassword = '';
		} catch (error) {
			console.error('Import error:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to import data');
		} finally {
			isImporting = false;
		}
	}

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				importData = e.target?.result as string;
			};
			reader.readAsText(file);
		}
	}
</script>

<div class="space-y-6">
	<Tabs.Root value="export" class="w-full">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="export">Export Data</Tabs.Trigger>
			<Tabs.Trigger value="import">Import Data</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="export" class="space-y-4">
			<div class="space-y-4">
				<div class="flex items-center space-x-2">
					<Checkbox bind:checked={useEncryption} id="encrypt" />
					<Label for="encrypt" class="flex items-center gap-2">
						{#if useEncryption}
							<Lock class="h-4 w-4" />
						{:else}
							<Unlock class="h-4 w-4" />
						{/if}
						Encrypt export data
					</Label>
				</div>

				{#if useEncryption}
					<div class="space-y-2">
						<Label for="export-password">Encryption Password</Label>
						<Input
							id="export-password"
							type="password"
							bind:value={exportPassword}
							placeholder="Enter password for encryption"
						/>
						<p class="text-muted-foreground text-sm">
							Keep this password safe - you'll need it to decrypt the data during import.
						</p>
					</div>
				{/if}

				<Button
					onclick={exportData}
					disabled={isExporting || (useEncryption && !exportPassword)}
					class="w-full"
				>
					<Download class="mr-2 h-4 w-4" />
					{isExporting ? 'Exporting...' : 'Export Database'}
				</Button>

				<div class="bg-muted rounded-lg p-4">
					<h4 class="font-medium">Export Information</h4>
					<ul class="text-muted-foreground mt-2 text-sm">
						<li>• Exports all database tables and data</li>
						<li>• Includes vehicles, fuel logs, maintenance records, etc.</li>
						<li>• Optional encryption for sensitive data protection</li>
						<li>• Downloads as JSON file</li>
					</ul>
				</div>
			</div>
		</Tabs.Content>

		<Tabs.Content value="import" class="space-y-4">
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="import-file">Upload JSON File</Label>
					<Input id="import-file" type="file" accept=".json" onchange={handleFileUpload} />
				</div>

				<div class="space-y-2">
					<Label for="import-data">Or Paste JSON Data</Label>
					<Textarea
						id="import-data"
						bind:value={importData}
						placeholder="Paste your exported JSON data here..."
						rows={8}
					/>
				</div>

				<div class="space-y-2">
					<Label for="import-password">Decryption Password (if encrypted)</Label>
					<Input
						id="import-password"
						type="password"
						bind:value={importPassword}
						placeholder="Enter password if data is encrypted"
					/>
				</div>

				<Button
					onclick={handleImportData}
					disabled={isImporting || !importData.trim()}
					class="w-full"
					variant="destructive"
				>
					<Upload class="mr-2 h-4 w-4" />
					{isImporting ? 'Importing...' : 'Import Database'}
				</Button>

				<div class="bg-destructive/10 rounded-lg p-4">
					<h4 class="text-destructive font-medium">⚠️ Import Warning</h4>
					<ul class="text-destructive/80 mt-2 text-sm">
						<li>• This will replace ALL existing data</li>
						<li>• Make sure to backup current data first</li>
						<li>• Import cannot be undone</li>
						<li>• Verify the JSON format is correct</li>
					</ul>
				</div>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>
