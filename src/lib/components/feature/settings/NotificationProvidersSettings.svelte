<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from '$ui/card';
	import Button from '$ui/button/button.svelte';
	import * as Dialog from '$ui/dialog';
	import Input from '$appui/input.svelte';
	import { Label } from '$ui/label';
	import { Checkbox } from '$ui/checkbox';
	import { toast } from 'svelte-sonner';
	import type {
		NotificationProviderWithParsedConfig,
		CreateNotificationProvider,
		EmailProviderConfig
	} from '$lib/domain/notification-provider';
	import * as providerService from '$lib/services/notification-provider.service';
	import Mail from '@lucide/svelte/icons/mail';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Edit from '@lucide/svelte/icons/edit';
	import Plus from '@lucide/svelte/icons/plus';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	let providers = $state<NotificationProviderWithParsedConfig[]>([]);
	let loading = $state(true);
	let dialogOpen = $state(false);
	let editingProvider = $state<NotificationProviderWithParsedConfig | null>(null);
	let processing = $state(false);
	let testingEmail = $state(false);

	// Form state
	let formName = $state('');
	let formHost = $state('');
	let formPort = $state(587);
	let formSecure = $state(false);
	let formUsername = $state('');
	let formPassword = $state('');
	let formFrom = $state('');
	let formFromName = $state('');
	let formIsEnabled = $state(true);
	let formIsDefault = $state(false);
	let testEmail = $state('');

	onMount(async () => {
		await loadProviders();
	});

	async function loadProviders() {
		try {
			loading = true;
			const result = await providerService.getProviders();
			console.log('Loaded providers:', result);
			providers = result;
		} catch (error) {
			toast.error('Failed to load notification providers');
			console.error(error);
		} finally {
			loading = false;
		}
	}

	function openCreateDialog() {
		editingProvider = null;
		resetForm();
		dialogOpen = true;
	}

	function openEditDialog(provider: NotificationProviderWithParsedConfig) {
		editingProvider = provider;
		const config = provider.config as EmailProviderConfig;
		formName = provider.name;
		formHost = config.host;
		formPort = config.port;
		formSecure = config.secure;
		formUsername = config.auth.user;
		formPassword = ''; // Don't pre-fill password for security
		formFrom = config.from;
		formFromName = config.fromName || '';
		formIsEnabled = provider.isEnabled;
		formIsDefault = provider.isDefault;
		testEmail = config.auth.user;
		dialogOpen = true;
	}

	function resetForm() {
		formName = '';
		formHost = '';
		formPort = 587;
		formSecure = false;
		formUsername = '';
		formPassword = '';
		formFrom = '';
		formFromName = '';
		formIsEnabled = true;
		formIsDefault = false;
		testEmail = '';
	}

	async function handleSave() {
		try {
			processing = true;

			const config: EmailProviderConfig = {
				host: formHost,
				port: formPort,
				secure: formSecure,
				auth: {
					user: formUsername,
					pass: formPassword
				},
				from: formFrom,
				fromName: formFromName || undefined
			};

			const providerData: CreateNotificationProvider = {
				name: formName,
				type: 'email',
				config: { type: 'email' as const, ...config },
				isEnabled: formIsEnabled,
				isDefault: formIsDefault
			};

			if (editingProvider) {
				// Only include password if it was changed
				if (!formPassword) {
					const existingConfig = editingProvider.config as EmailProviderConfig;
					config.auth.pass = existingConfig.auth.pass;
				}
				const result = await providerService.updateProvider(editingProvider.id, {
					name: formName,
					config: { type: 'email' as const, ...config },
					isEnabled: formIsEnabled,
					isDefault: formIsDefault
				});
				console.log('Provider updated:', result);
				toast.success('Provider updated successfully');
			} else {
				const result = await providerService.createProvider(providerData);
				console.log('Provider created:', result);
				toast.success('Provider created successfully');
			}

			dialogOpen = false;
			await loadProviders();
		} catch (error: any) {
			toast.error(error.message || 'Failed to save provider');
			console.error(error);
		} finally {
			processing = false;
		}
	}

	async function handleDelete(provider: NotificationProviderWithParsedConfig) {
		if (!confirm(`Are you sure you want to delete "${provider.name}"?`)) {
			return;
		}

		try {
			await providerService.deleteProvider(provider.id);
			toast.success('Provider deleted successfully');
			await loadProviders();
		} catch (error) {
			toast.error('Failed to delete provider');
			console.error(error);
		}
	}

	async function handleTestEmail() {
		if (!testEmail) {
			toast.error('Please enter a test email address');
			return;
		}

		try {
			testingEmail = true;

			const config: EmailProviderConfig = {
				host: formHost,
				port: formPort,
				secure: formSecure,
				auth: {
					user: formUsername,
					pass: formPassword
				},
				from: formFrom,
				fromName: formFromName || undefined
			};

			const result = await providerService.testEmailProvider(config, testEmail);

			if (result.success) {
				toast.success('Test email sent successfully!');
			} else {
				toast.error(`Failed to send test email: ${result.error}`);
			}
		} catch (error: any) {
			toast.error(error.message || 'Failed to send test email');
			console.error(error);
		} finally {
			testingEmail = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h3 class="text-lg font-semibold">Notification Providers</h3>
			<p class="text-muted-foreground text-sm">
				Configure email and other notification providers for sending alerts
			</p>
		</div>
		<Button onclick={openCreateDialog} size="sm">
			<Plus class="mr-2 h-4 w-4" />
			Add Provider
		</Button>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin" />
		</div>
	{:else if providers.length === 0}
		<Card.Root class="border-dashed">
			<Card.Content class="flex flex-col items-center justify-center py-12">
				<Mail class="text-muted-foreground mb-4 h-12 w-12" />
				<p class="text-muted-foreground mb-4 text-center">
					No notification providers configured yet
				</p>
				<Button onclick={openCreateDialog} size="sm">
					<Plus class="mr-2 h-4 w-4" />
					Add Your First Provider
				</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid gap-4 md:grid-cols-2">
			{#each providers as provider (provider.id)}
				{@const config = provider.config as EmailProviderConfig}
				<Card.Root>
					<Card.Header>
						<div class="flex items-start justify-between">
							<div class="flex items-center gap-2">
								<Mail class="h-5 w-5" />
								<div>
									<Card.Title class="text-base">{provider.name}</Card.Title>
									<Card.Description class="text-xs">
										{config.host}:{config.port}
									</Card.Description>
								</div>
							</div>
							<div class="flex gap-2">
								{#if provider.isDefault}
									<span
										class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"
									>
										Default
									</span>
								{/if}
								{#if provider.isEnabled}
									<Check class="h-5 w-5 text-green-600" />
								{:else}
									<X class="h-5 w-5 text-red-600" />
								{/if}
							</div>
						</div>
					</Card.Header>
					<Card.Content>
						<div class="space-y-2 text-sm">
							<div>
								<span class="text-muted-foreground">From:</span>
								<span class="ml-2 font-medium">
									{config.fromName ? `${config.fromName} <${config.from}>` : config.from}
								</span>
							</div>
							<div>
								<span class="text-muted-foreground">Username:</span>
								<span class="ml-2 font-medium">{config.auth.user}</span>
							</div>
							<div>
								<span class="text-muted-foreground">Security:</span>
								<span class="ml-2 font-medium">{config.secure ? 'SSL/TLS' : 'None'}</span>
							</div>
						</div>
					</Card.Content>
					<Card.Footer class="flex justify-end gap-2">
						<Button variant="outline" size="sm" onclick={() => openEditDialog(provider)}>
							<Edit class="mr-2 h-4 w-4" />
							Edit
						</Button>
						<Button variant="destructive" size="sm" onclick={() => handleDelete(provider)}>
							<Trash2 class="mr-2 h-4 w-4" />
							Delete
						</Button>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-150">
		<Dialog.Header>
			<Dialog.Title>
				{editingProvider ? 'Edit' : 'Add'} Email Provider
			</Dialog.Title>
			<Dialog.Description>
				Configure your SMTP email server for sending notifications
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<!-- Provider Name -->
			<div class="space-y-2">
				<Label>Provider Name</Label>
				<Input bind:value={formName} placeholder="My Email Provider" />
			</div>

			<!-- SMTP Settings -->
			<div class="border-border space-y-4 rounded-lg border p-4">
				<h4 class="text-sm font-semibold">SMTP Server Settings</h4>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label>Host</Label>
						<Input bind:value={formHost} placeholder="smtp.gmail.com" />
					</div>

					<div class="space-y-2">
						<Label>Port</Label>
						<Input bind:value={formPort} type="number" placeholder="587" />
					</div>
				</div>

				<div class="flex items-center justify-between">
					<div class="space-y-0.5">
						<Label>Use SSL/TLS</Label>
						<p class="text-muted-foreground text-xs">Enable secure connection</p>
					</div>
					<Checkbox bind:checked={formSecure} />
				</div>
			</div>

			<!-- Authentication -->
			<div class="border-border space-y-4 rounded-lg border p-4">
				<h4 class="text-sm font-semibold">Authentication</h4>

				<div class="space-y-2">
					<Label>Username / Email</Label>
					<Input bind:value={formUsername} type="email" placeholder="your@email.com" />
				</div>

				<div class="space-y-2">
					<Label>Password {editingProvider ? '(leave blank to keep current)' : ''}</Label>
					<Input bind:value={formPassword} type="password" placeholder="••••••••" />
				</div>
			</div>

			<!-- Sender Settings -->
			<div class="border-border space-y-4 rounded-lg border p-4">
				<h4 class="text-sm font-semibold">Sender Information</h4>

				<div class="space-y-2">
					<Label>From Email</Label>
					<Input bind:value={formFrom} type="email" placeholder="noreply@example.com" />
				</div>

				<div class="space-y-2">
					<Label>From Name (Optional)</Label>
					<Input bind:value={formFromName} placeholder="Tracktor Notifications" />
				</div>
			</div>

			<!-- Provider Settings -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<div class="space-y-0.5">
						<Label>Enable Provider</Label>
						<p class="text-muted-foreground text-xs">Allow this provider to send notifications</p>
					</div>
					<Checkbox bind:checked={formIsEnabled} />
				</div>

				<div class="flex items-center justify-between">
					<div class="space-y-0.5">
						<Label>Set as Default</Label>
						<p class="text-muted-foreground text-xs">Use this provider by default</p>
					</div>
					<Checkbox bind:checked={formIsDefault} />
				</div>
			</div>

			<!-- Test Email -->
			<div class="border-border space-y-4 rounded-lg border p-4">
				<h4 class="text-sm font-semibold">Test Configuration</h4>
				<div class="space-y-2">
					<Label>Test Email Address</Label>
					<div class="flex gap-2">
						<Input
							bind:value={testEmail}
							type="email"
							placeholder="test@example.com"
							class="flex-1"
						/>
						<Button
							onclick={handleTestEmail}
							variant="outline"
							disabled={testingEmail || !testEmail}
						>
							{#if testingEmail}
								<Loader2 class="h-4 w-4 animate-spin" />
							{:else}
								Send Test
							{/if}
						</Button>
					</div>
					<p class="text-muted-foreground text-xs">
						Send a test email to verify your configuration
					</p>
				</div>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (dialogOpen = false)} disabled={processing}>
				Cancel
			</Button>
			<Button onclick={handleSave} disabled={processing}>
				{#if processing}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				{editingProvider ? 'Update' : 'Create'} Provider
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
