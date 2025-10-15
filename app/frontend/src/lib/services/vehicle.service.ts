import { getApiUrl } from '$lib/helper/api.helper';
import type { DataPoint, Response } from '$lib/types';
import type { Vehicle } from '$lib/types/vehicle';
import { uploadFile } from './file.service';

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

export const saveVehicleWithImage = async (
	vehicle: Vehicle,
	image: File | undefined,
	method: 'PUT' | 'POST'
): Promise<Response<Vehicle>> => {
	if (image) {
		const res = await uploadFile(image);
		if (res.status === 'OK') {
			vehicle.image = res.data || null;
		} else {
			return {
				status: 'ERROR',
				error: res.error
			};
		}
	}
	return saveVehicle(vehicle, method);
};

const saveVehicle = async (vehicle: Vehicle, method: 'PUT' | 'POST') => {
	const res: Response<Vehicle> = { status: 'OK' };
	try {
		const response = await fetch(getApiUrl(`/api/vehicles/`), {
			method,
			headers: {
				'Content-Type': 'application/json',
				'X-User-PIN': localStorage.getItem('userPin') || ''
			},
			body: JSON.stringify(vehicle)
		});

		if (response.ok) {
			res.data = await response.json();
		} else {
			res.status = 'ERROR';
			const data = await response.json();
			res.error = (data.message as string) || 'Failed to delete vehicle.';
		}
	} catch (e) {
		res.status = 'ERROR';
		res.error = 'Error while saving vehicle : ' + e;
	}
	return res;
};

export const deleteVehicle = async (vehicleId: string): Promise<Response<string>> => {
	const res: Response<string> = { status: 'OK' };
	try {
		const response = await fetch(getApiUrl(`/api/vehicles/${vehicleId}`), {
			method: 'DELETE',
			headers: {
				'X-User-PIN': localStorage.getItem('userPin') || ''
			}
		});
		if (response.ok) {
			res.data = vehicleId;
		} else {
			res.status = 'ERROR';
			const data = await response.json();
			res.error = (data.message as string) || 'Failed to delete vehicle.';
		}
	} catch (e) {
		res.status = 'ERROR';
		res.error = 'Error while saving vehicle : ' + e;
	}
	return res;
};
