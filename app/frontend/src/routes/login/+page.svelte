<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import PinInput from '$components/auth/PinInput.svelte';
	import ThemeToggle from '$components/common/ThemeToggle.svelte';
	import { env } from '$env/dynamic/public';
	import { ShieldEllipsis, ShieldPlus, Tractor } from '@lucide/svelte';
	import { Jumper } from 'svelte-loading-spinners';
	import { simulateNetworkDelay } from '$lib/utils/dev';
	import StatusBlock from '$components/common/StatusBlock.svelte';
	import type { Status } from '$lib/models/status';

	let loading = $state(false);
	let status = $state<Status>({
		message: undefined,
		type: 'INFO'
	});
	let pinExists = $state(false);
	let checkingPinStatus = $state(true);

	$effect(() => {
		if (browser) {
			async function checkPinStatus() {
				try {
					const response = await fetch(
						`${env.PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/pin/status`
					);
					if (response.ok) {
						const data = await response.json();
						pinExists = data.exists;
					} else {
						status = {
							message: 'Failed to check PIN status.',
							type: 'ERROR'
						};
					}
				} catch (e) {
					status = {
						message: 'Unknown Server Error Occurred.',
						type: 'ERROR'
					};
				} finally {
					checkingPinStatus = false;
				}
			}
			checkPinStatus();
			const localPin = localStorage.getItem('userPin');
			if (localPin) {
				endpointCall(localPin, true);
				return;
			}
		}
	});

	async function handlePinComplete(pin: string) {
		loading = true;
		status.message = '';
		await simulateNetworkDelay(1000); // Simulate network delay for development
		try {
			await endpointCall(pin, pinExists);
		} catch (e) {
			status = {
				message: 'Failed to connect to the server. Please check your connection.',
				type: 'ERROR'
			};
		} finally {
			loading = false;
		}
	}

	const endpointCall = async (pin: string, verify = true) => {
		const endpoint = verify ? '/api/pin/verify' : '/api/pin';
		const response = await fetch(
			`${env.PUBLIC_API_BASE_URL || 'http://localhost:3000'}${endpoint}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ pin })
			}
		);

		if (response.ok) {
			// Store PIN and redirect
			if (browser) {
				localStorage.setItem('userPin', pin);
			}
			loading = false;
			status = {
				message: 'PIN Verified Successfully',
				type: 'SUCCESS'
			};
			await simulateNetworkDelay(1000);
			goto('/dashboard', { replaceState: true });
		} else {
			const data = await response.json();
			status = {
				message:
					data.message || (pinExists ? 'Invalid PIN. Please try again.' : 'Failed to set PIN.'),
				type: 'ERROR'
			};
		}
	};
</script>

<div
	class="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 transition-colors dark:bg-gray-900"
>
	<div class="absolute top-4 right-4">
		<ThemeToggle />
	</div>
	<div
		class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
	>
		<div class="mb-6">
			<h1
				class="flex items-center justify-center gap-5 text-center text-3xl font-bold text-gray-800 dark:text-gray-100"
			>
				<Tractor class="h-10 w-10"></Tractor> Welcome
			</h1>
		</div>

		{#if checkingPinStatus}
			<p class="mb-6 text-center text-gray-600 dark:text-gray-300">Checking PIN status...</p>
		{:else if pinExists}
			<p
				class="mb-6 flex items-center justify-center gap-2 text-center text-gray-600 dark:text-gray-300"
			>
				<ShieldEllipsis class="h-8 w-8" />
				Enter your 6-digit PIN to access Tracktor
			</p>
		{:else}
			<p
				class="mb-6 flex items-center justify-center gap-2 text-center text-gray-600 dark:text-gray-300"
			>
				<ShieldPlus class="h-8 w-8" />
				Set your 6-digit PIN for Tracktor
			</p>
		{/if}

		{#if !checkingPinStatus}
			<PinInput complete={(pin: string) => handlePinComplete(pin)} />
		{/if}

		{#if loading}
			<p
				class="mt-4 flex items-center justify-center text-center font-semibold text-blue-600 dark:text-blue-400"
			>
				<Jumper size="40" color="#155dfc" unit="px" duration="2s" />
			</p>
		{/if}
		<StatusBlock message={status.message} type={status.type} />
	</div>
</div>
