export enum Status {
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	NOT_FOUND = 404,
	CONFLICT = 409,
	INTERNAL_SERVER_ERROR = 500
}

export class AppError extends Error {
	status: Status;
	name: string;
	constructor(message: string, status: Status, name: string = 'AppError') {
		super(message);
		this.name = name;
		this.status = status;
	}
}

export const statusFromError = (error: Error) => {
	if (error instanceof AppError) return error.status;

	// Handle Drizzle/SQLite specific errors
	if (error.message.includes('UNIQUE constraint failed')) {
		return Status.CONFLICT;
	}

	// Handle validation errors
	if (error.name === 'ValidationError' || error.name === 'AppValidationError') {
		return Status.BAD_REQUEST;
	}

	return Status.INTERNAL_SERVER_ERROR;
};
