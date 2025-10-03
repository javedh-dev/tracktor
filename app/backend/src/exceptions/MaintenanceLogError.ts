import { ServiceError, Status } from "./ServiceError";

export class MaintenanceLogError extends ServiceError {
  constructor(message: string, status = Status.INTERNAL_SERVER_ERROR) {
    super(MaintenanceLogError.name, message, status);
  }
}
