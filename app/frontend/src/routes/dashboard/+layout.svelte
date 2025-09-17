<script lang="ts">
	import FuelForm from '$lib/components/features/fuel/FuelForm.svelte';
	import MaintenanceForm from '$lib/components/features/maintenance/MaintenanceForm.svelte';
	import VehicleForm from '$lib/components/features/vehicle/VehicleForm.svelte';
	import PollutionCertificateForm from '$lib/components/features/pollution/PollutionCertificateForm.svelte';
	import InsuranceForm from '$lib/components/features/insurance/InsuranceForm.svelte';
	import ConfigSheet from '$lib/components/features/settings/SettingsSheet.svelte';

	let { children } = $props();
</script>

<main>
	{@render children()}
</main>

<VehicleForm />
<FuelForm />
<MaintenanceForm />
<InsuranceForm />
<PollutionCertificateForm />
<ConfigSheet />
