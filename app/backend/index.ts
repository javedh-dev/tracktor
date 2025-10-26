import app, { start } from "./src/app";
import { appAsciiArt, logger } from "@config/index";

console.log(logger.transports.length);

logger.info(appAsciiArt);
start(app);
