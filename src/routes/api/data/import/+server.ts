import { json } from '@sveltejs/kit';
import { db } from '$server/db';
import * as schema from '$server/db/schema';
import { decrypt } from '$server/services/crypto.service';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { data: importData, password } = await request.json();

		if (!importData || typeof importData !== 'object') {
			return json(
				{
					success: false,
					message: 'Invalid import data format'
				},
				{ status: 400 }
			);
		}

		let dataToImport = importData.data;

		// Handle encrypted data
		if (importData.encrypted) {
			if (!password) {
				return json(
					{
						success: false,
						message: 'Password required for encrypted data'
					},
					{ status: 400 }
				);
			}

			try {
				const decryptedData = await decrypt(dataToImport, password);
				dataToImport = JSON.parse(decryptedData);
			} catch (error) {
				return json(
					{
						success: false,
						message: 'Failed to decrypt data. Check your password.'
					},
					{ status: 400 }
				);
			}
		}

		// Validate data structure
		if (!dataToImport || typeof dataToImport !== 'object') {
			return json(
				{
					success: false,
					message: 'Invalid data structure'
				},
				{ status: 400 }
			);
		}

		// Start transaction to import data
		await db.transaction(async (tx) => {
			// Clear existing data (in reverse order of dependencies)
			await tx.delete(schema.sessionsTable);
			await tx.delete(schema.pollutionCertificateTable);
			await tx.delete(schema.insuranceTable);
			await tx.delete(schema.maintenanceLogTable);
			await tx.delete(schema.fuelLogTable);
			await tx.delete(schema.vehicleTable);
			await tx.delete(schema.usersTable);
			// Keep configs as they might be system-specific

			// Import data (in order of dependencies)
			if (dataToImport.users?.length) {
				await tx.insert(schema.usersTable).values(dataToImport.users);
			}

			if (dataToImport.vehicles?.length) {
				await tx.insert(schema.vehicleTable).values(dataToImport.vehicles);
			}

			if (dataToImport.fuelLogs?.length) {
				await tx.insert(schema.fuelLogTable).values(dataToImport.fuelLogs);
			}

			if (dataToImport.maintenanceLogs?.length) {
				await tx.insert(schema.maintenanceLogTable).values(dataToImport.maintenanceLogs);
			}

			if (dataToImport.insurances?.length) {
				await tx.insert(schema.insuranceTable).values(dataToImport.insurances);
			}

			if (dataToImport.puccs?.length) {
				await tx.insert(schema.pollutionCertificateTable).values(dataToImport.puccs);
			}

			if (dataToImport.sessions?.length) {
				await tx.insert(schema.sessionsTable).values(dataToImport.sessions);
			}

			// Optionally import configs (commented out to preserve system configs)
			// if (dataToImport.configs?.length) {
			//   await tx.delete(schema.configTable);
			//   await tx.insert(schema.configTable).values(dataToImport.configs);
			// }
		});

		return json({
			success: true,
			message: 'Data imported successfully'
		});
	} catch (error) {
		console.error('Import error:', error);
		return json(
			{
				success: false,
				message: 'Failed to import data'
			},
			{ status: 500 }
		);
	}
};
