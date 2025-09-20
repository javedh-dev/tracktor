import { parseDate } from '$lib/helper/formatting';
import { z } from 'zod/v4';

export interface PollutionCertificate {
	id: string | null;
	vehicleId: string;
	certificateNumber: string;
	issueDate: Date;
	expiryDate: Date;
	testingCenter: string;
	notes: string | null;
}

export const pollutionCertificateSchema = z.object({
	id: z.string().nullable(),
	vehicleId: z.uuid(),
	certificateNumber: z
		.string()
		.min(2, 'It must be more than 1 character.')
		.max(50, 'It must be less than 50 characters.'),
	issueDate: z.string().refine((val) => {
		try {
			parseDate(val);
			return true;
		} catch {
			return false;
		}
	}, 'Invalid date format'),
	expiryDate: z.string().refine((val) => {
		try {
			parseDate(val);
			return true;
		} catch {
			return false;
		}
	}, 'Invalid date format'),
	testingCenter: z
		.string()
		.min(2, 'It must be more than 1 character.')
		.max(100, 'It must be less than 100 characters.'),
	notes: z.string().nullable()
});

export type PollutionCertificateSchema = typeof pollutionCertificateSchema;
