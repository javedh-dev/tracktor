import { derived } from 'svelte/store';
import { fuelLogStore } from './fuelLogStore';
import type { DataPoint } from '$lib/types';
import type { FuelLog } from '$lib/types/fuel';

type ChartDataStore = {
	mileageData?: DataPoint[];
	costData?: DataPoint[];
};

const createChartDataStore = () => {
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

	const { subscribe } = derived(
		fuelLogStore,
		($fuelLogData): ChartDataStore => ({
			mileageData: calculateMileageData($fuelLogData.fuelLogs),
			costData: calculateCostData($fuelLogData.fuelLogs)
		})
	);

	return { subscribe };
};

export const chartDataStore = createChartDataStore();
