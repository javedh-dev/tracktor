<script lang="ts">
	import * as Card from '$ui/card';
	import Button from '$ui/button/button.svelte';
	import { Badge } from '$ui/badge';
	import Mail from '@lucide/svelte/icons/mail';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Bell from '@lucide/svelte/icons/bell';
	import Webhook from '@lucide/svelte/icons/webhook';
	import Edit from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Send from '@lucide/svelte/icons/send';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import type {
		NotificationProviderWithParsedConfig,
		NotificationProviderConfig
	} from '$lib/domain/notification-provider';

	interface Props {
		provider: NotificationProviderWithParsedConfig;
		onEdit?: (provider: NotificationProviderWithParsedConfig) => void;
		onDelete?: (provider: NotificationProviderWithParsedConfig) => void;
		onTest?: (provider: NotificationProviderWithParsedConfig) => void;
		testing?: boolean;
	}

	let { provider, onEdit, onDelete, onTest, testing = false }: Props = $props();

	const getProviderIcon = (type: string) => {
		switch (type) {
			case 'email':
				return Mail;
			case 'sms':
				return MessageSquare;
			case 'push':
				return Bell;
			case 'webhook':
				return Webhook;
			default:
				return Mail;
		}
	};

	const getProviderDetails = () => {
		const config: NotificationProviderConfig = provider.config;
		switch (config.type) {
			case 'email': {
				return {
					primary: `${config.host}:${config.port}`,
					secondary: config.secure ? 'SSL/TLS' : 'No SSL',
					from: config.fromName ? `${config.fromName} <${config.from}>` : config.from,
					extra: config.replyTo ? `Reply-to: ${config.replyTo}` : null
				};
			}
			case 'sms': {
				return {
					primary: config.provider.toUpperCase(),
					secondary: config.fromNumber,
					from: config.fromNumber,
					extra: null
				};
			}
			case 'push': {
				return {
					primary: config.provider.toUpperCase(),
					secondary: config.appId || 'No App ID',
					from: config.appId || 'N/A',
					extra: null
				};
			}
			case 'webhook': {
				return {
					primary: new URL(config.url).hostname,
					secondary: config.method,
					from: config.url,
					extra: config.authType !== 'none' ? `Auth: ${config.authType}` : null
				};
			}
			default:
				return {
					primary: 'Unknown',
					secondary: '',
					from: '',
					extra: null
				};
		}
	};

	const details = $derived(getProviderDetails());
	const ProviderIcon = $derived(getProviderIcon(provider.type));
</script>

<Card.Root class="hover:border-primary/50 transition-colors">
	<Card.Content class="pt-6">
		<div class="flex items-start justify-between gap-4">
			<div class="flex min-w-0 flex-1 items-start gap-3">
				<div class="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
					<ProviderIcon class="h-5 w-5" />
				</div>

				<div class="min-w-0 flex-1">
					<div class="mb-1 flex items-center gap-2">
						<h3 class="truncate font-semibold">{provider.name}</h3>
						{#if provider.isDefault}
							<Badge variant="default" class="shrink-0">Default</Badge>
						{/if}
						{#if !provider.isEnabled}
							<Badge variant="outline" class="shrink-0">Disabled</Badge>
						{/if}
					</div>

					<div class="text-muted-foreground space-y-1 text-sm">
						<p class="truncate">{details.primary}</p>
						<p class="truncate text-xs">From: {details.from}</p>
						{#if details.extra}
							<p class="truncate text-xs">{details.extra}</p>
						{/if}
					</div>
				</div>
			</div>

			<div class="flex shrink-0 gap-1">
				{#if onTest}
					<Button
						variant="ghost"
						size="icon"
						onclick={() => onTest?.(provider)}
						disabled={testing || !provider.isEnabled}
						title="Test provider"
					>
						{#if testing}
							<Loader2 class="h-4 w-4 animate-spin" />
						{:else}
							<Send class="h-4 w-4" />
						{/if}
					</Button>
				{/if}

				{#if onEdit}
					<Button
						variant="ghost"
						size="icon"
						onclick={() => onEdit?.(provider)}
						title="Edit provider"
					>
						<Edit class="h-4 w-4" />
					</Button>
				{/if}

				{#if onDelete}
					<Button
						variant="ghost"
						size="icon"
						onclick={() => onDelete?.(provider)}
						title="Delete provider"
					>
						<Trash2 class="h-4 w-4" />
					</Button>
				{/if}
			</div>
		</div>
	</Card.Content>
</Card.Root>
