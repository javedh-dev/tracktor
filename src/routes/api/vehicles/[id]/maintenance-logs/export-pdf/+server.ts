import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import * as maintenanceLogService from '$server/services/maintenanceLogService';
import * as vehicleService from '$server/services/vehicleService';
import { generateMaintenanceLogsPdf } from '$server/services/maintenanceLogPdfService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Maintenance logs PDF export error:', async () => {
    const { id: vehicleId } = event.params;

    if (!vehicleId) {
      throw error(400, 'Vehicle ID is required');
    }

    const vehicle = await vehicleService.getVehicleById(vehicleId);

    const maintenanceLogs = await maintenanceLogService.getMaintenanceLogs(vehicleId);

    const vehicleLabel =
      [vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'Unknown Vehicle';
    const safePlate = vehicle.licensePlate
      ? vehicle.licensePlate.replace(/[^a-zA-Z0-9]/g, '-')
      : 'vehicle';

    const pdfBuffer: Buffer = await generateMaintenanceLogsPdf(maintenanceLogs, {
      licensePlate: vehicle.licensePlate,
      label: vehicleLabel
    });

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="maintenance-log-${safePlate}.pdf"`
      }
    });
  });
};
