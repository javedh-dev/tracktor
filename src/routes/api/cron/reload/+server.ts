import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { reloadCronJobs } from '$server/services/cronService';
import logger from '$server/config/logger';

export const POST: RequestHandler = async () => {
	try {
		logger.info('Received request to reload cron jobs');
		await reloadCronJobs();
		return json({ success: true, message: 'Cron jobs reloaded successfully' });
	} catch (error) {
		logger.error('Failed to reload cron jobs:', error);
		return json({ success: false, message: 'Failed to reload cron jobs' }, { status: 500 });
	}
};
