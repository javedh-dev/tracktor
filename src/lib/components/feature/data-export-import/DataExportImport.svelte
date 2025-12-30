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
	import * as m from '$lib/paraglide/messages';

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
				throw new Error(m.tools_export_error());
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

			toast.success(m.tools_export_success());
		} catch (error) {
			console.error('Export error:', error);
			toast.error(error instanceof Error ? error.message : m.tools_export_error());
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
				throw new Error(m.tools_import_invalid_json());
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
				throw new Error(error.message || m.tools_import_error());
			}

			toast.success(m.tools_import_success());
			importData = '';
			importPassword = '';
		} catch (error) {
			console.error('Import error:', error);
			toast.error(error instanceof Error ? error.message : m.tools_import_error());
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

<div id="data-export-import-container" class="data-export-import space-y-6">
	<Tabs.Root id="data-export-import-tabs" value="export" class="w-full">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="export">{m.tools_export_data()}</Tabs.Trigger>
			<Tabs.Trigger value="import">{m.tools_import_data()}</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content id="data-export-tab" value="export" class="space-y-4">
			<div class="space-y-4">
				<div class="flex items-center space-x-2">
					<Checkbox id="data-export-encryption-checkbox" bind:checked={useEncryption} />
					<Label for="data-export-encryption-checkbox" class="flex items-center gap-2">
						{#if useEncryption}
							<Lock class="h-4 w-4" />
						{:else}
							<Unlock class="h-4 w-4" />
						{/if}
						{m.tools_export_encrypt_label()}
					</Label>
				</div>

				{#if useEncryption}
					<div class="space-y-2">
						<Label for="export-password">{m.tools_export_password_label()}</Label>
						<Input
							id="export-password"
							type="password"
							bind:value={exportPassword}
							placeholder={m.tools_export_password_placeholder()}
						/>
						<p class="text-muted-foreground text-sm">
							{m.tools_export_password_hint()}
						</p>
					</div>
				{/if}

				<Button
					id="data-export-button"
					onclick={exportData}
					disabled={isExporting || (useEncryption && !exportPassword)}
					class="w-full"
				>
					<Download class="mr-2 h-4 w-4" />
					{isExporting ? m.tools_export_status_exporting() : m.tools_export_button()}
				</Button>

				<div class="bg-muted rounded-lg p-4">
					<h4 class="font-medium">{m.tools_export_info_title()}</h4>
					<ul class="text-muted-foreground mt-2 text-sm">
						<li>{m.tools_export_info_bullet_1()}</li>
						<li>{m.tools_export_info_bullet_2()}</li>
						<li>{m.tools_export_info_bullet_3()}</li>
						<li>{m.tools_export_info_bullet_4()}</li>
					</ul>
				</div>
			</div>
		</Tabs.Content>

		<Tabs.Content id="data-import-tab" value="import" class="space-y-4">
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="import-file">{m.tools_import_upload_label()}</Label>
					<Input id="import-file" type="file" accept=".json" onchange={handleFileUpload} />
				</div>

				<div class="space-y-2">
					<Label for="import-data">{m.tools_import_paste_label()}</Label>
					<Textarea
						id="import-data"
						bind:value={importData}
						placeholder={m.tools_import_paste_placeholder()}
						rows={8}
					/>
				</div>

				<div class="space-y-2">
					<Label for="import-password">{m.tools_import_password_label()}</Label>
					<Input
						id="import-password"
						type="password"
						bind:value={importPassword}
						placeholder={m.tools_import_password_placeholder()}
					/>
				</div>

				<Button
					id="data-import-button"
					onclick={handleImportData}
					disabled={isImporting || !importData.trim()}
					class="w-full"
					variant="destructive"
				>
					<Upload class="mr-2 h-4 w-4" />
					{isImporting ? m.tools_import_status_importing() : m.tools_import_button()}
				</Button>

				<div class="bg-destructive/10 rounded-lg p-4">
					<h4 class="text-destructive font-medium">{m.tools_import_warning_title()}</h4>
					<ul class="text-destructive/80 mt-2 text-sm">
						<li>{m.tools_import_warning_bullet_1()}</li>
						<li>{m.tools_import_warning_bullet_2()}</li>
						<li>{m.tools_import_warning_bullet_3()}</li>
						<li>{m.tools_import_warning_bullet_4()}</li>
					</ul>
				</div>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>
