import { ServiceError, Status } from "./ServiceError";

export class FuelLogError extends ServiceError {
  constructor(message: string, status = Status.INTERNAL_SERVER_ERROR) {
    super(FuelLogError.name, message, status);
  }
}
