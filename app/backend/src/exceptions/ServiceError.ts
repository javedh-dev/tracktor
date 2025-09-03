import { UniqueConstraintError, ValidationError } from "sequelize";

export enum Status {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export class ServiceError extends Error {
  status: Status;
  constructor(name: string, message: string, status: Status) {
    super(message);
    this.name = name;
    this.status = status;
  }
}

export const statusFromError = (error: Error) => {
  if (error instanceof ServiceError) return error.status;
  if (error instanceof ValidationError) return Status.BAD_REQUEST;
  if (error instanceof UniqueConstraintError) return Status.CONFLICT;
  return Status.INTERNAL_SERVER_ERROR;
};
