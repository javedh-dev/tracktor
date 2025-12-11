import { logger } from '@config/index';
import { AppError, Status } from '@exceptions/AppError';
import { AppValidationError } from '@exceptions/AppValidationError';
import type { ApiResponse } from '@tracktor/common';
import type { Request, Response, NextFunction } from 'express';

const errorHandler = (err: Error, req: Request, res: Response, _: NextFunction) => {
	logger.error(`Error in ${req.method} - ${req.path}`, err);

	res.setHeader('Content-Type', 'application/json');

	let statusCode = 500;
	let body: ApiResponse;

	switch (err.name) {
		case 'AppValidationError':
			statusCode = Status.BAD_REQUEST;
			body = {
				success: false,
				errors: (err as AppValidationError).errors as any,
				message: err.message
			};
			break;
		case 'AppError':
			statusCode = (err as AppError).status;
			body = {
				success: false,
				errors: [err],
				message: err.message
			};
			break;
		default:
			body = {
				success: false,
				errors: [err],
				message: err.message
			};
	}

	res.status(statusCode).json(body);
};

export default errorHandler;
