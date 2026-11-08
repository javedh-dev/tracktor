import { expect, it, vi } from 'vitest';
import { sessionCookieOptions } from '$server/utils/session-cookie';

vi.mock('$server/services/authService', () => ({
  loginUser: vi.fn(async () => ({ sessionToken: 'test-token', user: { id: 'user' } })),
  logoutUser: vi.fn()
}));
vi.mock('$lib/config/env.server', () => ({ env: { HTTP_MODE: 'http' } }));
vi.mock('$server/config/logger', () => ({ default: { error: vi.fn() } }));
import { POST, DELETE } from '../routes/api/auth/+server';

it.each([
  ['https://tracktor.example/api/auth', 'http', true],
  ['http://localhost/api/auth', 'http', false],
  ['http://localhost/api/auth', 'https', true]
])('selects secure cookies for %s with mode %s', (url, mode, secure) => {
  expect(sessionCookieOptions(new URL(url), mode)).toEqual({
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 2592000
  });
});

it('applies the same policy on the actual login and logout routes', async () => {
  const cookies = { set: vi.fn(), get: vi.fn(() => undefined) };
  const url = new URL('https://tracktor.example/api/auth');
  await POST({
    url,
    cookies,
    request: new Request(url, {
      method: 'POST',
      body: JSON.stringify({ username: 'owner', password: 'password' })
    })
  } as any);
  expect(cookies.set).toHaveBeenLastCalledWith(
    'session',
    'test-token',
    expect.objectContaining({ secure: true, httpOnly: true, maxAge: 2592000 })
  );
  await DELETE({ url, cookies } as any);
  expect(cookies.set).toHaveBeenLastCalledWith(
    'session',
    '',
    expect.objectContaining({ path: '/', secure: true, httpOnly: true, sameSite: 'lax', maxAge: 0 })
  );
});
