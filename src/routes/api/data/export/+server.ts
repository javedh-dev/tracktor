import { json } from '@sveltejs/kit';
import { db } from '$server/db';
import * as schema from '$server/db/schema';
import { encrypt } from '$server/services/crypto.service';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { encrypt: shouldEncrypt, password } = await request.json();

        // Export all tables
        const exportData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            encrypted: shouldEncrypt,
            data: {
                vehicles: await db.select().from(schema.vehicleTable),
                fuelLogs: await db.select().from(schema.fuelLogTable),
                maintenanceLogs: await db.select().from(schema.maintenanceLogTable),
                insurances: await db.select().from(schema.insuranceTable),
                puccs: await db.select().from(schema.pollutionCertificateTable),
                configs: await db.select().from(schema.configTable),
                users: await db.select().from(schema.usersTable),
                sessions: await db.select().from(schema.sessionsTable)
            }
        };

        let finalData: any = exportData;

        if (shouldEncrypt && password) {
            const encryptedData = await encrypt(JSON.stringify(exportData.data), password);
            finalData = {
                ...exportData,
                data: encryptedData
            };
        }

        return json({
            success: true,
            data: finalData
        });
    } catch (error) {
        console.error('Export error:', error);
        return json(
            {
                success: false,
                message: 'Failed to export data'
            },
            { status: 500 }
        );
    }
};