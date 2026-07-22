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
