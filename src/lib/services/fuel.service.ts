import type { FuelLog, Response } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import { uploadFile } from './file.service';

export const saveFuelLogWithAttachment = async (
	fuelLog: FuelLog,
	attachment: File | undefined
): Promise<Response<FuelLog>> => {
	if (attachment) {
		try {
			const res = await uploadFile(attachment);
			fuelLog.attachment = res.data.filename || null;
		} catch (e: any) {
			return {
				status: 'ERROR',
				error: e.response?.data?.message || 'Failed to upload attachment'
			};
		}
	}
	return saveFuelLog(fuelLog);
};

export const saveFuelLog = async (fuelLog: FuelLog): Promise<Response<FuelLog>> => {
	const res: Response<FuelLog> = { status: 'OK' };
	try {
		const method = fuelLog.id ? 'PUT' : 'POST';
		const url = `/vehicles/${fuelLog.vehicleId}/fuel-logs/${fuelLog.id || ''}`;

		const response = await apiClient[method.toLowerCase() as 'put' | 'post'](url, fuelLog);
		res.data = response.data;
	} catch (e: any) {
		res.status = 'ERROR';
		res.error = e.response?.data?.message || 'Failed to save fuel log.';
	}
	return res;
};

export const deleteFuelLog = async (fuelLog: FuelLog): Promise<Response<string>> => {
	const res: Response<string> = { status: 'OK' };
	try {
		const response = await apiClient.delete(
			`/vehicles/${fuelLog.vehicleId}/fuel-logs/${fuelLog.id}`
		);
		res.data = response.data;
	} catch (e: any) {
		res.status = 'ERROR';
		res.error = e.response?.data?.message || 'Failed to delete fuel log.';
	}
	return res;
};
