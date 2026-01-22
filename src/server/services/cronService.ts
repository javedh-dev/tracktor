import cron from 'node-cron';
import { logger } from '$server/config';
import type { ScheduledTask } from 'node-cron';

interface CronJobConfig {
	name: string;
	schedule: string; // Cron expression (e.g., '0 0 * * *' for daily at midnight)
	timezone?: string; // Timezone string (e.g., 'America/New_York')
	handler: () => Promise<void> | void;
	runOnInit?: boolean; // Run immediately on initialization
	onError?: (error: Error) => void;
}

interface RegisteredCronJob {
	name: string;
	task: ScheduledTask;
	schedule: string;
	timezone?: string;
}

class CronJobManager {
	private jobs: Map<string, RegisteredCronJob> = new Map();
	private initialized = false;

	/**
	 * Initialize the cron job manager
	 */
	public initialize(): void {
		if (this.initialized) {
			logger.warn('CronJobManager is already initialized');
			return;
		}
		this.initialized = true;
		logger.info('CronJobManager initialized');
	}

	public registerJob(config: CronJobConfig): void {
		if (!this.initialized) {
			throw new Error('CronJobManager must be initialized before registering jobs');
		}

		if (this.jobs.has(config.name)) {
			logger.warn(`Cron job "${config.name}" is already registered. Skipping...`);
			return;
		}

		try {
			const scheduleOptions = {
				scheduled: false,
				timezone: config.timezone
			};

			const task = cron.schedule(
				config.schedule,
				async () => {
					try {
						logger.info(`[CronJob] Starting: ${config.name}`);
						await config.handler();
						logger.info(`[CronJob] Completed: ${config.name}`);
					} catch (error) {
						const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
						logger.error(`[CronJob] Failed: ${config.name}`, {
							error: errorMsg,
							stack: error instanceof Error ? error.stack : undefined
						});

						if (config.onError) {
							config.onError(error instanceof Error ? error : new Error(String(error)));
						}
					}
				},
				scheduleOptions
			);

			this.jobs.set(config.name, {
				name: config.name,
				task,
				schedule: config.schedule,
				timezone: config.timezone
			});

			logger.info(
				`[CronJob] Registered: ${config.name} (${config.schedule})${config.timezone ? ` [${config.timezone}]` : ''}`
			);

			// Run immediately if configured
			if (config.runOnInit) {
				logger.info(`[CronJob] Running on init: ${config.name}`);
				Promise.resolve(config.handler())
					.then(() => {
						logger.info(`[CronJob] Init run completed: ${config.name}`);
					})
					.catch((error) => {
						const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
						logger.error(`[CronJob] Init run failed: ${config.name}`, {
							error: errorMsg,
							stack: error instanceof Error ? error.stack : undefined
						});

						if (config.onError) {
							config.onError(error instanceof Error ? error : new Error(String(error)));
						}
					});
			}

			// Start the cron task
			task.start();
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
			logger.error(`[CronJob] Failed to register "${config.name}":`, {
				error: errorMsg,
				stack: error instanceof Error ? error.stack : undefined
			});
			throw error;
		}
	}

	public getJob(name: string): RegisteredCronJob | undefined {
		return this.jobs.get(name);
	}

	public getAllJobs(): RegisteredCronJob[] {
		return Array.from(this.jobs.values());
	}

	public stopJob(name: string): boolean {
		const job = this.jobs.get(name);
		if (!job) {
			logger.warn(`Cron job "${name}" not found`);
			return false;
		}

		job.task.stop();
		logger.info(`[CronJob] Stopped: ${name}`);
		return true;
	}

	public startJob(name: string): boolean {
		const job = this.jobs.get(name);
		if (!job) {
			logger.warn(`Cron job "${name}" not found`);
			return false;
		}

		job.task.start();
		logger.info(`[CronJob] Started: ${name}`);
		return true;
	}

	public unregisterJob(name: string): boolean {
		const job = this.jobs.get(name);
		if (!job) {
			logger.warn(`Cron job "${name}" not found`);
			return false;
		}

		job.task.stop();
		job.task.destroy();
		this.jobs.delete(name);
		logger.info(`[CronJob] Unregistered: ${name}`);
		return true;
	}

	public stopAll(): void {
		logger.info('[CronJob] Stopping all cron jobs...');
		for (const [name, job] of this.jobs) {
			job.task.stop();
			logger.debug(`[CronJob] Stopped: ${name}`);
		}
		logger.info('[CronJob] All cron jobs stopped');
	}

	public destroyAll(): void {
		logger.info('[CronJob] Destroying all cron jobs...');
		for (const [name, job] of this.jobs) {
			job.task.stop();
			job.task.destroy();
			logger.debug(`[CronJob] Destroyed: ${name}`);
		}
		this.jobs.clear();
		logger.info('[CronJob] All cron jobs destroyed');
	}

	public getStats() {
		return {
			totalJobs: this.jobs.size,
			jobs: Array.from(this.jobs.values()).map((job) => ({
				name: job.name,
				schedule: job.schedule,
				timezone: job.timezone || 'default'
			}))
		};
	}
}

export const cronJobManager = new CronJobManager();

export type { CronJobConfig };
