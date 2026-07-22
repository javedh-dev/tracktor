import type { MaintenanceLog } from '$lib/domain';
import { createEntityService } from './entity-service';
import { apiClient } from '$lib/helper/api.helper';

const {
  save,
  saveWithAttachment,
  delete: remove
} = createEntityService<MaintenanceLog>({
  basePath: 'maintenance-logs'
});

export const saveMaintenanceLog = save;
export const saveMaintenanceLogWithAttachment = saveWithAttachment;
export const deleteMaintenanceLog = remove;

export const exportMaintenanceLogsPdf = async (vehicleId: string): Promise<void> => {
  const response = await apiClient.get(`/vehicles/${vehicleId}/maintenance-logs/export-pdf`, {
    responseType: 'blob'
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `maintenance-log-${vehicleId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
