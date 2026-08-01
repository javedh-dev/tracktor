import { appendFile } from 'fs/promises';
import path from 'path';
import { env } from '$lib/config/env.server';

const LEVELS = ['error', 'warn', 'info', 'debug'] as const;
type Level = (typeof LEVELS)[number];

const threshold = LEVELS.indexOf((env.LOG_LEVEL as Level) || 'info');
const logFile = path.join(env.LOG_DIR || './logs', 'tracktor.log');

function format(level: Level, message: unknown, meta: unknown[]): string {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const details = meta
    .map((item) =>
      item instanceof Error ? (item.stack ?? item.message) : JSON.stringify(item, null, 2)
    )
    .filter(Boolean);

  return [`${timestamp} [${level}]: ${message}`, ...details].join('\n');
}

function log(level: Level, message: unknown, ...meta: unknown[]): void {
  if (LEVELS.indexOf(level) > threshold) return;

  const line = format(level, message, meta);

  if (env.NODE_ENV !== 'test') {
    console[level === 'debug' ? 'log' : level](line);
  }
  // Fire and forget: a failed log write must never take a request down with it.
  void appendFile(logFile, `${line}\n`).catch(() => {});
}

const logger = {
  error: (message: unknown, ...meta: unknown[]) => log('error', message, ...meta),
  warn: (message: unknown, ...meta: unknown[]) => log('warn', message, ...meta),
  info: (message: unknown, ...meta: unknown[]) => log('info', message, ...meta),
  debug: (message: unknown, ...meta: unknown[]) => log('debug', message, ...meta)
};

export default logger;
