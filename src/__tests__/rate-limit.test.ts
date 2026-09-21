import { describe, it, expect } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { handleRateLimit } from '../server/middlewares/rate-limit';

// Exercises the real handleRateLimit middleware (not a reimplementation) against a minimal
// fake RequestEvent/resolve pair — no SvelteKit server or DB needed, since the middleware
// only reads event.request.method, event.url.pathname, the x-forwarded-for header and
// event.getClientAddress().

function makeEvent(opts: { method?: string; pathname?: string; ip: string }): RequestEvent {
  const { method = 'POST', pathname = '/api/auth', ip } = opts;

  return {
    request: new Request(`http://localhost${pathname}`, { method }),
    url: new URL(`http://localhost${pathname}`),
    getClientAddress: () => ip
  } as unknown as RequestEvent;
}

function resolveWith(status: number) {
  return async () => new Response(null, { status });
}

describe('handleRateLimit (fix for missing brute-force protection on auth endpoints)', () => {
  it('returns 429 with Retry-After on the 11th failed attempt within the window, from the same IP', async () => {
    const ip = '203.0.113.10';

    for (let i = 0; i < 10; i++) {
      const response = await handleRateLimit({
        event: makeEvent({ ip }),
        resolve: resolveWith(401)
      } as Parameters<typeof handleRateLimit>[0]);
      expect(response.status).toBe(401);
    }

    const blocked = await handleRateLimit({
      event: makeEvent({ ip }),
      resolve: resolveWith(401)
    } as Parameters<typeof handleRateLimit>[0]);

    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBeTruthy();
    expect(Number(blocked.headers.get('Retry-After'))).toBeGreaterThan(0);

    const body = await blocked.json();
    expect(body.success).toBe(false);
  });

  it('does not block a different IP once the first IP is rate-limited', async () => {
    const blockedIp = '203.0.113.11';
    const freshIp = '203.0.113.12';

    for (let i = 0; i < 11; i++) {
      await handleRateLimit({
        event: makeEvent({ ip: blockedIp }),
        resolve: resolveWith(401)
      } as Parameters<typeof handleRateLimit>[0]);
    }

    const response = await handleRateLimit({
      event: makeEvent({ ip: freshIp }),
      resolve: resolveWith(401)
    } as Parameters<typeof handleRateLimit>[0]);

    expect(response.status).toBe(401);
  });

  it('resets the failure counter after a successful response', async () => {
    const ip = '203.0.113.13';

    for (let i = 0; i < 9; i++) {
      await handleRateLimit({
        event: makeEvent({ ip }),
        resolve: resolveWith(401)
      } as Parameters<typeof handleRateLimit>[0]);
    }

    // A successful login on the 10th attempt should reset the counter to zero.
    const success = await handleRateLimit({
      event: makeEvent({ ip }),
      resolve: resolveWith(200)
    } as Parameters<typeof handleRateLimit>[0]);
    expect(success.status).toBe(200);

    // 10 more failures should be tolerated before another 429, since the counter was reset.
    for (let i = 0; i < 10; i++) {
      const response = await handleRateLimit({
        event: makeEvent({ ip }),
        resolve: resolveWith(401)
      } as Parameters<typeof handleRateLimit>[0]);
      expect(response.status).toBe(401);
    }

    const blocked = await handleRateLimit({
      event: makeEvent({ ip }),
      resolve: resolveWith(401)
    } as Parameters<typeof handleRateLimit>[0]);
    expect(blocked.status).toBe(429);
  });

  it('does not rate-limit paths outside the auth endpoints, even after many failures', async () => {
    const ip = '203.0.113.14';

    for (let i = 0; i < 20; i++) {
      const response = await handleRateLimit({
        event: makeEvent({ ip, pathname: '/api/vehicles' }),
        resolve: resolveWith(500)
      } as Parameters<typeof handleRateLimit>[0]);
      expect(response.status).toBe(500);
    }
  });

  it('does not rate-limit GET requests to the auth endpoints', async () => {
    const ip = '203.0.113.15';

    for (let i = 0; i < 20; i++) {
      const response = await handleRateLimit({
        event: makeEvent({ ip, method: 'GET' }),
        resolve: resolveWith(401)
      } as Parameters<typeof handleRateLimit>[0]);
      expect(response.status).toBe(401);
    }
  });

  it('tracks /api/auth and /api/auth/register independently for the same IP', async () => {
    const ip = '203.0.113.16';

    for (let i = 0; i < 10; i++) {
      await handleRateLimit({
        event: makeEvent({ ip, pathname: '/api/auth' }),
        resolve: resolveWith(401)
      } as Parameters<typeof handleRateLimit>[0]);
    }

    const loginBlocked = await handleRateLimit({
      event: makeEvent({ ip, pathname: '/api/auth' }),
      resolve: resolveWith(401)
    } as Parameters<typeof handleRateLimit>[0]);
    expect(loginBlocked.status).toBe(429);

    // The register endpoint has its own counter, so it should still be open for this IP.
    const registerStillOpen = await handleRateLimit({
      event: makeEvent({ ip, pathname: '/api/auth/register' }),
      resolve: resolveWith(401)
    } as Parameters<typeof handleRateLimit>[0]);
    expect(registerStillOpen.status).toBe(401);
  });
});
