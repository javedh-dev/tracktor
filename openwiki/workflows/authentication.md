---
type: "Reference"
title: "Authentication Workflow"
openwiki_generated: true
---

# Authentication Workflow

Tracktor uses username/password authentication with bcrypt-hashed passwords and database-backed sessions. Authentication can be disabled entirely via `TRACKTOR_DISABLE_AUTH` for local/demo use.

## User model

- Table: `users` in `src/server/db/schema/auth.ts`
- Service: `src/server/services/authService.ts`
- Session utils: `src/server/utils/session.ts`

A user has `id`, `username`, `passwordHash`, and audit timestamps. Passwords are hashed with bcrypt at salt rounds `10`.

## Registration gate

The first user is created through the web UI at `/register`. Once at least one user exists, registration is closed:

- `src/routes/(auth)/register/+page.server.ts` checks `getUsersCount()` and redirects to `/login` if users already exist.
- `AuthMiddleware` (`src/server/middlewares/auth.ts`) also checks `getUsersCount()` and returns `400` if an API call is made before any user exists.

This is the only multi-user model: there is no admin-invite flow; the first account is the owner account.

## Login flow

1. `POST /api/auth` receives `{ username, password }`.
2. `authService.loginUser` loads the user by username, compares the password with bcrypt, and creates a session.
3. The route sets an HTTP-only `session` cookie with:
   - `sameSite: 'lax'`
   - `secure` when `HTTP_MODE === 'https'`
   - `maxAge` of 30 days
4. `src/routes/(auth)/login/+page.server.ts` redirects an already-authenticated user to `/dashboard`.

## Session validation

- API requests: `AuthMiddleware` reads the `session` cookie or `Authorization: Bearer <token>` header and calls `validateSession`.
- On success, `event.locals.user` is populated with `{ id, username }`.
- On failure, a `401` or `500` JSON error is returned.

## Logout

`DELETE /api/auth` clears the `session` cookie with `maxAge: 0`.

## Disable-auth mode

Set `TRACKTOR_DISABLE_AUTH=true` (either the public or private env var works). When disabled:

- `AuthMiddleware` skips all API protection.
- `+page.server.ts` and `+layout.server.ts` redirect directly to `/dashboard`.
- The demo banner in `src/routes/+layout.svelte` hides the default login credentials.

This is intended for local development or single-user trusted deployments, not production.

## Password and profile changes

`PUT /api/auth/profile` supports:

- changing the username,
- changing the password after verifying the current password.

## Source references

- Auth schema: `src/server/db/schema/auth.ts`
- Auth service: `src/server/services/authService.ts`
- Session utilities: `src/server/utils/session.ts`
- Auth middleware: `src/server/middlewares/auth.ts`
- Auth API route: `src/routes/api/auth/+server.ts`
- Login page load: `src/routes/(auth)/login/+page.server.ts`
- Register page load: `src/routes/(auth)/register/+page.server.ts`
- Env config: `src/lib/config/env.server.ts`
- User docs: `docs/authentication.md`
