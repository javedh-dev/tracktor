import type { DataPoint, FuelLog } from '$lib/domain';
import { fuelLogStore } from './fuel-log.svelte';

const calculateCostData = (logs: FuelLog[]) => {
	return logs
		.filter((log) => log.cost)
		.map((log) => {
			return {
				x: new Date(log.date),
				y: log.cost
			};
		})
		.sort((a, b) => a.x.getTime() - b.x.getTime());
};

const calculateMileageData = (logs: FuelLog[]) => {
	return logs
		.filter((log) => log.mileage)
		.map((log) => {
			return {
				x: new Date(log.date),
				y: log.mileage || 0
			};
		})
		.sort((a, b) => a.x.getTime() - b.x.getTime());
};

class ChartStore {
	mileageData? = $derived<DataPoint[]>(calculateMileageData(fuelLogStore.fuelLogs || []));
	costData? = $derived<DataPoint[]>(calculateCostData(fuelLogStore.fuelLogs || []));
}

export const chartStore = new ChartStore();
