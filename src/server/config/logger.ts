import { env } from '$lib/config/env.server';
import winston from 'winston';

const logFormatter = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.errors({ stack: true }),
	winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
		let logMessage = `${timestamp} [${level}]: ${message}`;

		// Add stack trace on new lines if present
		if (stack) {
			logMessage += '\n' + stack;
		}

		// Add any remaining metadata
		const metaKeys = Object.keys(meta);
		if (metaKeys.length > 0) {
			logMessage += '\n' + JSON.stringify(meta, null, 2);
		}

		return logMessage;
	})
);

const transports: winston.transport[] = [
	new winston.transports.File({
		dirname: env.LOG_DIR || './logs',
		filename: `tracktor.log`
	})
];

if (env.NODE_ENV !== 'test') {
	transports.push(
		new winston.transports.Console({
			format: winston.format.combine(winston.format.colorize(), logFormatter)
		})
	);
}

const logger = winston.createLogger({
	level: env.LOG_LEVEL || 'info',
	exitOnError: false,
	format: logFormatter,
	transports
});

logger.info(`Winston logger configured with ${transports.length} transports`);

export default logger;
