import type { ValidationError } from 'express-validator';
import { Status, AppError } from './AppError';

export class AppValidationError extends AppError {
	errors: ValidationError[];
	constructor(errors: ValidationError[]) {
		super('Validation Failed', Status.BAD_REQUEST, 'AppValidationError');
		this.errors = errors;
	}
}
