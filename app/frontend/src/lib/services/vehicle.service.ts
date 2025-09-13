import { getApiUrl } from '$lib/helper/api';
import type { DataPoint } from '$lib/types';

export const fetchMileageData = async (vehicleId: string): Promise<DataPoint[]> => {
	let mileageData: DataPoint[] = [];
	try {
		const response = await fetch(getApiUrl(`/api/vehicles/${vehicleId}/fuel-logs`), {
			headers: {
				'X-User-PIN': localStorage.getItem('userPin') || ''
			}
		});
		if (response.ok) {
			const data: {
				date: string;
				mileage: number | null;
			}[] = await response.json();
			mileageData = data
				.filter((log) => log.mileage != null)
				.map((log) => {
					return {
						x: new Date(log.date),
						y: log.mileage
					};
				})
				.sort((a, b) => a.x.getTime() - b.x.getTime());
		} else {
			console.error('Failed to fetch chart data');
		}
	} catch (e) {
		console.error('Failed to connect to the server.', e);
	}
	return mileageData;
};

export const fetchCostData = async (vehicleId: string): Promise<DataPoint[]> => {
	let costData: DataPoint[] = [];
	try {
		const response = await fetch(getApiUrl(`/api/vehicles/${vehicleId}/fuel-logs`), {
			headers: {
				'X-User-PIN': localStorage.getItem('userPin') || ''
			}
		});
		if (response.ok) {
			const data: {
				date: string;
				cost: number | null;
			}[] = await response.json();
			costData = data
				.filter((log) => log.cost != null)
				.map((log) => {
					return {
						x: new Date(log.date),
						y: log.cost
					};
				})
				.sort((a, b) => a.x.getTime() - b.x.getTime());
		} else {
			console.error('Failed to fetch chart data');
		}
	} catch (e) {
		console.error('Failed to connect to the server.', e);
	}
	return costData;
};
