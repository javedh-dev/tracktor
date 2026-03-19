import path from 'path';

import { serverEnv } from '$lib/config/env.server';
import { AppError, Status } from '$server/exceptions/AppError';

const DEFAULT_UPLOADS_DIR = './uploads';

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.txt': 'text/plain',
  '.webp': 'image/webp'
};

export function sanitizeUploadFilename(filename: string): string {
  return `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
}

export function assertSafeUploadFilename(filename: string): void {
  if (!filename) {
    throw new AppError('Filename is required', Status.BAD_REQUEST);
  }

  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new AppError('Invalid filename', Status.BAD_REQUEST);
  }
}

export function resolveUploadFilePath(filename: string): string {
  return path.join(serverEnv.UPLOADS_DIR || DEFAULT_UPLOADS_DIR, filename);
}

export function getContentTypeForFilename(filename: string): string {
  const extension = path.extname(filename).toLowerCase();

  return CONTENT_TYPE_BY_EXTENSION[extension] ?? 'application/octet-stream';
}
