---
type: "Reference"
title: "Routing and API Surface"
openwiki_generated: true
---

# Routing and API Surface

Tracktor uses SvelteKit file-system routing. Pages live under `src/routes/`, API endpoints under `src/routes/api/`, and authentication flows under `src/routes/(auth)/`.

## Page routes

| Route                    | Purpose                                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `/`                      | Landing redirect. `+page.server.ts` sends authenticated users to `/dashboard` and unauthenticated users to `/login`.                |
| `/login`                 | Username/password login. `+page.server.ts` redirects to `/register` when no users exist, or to `/dashboard` when already logged in. |
| `/register`              | First-time account creation. Only available while the users table is empty (unless auth is disabled).                               |
| `/dashboard`             | Dashboard shell. `+layout.server.ts` validates auth, loads configs and vehicles, and the layout hydrates stores.                    |
| `/dashboard/overview`    | Dashboard charts and summary cards.                                                                                                 |
| `/dashboard/fuel`        | Fuel log list, form, and import.                                                                                                    |
| `/dashboard/maintenance` | Maintenance log list, form, PDF export.                                                                                             |
| `/dashboard/insurance`   | Insurance records and renewals.                                                                                                     |
| `/dashboard/pollution`   | PUCC records and renewals.                                                                                                          |
| `/dashboard/reminders`   | Reminders list and management.                                                                                                      |
| `/settings`              | App settings, feature toggles, notification providers, branding.                                                                    |

## API routes

All API routes return the shared `ApiResponse` shape (`success`, `data`, `message`). Route handlers wrap service calls with `withRouteErrorHandling` from `src/server/utils/route-handler.ts`.

### Auth

- `POST /api/auth` — login, sets `session` cookie.
- `GET /api/auth` — returns user count, current user, and `isAuthenticated` / `isAuthDisabled`.
- `DELETE /api/auth` — logout, clears cookie.
- `POST /api/auth/register` — first user registration.
- `GET /api/auth/profile` — current user profile.
- `PUT /api/auth/profile` — update username/password.

### Vehicles

- `GET /api/vehicles` — list all vehicles.
- `POST /api/vehicles` — create vehicle.
- `PUT /api/vehicles` — update vehicle.
- `GET /api/vehicles/[id]` — get one vehicle.
- `DELETE /api/vehicles/[id]` — delete vehicle.

### Fuel logs

- `GET /api/vehicles/[id]/fuel-logs` — list fuel logs for a vehicle with computed `distanceDriven` and mileage.
- `POST /api/vehicles/[id]/fuel-logs` — create fuel log.
- `PUT /api/vehicles/[id]/fuel-logs/[logId]` — update fuel log.
- `DELETE /api/vehicles/[id]/fuel-logs/[logId]` — delete fuel log.

### Maintenance logs

- `GET /api/vehicles/[id]/maintenance-logs` — list maintenance logs.
- `POST /api/vehicles/[id]/maintenance-logs` — create maintenance log.
- `PUT /api/vehicles/[id]/maintenance-logs/[logId]` — update maintenance log.
- `DELETE /api/vehicles/[id]/maintenance-logs/[logId]` — delete maintenance log.
- `GET /api/vehicles/[id]/maintenance-logs/export-pdf` — PDF export (added in `d34021f`).

### Insurance

- `GET /api/vehicles/[id]/insurance`
- `POST /api/vehicles/[id]/insurance`
- `PUT /api/vehicles/[id]/insurance/[insuranceId]`
- `DELETE /api/vehicles/[id]/insurance/[insuranceId]`

### PUCC (pollution certificates)

- `GET /api/vehicles/[id]/pucc`
- `POST /api/vehicles/[id]/pucc`
- `PUT /api/vehicles/[id]/pucc/[puccId]`
- `DELETE /api/vehicles/[id]/pucc/[puccId]`

### Reminders

- `GET /api/vehicles/[id]/reminders`
- `POST /api/vehicles/[id]/reminders`
- `PUT /api/vehicles/[id]/reminders/[reminderId]`
- `DELETE /api/vehicles/[id]/reminders/[reminderId]`

### Notifications

- `GET /api/vehicles/[id]/notifications`
- `PUT /api/vehicles/[id]/notifications/[notificationId]`
- `GET /api/notifications/test-enabled-providers` — trigger a test dispatch.
- `POST /api/test-email-digest` — send a test email digest.

### Notification providers

- `GET /api/notification-providers`
- `POST /api/notification-providers`
- `PUT /api/notification-providers/[id]`
- `DELETE /api/notification-providers/[id]`
- `POST /api/notification-providers/[id]/test`

### Config and data

- `GET /api/config` — all configs.
- `PUT /api/config` — bulk update configs.
- `GET /api/config/[key]` — single config.
- `PUT /api/config/[key]` — update single config.
- `GET /api/config/branding` — custom CSS value.
- `GET /api/autocomplete` — autocomplete suggestions (service centers, providers, etc.).
- `POST /api/data/import` — import data (CSV/JSON).
- `GET /api/data/export` — export data.
- `POST /api/files` — upload files.
- `GET /api/files/[filename]` — download files.
- `GET /api/health` — health check.
- `GET /api/cron/reload` — reload the notification scheduler.

## Auth middleware

`src/server/middlewares/auth.ts` guards API routes:

- Auth is skipped entirely when `env.DISABLE_AUTH` is true.
- Only paths starting with `/api` are protected.
- Bypass paths: `/api/auth`, `/api/files/`, `/api/health`, `/api/config/branding`.
- Accepts session via `Authorization: Bearer <token>` or the `session` cookie.
- On success, sets `event.locals.user` with `id` and `username`.
- If no users exist, returns `400` with "Please create a user account first."

## Layout data flow

```
+layout.server.ts (root)
  └─ returns { appVersion }

+page.server.ts (/)
  └─ redirects to /dashboard or /login

(auth)/login/+page.server.ts
  └─ redirects to /register, /dashboard, or renders login

(auth)/register/+page.server.ts
  └─ redirects to /dashboard when auth disabled
      or blocks registration when users already exist

dashboard/+layout.server.ts
  └─ returns { user, rawConfigs, configs, vehicles }

dashboard/+layout.svelte
  └─ hydrates configStore, vehicleStore, authStore from data
```

This server-side bootstrap is the current state after the removal of `src/routes/dashboard/+layout.ts`.

## Source references

- Route handlers: `src/routes/api/**/+server.ts`
- Auth middleware: `src/server/middlewares/auth.ts`
- Middleware chain: `src/server/middlewares/base.ts`
- Route error wrapper: `src/server/utils/route-handler.ts`
- Response shape: `src/lib/response.ts`
- Root layout server load: `src/routes/+layout.server.ts`
- Landing redirect: `src/routes/+page.server.ts`
- Dashboard layout load: `src/routes/dashboard/+layout.server.ts`
- Dashboard layout hydration: `src/routes/dashboard/+layout.svelte`
