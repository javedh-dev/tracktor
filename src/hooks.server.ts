import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import type { Handle, HandleServerError } from '@sveltejs/kit';

import { handleCors } from '$server/middlewares/cors';
import { handleAuth } from '$server/middlewares/auth';
import { handleLogging } from '$server/middlewares/logging';
import { initializeDatabase } from '$server/db/init';
import { appAsciiArt, appVersion, logger } from '$server/config';
import { env } from '$lib/config/env.server';
import { getTextDirection } from '$lib/utils';
import { ensureAppDirectories } from '$server/utils/fs';
import { initializeNotificationScheduler } from '$server/services/notificationSchedulerService';

const envSnapshot = () => ({
  APP_VERSION: appVersion,
  LOG_LEVEL: env.LOG_LEVEL,
  LOG_DIR: env.LOG_DIR,
  NODE_ENV: env.NODE_ENV,
  DB_PATH: env.DB_PATH,
  DEMO_MODE: env.DEMO_MODE,
  FORCE_DATA_SEED: env.FORCE_DATA_SEED
});

const logEnvSnapshot = () => {
  const snapshot = envSnapshot();

  Object.entries(snapshot).forEach(([key, value]) => logger.info(`${key}: ${String(value)}`));
};

let dbInitialized = false;

const initPromise = (async () => {
  if (dbInitialized) return;

  try {
    logger.info(appAsciiArt);
    logger.info(`Starting Tracktor v${appVersion}`);
    logEnvSnapshot();
  } catch (error) {
    logger.error('Failed to log startup banner', error);
  }

  try {
    await ensureAppDirectories();
  } catch (error) {
    logger.error('Failed to create required application directories', error);

    const wrapped = new Error('Failed to create required application directories');

    (wrapped as any).cause = error;

    throw wrapped;
  }

  try {
    await initializeDatabase();
    dbInitialized = true;
    logger.info('Database initialization completed');
  } catch (error) {
    logger.error('Failed to initialize database', error);

    const wrapped = new Error('Failed to initialize database');

    (wrapped as any).cause = error;

    throw wrapped;
  }

  try {
    await initializeNotificationScheduler();
    logger.info('Notification scheduler initialization completed');
  } catch (error) {
    logger.error('Failed to initialize notification scheduler', error);
    // Don't throw - scheduler is not critical for app startup
  }
})();

export const handleError: HandleServerError = async ({ error, event }) => {
  logger.error(`Error in ${event.request.method} - ${event.url.pathname}`, error);

  return { message: error instanceof Error ? error.message : 'Internal server error' };
};

const handleInit: Handle = async ({ event, resolve }) => {
  await initPromise;

  return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) =>
        html
          .replace('%paraglide.lang%', locale)
          .replace('dir="%paraglide.lang%"', `dir="${getTextDirection(locale)}"`)
    });
  });

export const handle = sequence(handleInit, handleCors, handleAuth, handleLogging, handleParaglide);
