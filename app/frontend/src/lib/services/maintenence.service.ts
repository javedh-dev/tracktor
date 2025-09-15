import { getApiUrl } from '$lib/helper/api';
import type { Response } from '$lib/types';
import type { MaintenanceLog } from '$lib/types/maintenance';

export const saveMaintenanceLog = async (
	maintenanceLog: MaintenanceLog
): Promise<Response<MaintenanceLog>> => {
	const res: Response<MaintenanceLog> = { status: 'OK' };
	try {
		const response = await fetch(
			getApiUrl(
				`/api/vehicles/${maintenanceLog.vehicleId}/maintenance-logs/${maintenanceLog.id || ''}`
			),
			{
				method: `${maintenanceLog.id ? 'PUT' : 'POST'}`,
				headers: {
					'Content-Type': 'application/json',
					'X-User-PIN': localStorage.getItem('userPin') || ''
				},
				body: JSON.stringify(maintenanceLog)
			}
		);
		if (response.ok) {
			res.data = await response.json();
		} else {
			res.status = 'ERROR';
			const data = await response.json();
			res.error = (data.message as string) || 'Failed to save maintenance log.';
		}
	} catch (e) {
		res.status = 'ERROR';
		res.error = 'Error while saving maintenance log : ' + e;
	}
	return res;
};
