type Attempt = { count: number; expiresAt: number; blockedUntil: number };
const WINDOW_MS = 15 * 60 * 1000;

/** Process-local protection. Multi-instance deployments also need a shared proxy limit. */
export class LoginAttempts {
  private attempts = new Map<string, Attempt>();

  constructor(
    private now = Date.now,
    private maxEntries = 10000
  ) {}

  reserve(address: string, username: string): number {
    const now = this.now();
    for (const [key, attempt] of this.attempts) {
      if (attempt.expiresAt <= now) this.attempts.delete(key);
    }

    const keys = [`ip:${address}`, `user:${username.trim().toLowerCase()}`];
    const retryAt = Math.max(...keys.map((key) => this.attempts.get(key)?.blockedUntil ?? 0));
    if (retryAt > now) return Math.ceil((retryAt - now) / 1000);
    const missing = keys.filter((key) => !this.attempts.has(key)).length;
    if (this.attempts.size + missing > this.maxEntries) return 60;

    keys.forEach((key, index) => {
      const attempt = this.attempts.get(key) ?? {
        count: 0,
        expiresAt: now + WINDOW_MS,
        blockedUntil: 0
      };
      attempt.count++;
      const threshold = index === 0 ? 30 : 5;
      if (attempt.count >= threshold) {
        attempt.blockedUntil = Math.min(
          attempt.expiresAt,
          now + Math.min(60000, 1000 * 2 ** Math.min(attempt.count - threshold, 6))
        );
      }
      this.attempts.set(key, attempt);
    });
    return 0;
  }

  succeed(username: string): void {
    this.attempts.delete(`user:${username.trim().toLowerCase()}`);
  }
}

export const loginAttempts = new LoginAttempts();
