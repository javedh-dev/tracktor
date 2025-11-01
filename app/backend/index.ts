import app, { start } from "./src/app";
import { appAsciiArt, logger } from "@config/index";

logger.info(appAsciiArt);
start(app);
