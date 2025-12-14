import type { Response, MaintenanceLog } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import { uploadFile } from './file.service';

export const saveMaintenanceLogWithAttachment = async (
	maintenanceLog: MaintenanceLog,
	attachment: File | undefined
): Promise<Response<MaintenanceLog>> => {
	if (attachment) {
		try {
			const res = await uploadFile(attachment);
			maintenanceLog.attachment = res.data.filename || null;
		} catch (e: any) {
			return {
				status: 'ERROR',
				error: e.response?.data?.message || 'Failed to upload attachment'
			};
		}
	}
	return saveMaintenanceLog(maintenanceLog);
};

export const saveMaintenanceLog = async (
	maintenanceLog: MaintenanceLog
): Promise<Response<MaintenanceLog>> => {
	const res: Response<MaintenanceLog> = { status: 'OK' };
	try {
		const method = maintenanceLog.id ? 'PUT' : 'POST';
		const url = `/vehicles/${maintenanceLog.vehicleId}/maintenance-logs/${maintenanceLog.id || ''}`;

		const response = await apiClient[method.toLowerCase() as 'put' | 'post'](url, maintenanceLog);
		res.data = response.data;
	} catch (e: any) {
		res.status = 'ERROR';
		res.error = e.response?.data?.message || 'Failed to save maintenance log.';
	}
	return res;
};

export const deleteMaintenanceLog = async (
	maintenanceLog: MaintenanceLog
): Promise<Response<string>> => {
	const res: Response<string> = { status: 'OK' };
	try {
		const response = await apiClient.delete(
			`/vehicles/${maintenanceLog.vehicleId}/maintenance-logs/${maintenanceLog.id}`
		);
		res.data = response.data;
	} catch (e: any) {
		res.status = 'ERROR';
		res.error = e.response?.data?.message || 'Failed to delete maintenance log.';
	}
	return res;
};
