import type { DataPoint, Response, Vehicle } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import { uploadFile } from './file.service';

export const fetchMileageData = async (vehicleId: string): Promise<DataPoint[]> => {
	try {
		const response = await apiClient.get(`/vehicles/${vehicleId}/fuel-logs`);
		const data: {
			date: string;
			mileage: number | null;
		}[] = response.data;
		return data
			.filter((log) => log.mileage != null)
			.map((log) => {
				return {
					x: new Date(log.date),
					y: log.mileage
				};
			})
			.sort((a, b) => a.x.getTime() - b.x.getTime());
	} catch (e) {
		console.error('Failed to fetch mileage data:', e);
		return [];
	}
};

export const fetchCostData = async (vehicleId: string): Promise<DataPoint[]> => {
	try {
		const response = await apiClient.get(`/vehicles/${vehicleId}/fuel-logs`);
		const data: {
			date: string;
			cost: number | null;
		}[] = response.data;
		return data
			.filter((log) => log.cost != null)
			.map((log) => {
				return {
					x: new Date(log.date),
					y: log.cost
				};
			})
			.sort((a, b) => a.x.getTime() - b.x.getTime());
	} catch (e) {
		console.error('Failed to fetch cost data:', e);
		return [];
	}
};

export const saveVehicleWithImage = async (
	vehicle: Vehicle,
	image: File | undefined,
	method: 'PUT' | 'POST'
): Promise<Response<Vehicle>> => {
	if (image) {
		try {
			const res = await uploadFile(image);
			vehicle.image = res.data.filename || null;
		} catch (e: any) {
			return {
				status: 'ERROR',
				error: e.response?.data?.message || 'Failed to upload image'
			};
		}
	}
	return saveVehicle(vehicle, method);
};

const saveVehicle = async (
	vehicle: Vehicle,
	method: 'PUT' | 'POST'
): Promise<Response<Vehicle>> => {
	const res: Response<Vehicle> = { status: 'OK' };
	try {
		const response = await apiClient[method.toLowerCase() as 'put' | 'post']('/vehicles/', vehicle);
		res.data = response.data;
	} catch (e: any) {
		res.status = 'ERROR';
		res.error = e.response?.data?.message || 'Failed to save vehicle.';
	}
	return res;
};

export const deleteVehicle = async (vehicleId: string): Promise<Response<string>> => {
	const res: Response<string> = { status: 'OK' };
	try {
		await apiClient.delete(`/vehicles/${vehicleId}`);
		res.data = vehicleId;
	} catch (e: any) {
		res.status = 'ERROR';
		res.error = e.response?.data?.message || 'Failed to delete vehicle.';
	}
	return res;
};
