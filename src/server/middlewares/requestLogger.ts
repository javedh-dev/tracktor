import { env, logger } from '@config/index';
import type { NextFunction, Request, Response } from 'express';

const requestLogger = (req: Request, _: Response, next: NextFunction) => {
	if (env.LOG_REQUESTS) {
		let message = `${req.method} ${req.originalUrl} - IP: ${req.ip} `;
		if (req.body) message += `- Body: ${JSON.stringify(req.body, null, 2)}`;

		logger.info(message);
	}
	next();
};

export default requestLogger;
