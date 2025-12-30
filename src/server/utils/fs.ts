import { constants } from 'fs';
import { access, mkdir, stat } from 'fs/promises';
import path from 'path';
import { logger } from '$server/config';
import { serverEnv } from '$lib/config/env.server';

export type EnsureAppDirectoriesOptions = {
	uploadsDir?: string;
	dataDir?: string;
};

/**
 * Ensures a directory exists and is actually a directory.
 * If it does not exist, it is created recursively.
 * Throws if the path exists but is not a directory, or if creation fails.
 */
export async function ensureDirectoryExists(dirPath: string, label?: string): Promise<void> {
	const resolvedPath = path.resolve(dirPath);
	const name = label || resolvedPath;

	try {
		await access(resolvedPath, constants.F_OK);
		const stats = await stat(resolvedPath);
		if (!stats.isDirectory()) {
			throw new Error(`Path exists but is not a directory: ${resolvedPath}`);
		}
		logger.info(`Directory exists: ${name} (${resolvedPath})`);
	} catch (accessErr) {
		try {
			await mkdir(resolvedPath, { recursive: true });
			logger.info(`Created directory: ${name} (${resolvedPath})`);
		} catch (mkdirErr) {
			logger.error(`Failed to create directory: ${name}`, {
				path: resolvedPath,
				error: mkdirErr
			});
			throw mkdirErr instanceof Error ? mkdirErr : new Error(String(mkdirErr));
		}
	}
}

/**
 * Ensures the application-required directories exist (uploads and data).
 * Logs creation events and throws if any directory cannot be created,
 * allowing the caller to stop the application.
 */
export async function ensureAppDirectories(
	options: EnsureAppDirectoriesOptions = {}
): Promise<void> {
	const uploadsDir = options.uploadsDir ?? serverEnv.UPLOADS_DIR ?? './uploads';
	const logDir = serverEnv.LOG_DIR ?? './logs';
	const dataDir = options.dataDir ?? path.dirname(serverEnv.DB_PATH ?? './tracktor.db');

	try {
		await Promise.all([
			ensureDirectoryExists(uploadsDir, 'uploads'),
			ensureDirectoryExists(logDir, 'logs'),
			ensureDirectoryExists(dataDir, 'data')
		]);
	} catch (error) {
		logger.error(
			'Required directories are missing and could not be created. Stopping application.',
			{ error }
		);
		throw error;
	}
}
