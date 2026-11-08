import { beforeEach, expect, it, vi } from 'vitest';

const login = vi.hoisted(() => vi.fn());
vi.mock('$server/services/authService', () => ({ loginUser: login }));
vi.mock('$lib/config/env.server', () => ({ env: { HTTP_MODE: 'http' } }));
vi.mock('$server/config/logger', () => ({ default: { error: vi.fn() } }));
import { POST } from '../routes/api/auth/+server';
import { AppError, Status } from '$server/exceptions/AppError';

beforeEach(() => {
  login.mockReset();
});

it('throttles the real login route before password verification for unknown users', async () => {
  login.mockRejectedValue(new AppError('Invalid username or password', Status.UNAUTHORIZED));
  const event = () => ({
    request: new Request('http://localhost/api/auth', {
      method: 'POST',
      body: JSON.stringify({ username: 'nonexistent', password: 'wrong' })
    }),
    getClientAddress: () => '192.0.2.123',
    cookies: { set: vi.fn() }
  });
  for (let i = 0; i < 5; i++)
    await expect(POST(event() as any)).rejects.toMatchObject({ status: 401 });
  const response = await POST(event() as any);
  expect(response.status).toBe(429);
  expect(response.headers.get('Retry-After')).toBe('1');
  expect(login).toHaveBeenCalledTimes(5);
  expect(await response.json()).toEqual({
    success: false,
    message: 'Too many login attempts. Please try again later.'
  });
});
