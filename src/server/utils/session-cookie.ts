const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

/** Use the adapter's trusted request URL, never unvalidated forwarded request headers. */
export function sessionCookieOptions(url: URL, httpMode: string, logout = false) {
  return {
    path: '/',
    httpOnly: true,
    secure: httpMode === 'https' || url.protocol === 'https:',
    sameSite: 'lax' as const,
    maxAge: logout ? 0 : SESSION_MAX_AGE
  };
}
