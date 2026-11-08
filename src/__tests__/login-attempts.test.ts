import { expect, it } from 'vitest';
import { LoginAttempts } from '$server/services/login-attempts';

it('reserves attempts before authentication, throttles and expires (#261)', () => {
  let now = 1000;
  const attempts = new LoginAttempts(() => now);
  for (let i = 0; i < 5; i++) expect(attempts.reserve('ip', 'owner')).toBe(0);
  expect(attempts.reserve('ip', 'owner')).toBe(1);
  now += 1000;
  expect(attempts.reserve('ip', 'owner')).toBe(0);
  expect(attempts.reserve('ip', 'owner')).toBe(2);
  now += 15 * 60 * 1000;
  expect(attempts.reserve('ip', 'owner')).toBe(0);
});

it('limits password spraying across usernames and resets successful account counters', () => {
  const attempts = new LoginAttempts(() => 1000);
  for (let i = 0; i < 30; i++) expect(attempts.reserve('ip', `user${i}`)).toBe(0);
  attempts.succeed('user29');
  expect(attempts.reserve('ip', 'new-user')).toBe(1);
  expect(attempts.reserve('other-ip', 'owner')).toBe(0);
  for (let i = 0; i < 4; i++) attempts.reserve('other-ip', 'owner');
  attempts.succeed('owner');
  expect(attempts.reserve('other-ip', 'owner')).toBe(0);
});

it('does not evict active lockouts when its bounded store fills', () => {
  const attempts = new LoginAttempts(() => 1000, 2);
  expect(attempts.reserve('ip', 'owner')).toBe(0);
  expect(attempts.reserve('other-ip', 'other-user')).toBe(60);
});
