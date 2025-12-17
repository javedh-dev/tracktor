<script lang="ts">
	import { vehicleStore } from '$stores/vehicle.svelte';
	import { insuranceStore } from '$stores/insurance.svelte';
	import { puccStore } from '$stores/pucc.svelte';
	import { differenceInDays, format } from 'date-fns';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import Clock from '@lucide/svelte/icons/clock';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import Shield from '@lucide/svelte/icons/shield';
	import BadgeInfo from '@lucide/svelte/icons/badge-info';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	let isLoading = $derived(insuranceStore.processing || puccStore.processing);

	interface Alert {
		type: 'insurance' | 'pucc';
		status: 'expired' | 'expiring' | 'valid';
		title: string;
		message: string;
		daysRemaining: number;
		expiryDate: Date;
	}

	let alerts = $state<Alert[]>([]);

	const calculateAlerts = () => {
		const newAlerts: Alert[] = [];
		const today = new Date();

		// Check insurance alerts
		if (insuranceStore.insurances && insuranceStore.insurances.length > 0) {
			const latestInsurance = insuranceStore.insurances.reduce((latest, current) => {
				return new Date(current.endDate) > new Date(latest.endDate) ? current : latest;
			});

			const expiryDate = new Date(latestInsurance.endDate);
			const daysRemaining = differenceInDays(expiryDate, today);

			let status: 'expired' | 'expiring' | 'valid';
			let message: string;

			if (daysRemaining < 0) {
				status = 'expired';
				message = `Insurance expired ${Math.abs(daysRemaining)} days ago`;
			} else if (daysRemaining <= 30) {
				status = 'expiring';
				message = `Insurance expires in ${daysRemaining} days`;
			} else {
				status = 'valid';
				message = `Insurance valid for ${daysRemaining} days`;
			}

			newAlerts.push({
				type: 'insurance',
				status,
				title: 'Insurance',
				message,
				daysRemaining,
				expiryDate
			});
		}

		// Check PUCC alerts
		if (puccStore.pollutionCerts && puccStore.pollutionCerts.length > 0) {
			const latestPucc = puccStore.pollutionCerts.reduce((latest, current) => {
				return new Date(current.expiryDate) > new Date(latest.expiryDate) ? current : latest;
			});

			const expiryDate = new Date(latestPucc.expiryDate);
			const daysRemaining = differenceInDays(expiryDate, today);

			let status: 'expired' | 'expiring' | 'valid';
			let message: string;

			if (daysRemaining < 0) {
				status = 'expired';
				message = `PUCC expired ${Math.abs(daysRemaining)} days ago`;
			} else if (daysRemaining <= 30) {
				status = 'expiring';
				message = `PUCC expires in ${daysRemaining} days`;
			} else {
				status = 'valid';
				message = `PUCC valid for ${daysRemaining} days`;
			}

			newAlerts.push({
				type: 'pucc',
				status,
				title: 'Pollution Certificate',
				message,
				daysRemaining,
				expiryDate
			});
		}

		alerts = newAlerts;
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'expired':
				return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800';
			case 'expiring':
				return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800';
			case 'valid':
				return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800';
			default:
				return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700';
		}
	};

	$effect(() => {
		const selectedId = vehicleStore.selectedId;
		if (!selectedId) {
			alerts = [];
			return;
		}
		insuranceStore.refreshInsurances();
		puccStore.refreshPuccs();
	});

	$effect(() => {
		calculateAlerts();
	});
</script>

<div class="bg-background/50 rounded-lg border border-gray-200 p-4 shadow-sm dark:border-gray-700">
	<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Vehicle Alerts</h3>

	{#if isLoading}
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			{#each [0, 1] as i (i)}
				<div class="rounded-lg border p-4">
					<div class="flex items-start justify-between">
						<div class="flex items-start gap-3">
							<Skeleton class="h-6 w-6 rounded" />
							<div class="flex-1 space-y-2">
								<Skeleton class="h-5 w-32" />
								<Skeleton class="h-4 w-40" />
							</div>
						</div>
						<div class="space-y-1 text-right">
							<Skeleton class="h-6 w-10" />
							<Skeleton class="h-3 w-16" />
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else if alerts.length === 0}
		<div class="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
			<LabelWithIcon
				icon={CheckCircle}
				label="No insurance or PUCC data available"
				iconClass="h-5 w-5"
			/>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			{#each alerts as alert (alert.type)}
				<div
					class="rounded-lg border p-4 {getStatusColor(
						alert.status
					)} transition-all hover:shadow-md"
				>
					<div class="flex items-start justify-between">
						<div class="flex items-start gap-3">
							<div class="shrink-0">
								{#if alert.type === 'insurance'}
									<Shield class="h-6 w-6" />
								{:else}
									<BadgeInfo class="h-6 w-6" />
								{/if}
							</div>
							<div class="flex-1">
								<div class="mb-1 flex items-center gap-2">
									<h4 class="font-semibold">{alert.title}</h4>
									{#if alert.status === 'expired'}
										<AlertTriangle class="h-4 w-4" />
									{:else if alert.status === 'expiring'}
										<Clock class="h-4 w-4" />
									{:else}
										<CheckCircle class="h-4 w-4" />
									{/if}
								</div>
								<!-- <p class="mb-1 text-sm font-medium">{alert.message}</p> -->
								<p class="text-xs opacity-75">
									Expires: {format(alert.expiryDate, 'MMM dd, yyyy')}
								</p>
								{#if alert.status === 'expiring' && alert.daysRemaining <= 7}
									<div class="mt-2 text-xs font-medium text-orange-700 dark:text-orange-300">
										⚠️ Urgent: Renewal required soon!
									</div>
								{:else if alert.status === 'expired'}
									<div class="mt-2 text-xs font-medium text-red-700 dark:text-red-300">
										🚨 Action Required: Renew immediately!
									</div>
								{/if}
							</div>
						</div>
						<div class="shrink-0 text-right">
							{#if alert.daysRemaining >= 0}
								<div class="text-lg font-bold text-gray-900 dark:text-gray-100">
									{alert.daysRemaining}
								</div>
								<div class="text-xs opacity-75">days left</div>
							{:else}
								<div class="text-lg font-bold text-gray-900 dark:text-gray-100">
									{Math.abs(alert.daysRemaining)}
								</div>
								<div class="text-xs opacity-75">days overdue</div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
