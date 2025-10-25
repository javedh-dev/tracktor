import type { Response, Insurance } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';

export const saveInsurance = async (insurance: Insurance): Promise<Response<Insurance>> => {
	const res: Response<Insurance> = { status: 'OK' };
	try {
		const method = insurance.id ? 'PUT' : 'POST';
		const url = `/vehicles/${insurance.vehicleId}/insurance/${insurance.id || ''}`;

		const response = await apiClient[method.toLowerCase() as 'put' | 'post'](url, insurance);
		res.data = response.data;
	} catch (e: any) {
		res.status = 'ERROR';
		res.error = e.response?.data?.message || 'Failed to save insurance.';
	}
	return res;
};

export const deleteInsurance = async (insurance: Insurance): Promise<Response<string>> => {
	const res: Response<string> = { status: 'OK' };
	try {
		const response = await apiClient.delete(`/vehicles/${insurance.vehicleId}/insurance/${insurance.id}`);
		res.data = response.data;
	} catch (e: any) {
		res.status = 'ERROR';
		res.error = e.response?.data?.message || 'Failed to delete insurance.';
	}
	return res;
};
