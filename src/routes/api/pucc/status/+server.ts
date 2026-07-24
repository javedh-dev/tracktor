import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$server/db/index';

export const GET: RequestHandler = async () => {
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Get all vehicles with their latest PUC certificate
  const vehicles = await db.query.vehicleTable.findMany({
    columns: { id: true, make: true, model: true, licensePlate: true, image: true }
  });

  // Get all PUC certificates
  const allCerts = await db.query.pollutionCertificateTable.findMany({
    columns: { vehicleId: true, certificateNumber: true, issueDate: true, expiryDate: true }
  });

  // Get latest cert per vehicle
  const latestCerts = new Map<string, (typeof allCerts)[0]>();
  for (const cert of allCerts) {
    const existing = latestCerts.get(cert.vehicleId);
    if (
      !existing ||
      (cert.expiryDate &&
        existing.expiryDate &&
        new Date(cert.expiryDate) > new Date(existing.expiryDate))
    ) {
      latestCerts.set(cert.vehicleId, cert);
    }
  }

  const records = vehicles.map((vehicle) => {
    const cert = latestCerts.get(vehicle.id);
    let status: 'valid' | 'expiring_soon' | 'expired' | 'not_available';

    if (!cert || !cert.expiryDate) {
      status = 'not_available';
    } else {
      const expiryDate = new Date(cert.expiryDate);
      if (expiryDate < today) {
        status = 'expired';
      } else if (expiryDate <= thirtyDaysFromNow) {
        status = 'expiring_soon';
      } else {
        status = 'valid';
      }
    }

    return {
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.make} ${vehicle.model}`,
      licensePlate: vehicle.licensePlate,
      certificateNumber: cert?.certificateNumber ?? null,
      expiryDate: cert?.expiryDate ?? null,
      status
    };
  });

  return json({ success: true, data: records });
};
