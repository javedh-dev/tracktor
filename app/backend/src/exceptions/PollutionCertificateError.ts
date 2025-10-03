import { ServiceError, Status } from "./ServiceError";

export class PollutionCertificateError extends ServiceError {
  constructor(message: string, status = Status.INTERNAL_SERVER_ERROR) {
    super(PollutionCertificateError.name, message, status);
  }
}
