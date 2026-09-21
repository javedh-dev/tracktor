import type { Handle } from '@sveltejs/kit';
import { errorResponse } from './cors';
import { Status } from '$server/exceptions/AppError';
import { getClientAddress } from './logging';

// Basic per-IP brute-force guard for the two unauthenticated auth endpoints. Tracktor is a
// single-process, SQLite-backed app (the DB itself only supports one writer), so an in-memory
// counter is sufficient here — it does not need to survive a restart or be shared across
// replicas, because this app doesn't run as replicas.
//
// Known limitation, stated rather than hidden: the counter is keyed by IP alone, so it is
// trivially bypassed by an attacker who rotates source IPs (e.g. behind a botnet or many
// proxies). That's out of scope for a "basic" guard — its job is to stop naive single-source
// brute forcing, not a distributed attacker. If Tracktor is deployed behind a reverse proxy,
// TRACKTOR_TRUST_PROXY-style IP resolution already happens in getClientAddress (x-forwarded-for);
// without a trusted proxy in front, a client can spoof that header to reset their own limit —
// an accepted tradeoff of trusting XFF the same way handleLogging already does.

const WINDOW_MS = 60_000;
const MAX_FAILURES = 10;
const RATE_LIMITED_PATHS = new Set(['/api/auth', '/api/auth/register']);

type LimiterEntry = {
  failures: number;
  windowStart: number;
};

const attempts = new Map<string, LimiterEntry>();

// Bounds memory against many distinct attacker IPs without needing a background timer: once
// the map grows past a threshold, piggy-back a full sweep of expired entries onto the next
// request instead of letting it grow forever.
const SWEEP_THRESHOLD = 500;

function sweepExpired(now: number): void {
  if (attempts.size < SWEEP_THRESHOLD) return;

  for (const [key, entry] of attempts) {
    if (now - entry.windowStart > WINDOW_MS) {
      attempts.delete(key);
    }
  }
}

export const handleRateLimit: Handle = async ({ event, resolve }) => {
  if (event.request.method !== 'POST' || !RATE_LIMITED_PATHS.has(event.url.pathname)) {
    return resolve(event);
  }

  const now = Date.now();
  sweepExpired(now);

  const key = `${getClientAddress(event)}:${event.url.pathname}`;
  let entry = attempts.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    entry = { failures: 0, windowStart: now };
    attempts.set(key, entry);
  }

  if (entry.failures >= MAX_FAILURES) {
    const retryAfterSeconds = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000);
    const response = errorResponse(
      'Too many failed attempts. Please try again later.',
      Status.TOO_MANY_REQUESTS,
      event.request
    );
    response.headers.set('Retry-After', String(Math.max(retryAfterSeconds, 1)));
    return response;
  }

  const response = await resolve(event);

  // Only failed attempts count toward the limit, so a user who mistypes a few times and then
  // succeeds is never blocked by their own eventual success.
  if (response.status >= 400) {
    entry.failures += 1;
  } else {
    entry.failures = 0;
  }

  return response;
};
