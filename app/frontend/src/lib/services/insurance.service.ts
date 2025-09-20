import { getApiUrl } from '$lib/helper/api';
import type { Response } from '$lib/types';
import type { Insurance } from '$lib/types/insurance';

export const saveInsurance = async (insurance: Insurance): Promise<Response<Insurance>> => {
	const res: Response<Insurance> = { status: 'OK' };
	try {
		const response = await fetch(
			getApiUrl(`/api/vehicles/${insurance.vehicleId}/insurance/${insurance.id || ''}`),
			{
				method: `${insurance.id ? 'PUT' : 'POST'}`,
				headers: {
					'Content-Type': 'application/json',
					'X-User-PIN': localStorage.getItem('userPin') || ''
				},
				body: JSON.stringify(insurance)
			}
		);
		if (response.ok) {
			res.data = await response.json();
		} else {
			res.status = 'ERROR';
			const data = await response.json();
			res.error = (data.message as string) || 'Failed to save insurance.';
		}
	} catch (e) {
		res.status = 'ERROR';
		res.error = 'Error while saving insurance : ' + e;
	}
	return res;
};

export const deleteInsurance = async (insurance: Insurance): Promise<Response<string>> => {
	const res: Response<string> = { status: 'OK' };
	try {
		const response = await fetch(
			getApiUrl(`/api/vehicles/${insurance.vehicleId}/insurance/${insurance.id}`),
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
			res.error = (data.message as string) || 'Failed to delete insurance.';
		}
	} catch (e) {
		res.status = 'ERROR';
		res.error = 'Error while deleting insurance : ' + e;
	}
	return res;
};
