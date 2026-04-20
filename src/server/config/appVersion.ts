import { execFileSync } from 'node:child_process';
import packageInfo from '../../../package.json';
import { env } from '$lib/config/env.server';

export const packageVersion = packageInfo.version;

function getBranchName() {
  try {
    const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();

    if (!branch || branch === 'HEAD') {
      return 'unknown';
    }

    return branch;
  } catch {
    return 'unknown';
  }
}

export const appVersion = env.NODE_ENV === 'production' ? packageVersion : getBranchName();
