import packageInfo from '../../../package.json';
import { env } from '$lib/config/env.server';

export const packageVersion = packageInfo.version;

export const appVersion = env.APP_VERSION || packageVersion;
