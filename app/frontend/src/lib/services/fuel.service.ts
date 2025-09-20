import { getApiUrl } from '$lib/helper/api';
import type { FuelLog } from '$lib/types/fuel';
import type { Response } from '$lib/types';

export const saveFuelLog = async (fuelLog: FuelLog): Promise<Response<FuelLog>> => {
	const res: Response<FuelLog> = { status: 'OK' };
	try {
		const response = await fetch(
			getApiUrl(`/api/vehicles/${fuelLog.vehicleId}/fuel-logs/${fuelLog.id || ''}`),
			{
				method: `${fuelLog.id ? 'PUT' : 'POST'}`,
				headers: {
					'Content-Type': 'application/json',
					'X-User-PIN': localStorage.getItem('userPin') || ''
				},
				body: JSON.stringify(fuelLog)
			}
		);
		if (response.ok) {
			res.data = await response.json();
		} else {
			res.status = 'ERROR';
			const data = await response.json();
			res.error = (data.message as string) || 'Failed to save fuel log.';
		}
	} catch (e) {
		res.status = 'ERROR';
		res.error = 'Error while saving fuel log : ' + e;
	}
	return res;
};

export const deleteFuelLog = async (fuelLog: FuelLog): Promise<Response<string>> => {
	const res: Response<string> = { status: 'OK' };
	try {
		const response = await fetch(
			getApiUrl(`/api/vehicles/${fuelLog.vehicleId}/fuel-logs/${fuelLog.id}`),
			{
				method: 'DELETE',
				headers: {
					'X-User-PIN': localStorage.getItem('userPin') || ''
				}
			}
		);
		if (response.ok) {
			res.data = await response.json();
		} else {
			res.status = 'ERROR';
			const data = await response.json();
			res.error = (data.message as string) || 'Failed to delete vehicle.';
		}
	} catch (e) {
		res.status = 'ERROR';
		res.error = 'Error while deleting fuel log : ' + e;
	}
	return res;
};
