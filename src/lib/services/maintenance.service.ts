import type { Response, MaintenanceLog } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import { uploadFile } from './file.service';

export const saveMaintenanceLogWithAttachment = async (
	maintenanceLog: MaintenanceLog,
	attachment: File | undefined,
	removeExisting: boolean = false
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
	// Handle existing attachment removal
	if (removeExisting) {
		maintenanceLog.attachment = null;
	}
	// If no new attachment and this is an update (has id) and not removing existing, don't modify attachment field
	// This preserves existing attachment when editing without uploading new file
	else if (!attachment && maintenanceLog.id) {
		// Remove attachment from the payload to avoid overwriting existing value
		const { attachment: _, ...maintenanceLogWithoutAttachment } = maintenanceLog;
		return saveMaintenanceLog(maintenanceLogWithoutAttachment as MaintenanceLog);
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
