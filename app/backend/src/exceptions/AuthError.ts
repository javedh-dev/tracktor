import { ServiceError, Status } from "./ServiceError";

export class AuthError extends ServiceError {
  constructor(message: string, status = Status.INTERNAL_SERVER_ERROR) {
    super(AuthError.name, message, status);
  }
}
