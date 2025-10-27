import winston from "winston";

const logFormatter = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ""
    }`;
  }),
);

const transports: winston.transport[] = [
  new winston.transports.File({
    filename: `${process.env.LOG_DIR || "./logs"}/tracktor.log`,
  }),
];

if (process.env.NODE_ENV !== "test") {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormatter),
    }),
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  exitOnError: false,
  format: logFormatter,
  transports,
});

export default logger;
