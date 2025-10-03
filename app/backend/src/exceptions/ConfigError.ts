import { ServiceError, Status } from "./ServiceError";

export class ConfigError extends ServiceError {
  constructor(message: string, status = Status.INTERNAL_SERVER_ERROR) {
    super(ConfigError.name, message, status);
  }
}
