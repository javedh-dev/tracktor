# Tracktor Refactoring & Simplification Plan

> Generated from a full-codebase analysis (server, API routes, frontend, shared layers).
> Every finding verified against source. Execute phases in order; each is independently shippable.
> After every phase: run `pnpm check`, `pnpm lint`, `pnpm test` before moving on.

## Approved behavior changes (confirmed by maintainer)

- ✅ Export no longer includes `users`/`sessions`; export gains `reminders`/`notifications`/`notification_providers`
- ✅ Test endpoints removed from production tree (or gated behind `dev`)
- ✅ GET on a bogus vehicle's sub-resources returns 404 instead of 200 + empty list; update/delete verify parent scope
- ✅ Missing `APP_SECRET` = hard failure instead of silent plaintext credential storage
- ✅ Notification sync full redesign approved (unique index, batched upserts, sync-on-schedule)

---

## PHASE 0 — Critical production bugs (small diffs, do first)

### 0.1 Remove 200s fake delay from CSV import

- **File:** `src/lib/helper/csv.helper.ts:67-68`
- **Bug:** `await new Promise((r) => setTimeout(r, 200000))` — "Simulate delay for demo purposes". Every fuel CSV import hangs 200s in production.
- **Fix:** delete both lines.

### 0.2 Fix data export/import data loss + credential exposure

- **File:** `src/server/services/data-transfer.service.ts:11-36, 115-158`
- **Bugs:** (a) export omits `reminderTable`, `notificationTable`, `notificationProviderTable` while import deletes/re-inserts tables → reminders & provider configs permanently lost on reimport; (b) exports `users` (with `passwordHash`) and `sessions` into plaintext JSON.
- **Fix:** add the three missing tables to `ExportDataSet`, `buildExportData`, and `importDataSet` (insert AFTER vehicles, correct FK order); remove `users` and `sessions` from the export entirely (import should not accept them either — or accept-but-ignore with a schema-version field for backward compat).

### 0.3 Consolidate encryption; hard-fail without APP_SECRET

- **Files:** `src/server/services/crypto.service.ts` (scrypt, hex `iv.salt.data:authTag`) vs `src/server/utils/encryption.ts` (PBKDF2, base64 `salt.iv.authTag.data`)
- **Bugs:** two incompatible AES-256-GCM implementations (`data-transfer.service.ts:3` uses the former, `notificationProviderService.ts:20` the latter); `utils/encryption.ts:24-27,63-70` silently falls back to **plaintext** provider credentials when `APP_SECRET` is unset; both misuse `new Error(msg, error)` (second arg must be `{ cause }`).
- **Fix:** keep ONE module (`crypto.service.ts`); migrate `notificationProviderService` to it; throw at startup/encrypt-time if `APP_SECRET` missing (approved); fix `Error` cause; add a one-time decrypt fallback for existing PBKDF2 rows or a small migration note.

### 0.4 Fix PDF export "Vehicle: undefined"

- **Files:** `src/routes/api/vehicles/[id]/maintenance-logs/export-pdf/+server.ts:25-33`, `src/server/services/maintenanceLogPdfService.ts:25`
- **Bug:** passes `vehicle.name` (field doesn't exist — schema has `make`/`model`); `any` typing hides it; nullable `licensePlate` interpolated unsanitized into `Content-Disposition` filename.
- **Fix:** pass `make`/`model`/`licensePlate` with proper types (drop `any`); sanitize filename.

### 0.5 Decouple zod schemas from the client config store

- **Chain:** `routes/api/.../fuel-logs/+server.ts:4` → `domain/fuel.ts:1` → `helper/format.helper.ts:1` → `stores/config.svelte.ts` (imports apiClient + Paraglide runtime)
- **Bugs:** (a) client store/Paraglide leak into the server bundle via a value import; (b) `fuelSchema.date` refines with `parseDate()` which reads `configs.dateFormat`/`timezone` — empty on the server → falls back to `'dd/MM/yyyy'`/`UTC` → spurious 400s for users with custom formats. Same latent hazard in `domain/reminder.ts`, `insurance.ts`, `pucc.ts`, `maintenance.ts`.
- **Fix:** schema date validation must not read the config store — validate ISO/strings structurally in schemas, or pass format explicitly from the caller. Break the `format.helper → config store` import for schema code paths (pass config as a function parameter).

### 0.6 PUCC edit-mode toast + broken dead store code

- **Files:** `src/lib/components/feature/pollution/PollutionCertificateForm.svelte:64-66`, `src/lib/stores/pucc.svelte.ts:9,29-36`
- **Bug:** toast reads `puccStore.editMode`, set only by `openForm` which is never called (and would throw — assigns to a `$derived`). "Updated" toast unreachable.
- **Fix:** detect edit mode from the `data` prop like all sibling forms (`data ? updated : saved`). Delete the dead `openForm`/`openSheet`/`editMode` block (also in `vehicle.svelte.ts:40-55`).

### 0.7 Seeder race conditions

- **File:** `src/server/db/seeders/index.ts:99, 135-154, 156-167`
- **Bug:** `seedDefaultUser()` not awaited; `vehicles.forEach(async …)` (fire-and-forget) for insurance & maintenance inserts while sibling loops correctly use `await Promise.all(vehicles.map(...))`.
- **Fix:** `await seedDefaultUser()`; convert both `forEach` loops to `await Promise.all(...map...)`.

### 0.8 API data-integrity inconsistencies

- **Files:**
  - `src/server/services/maintenanceLogService.ts:53-66` — `updateMaintenanceLog` doesn't verify vehicle ownership (route `maintenance-logs/[logId]/+server.ts:21` doesn't even read the vehicle `id`) → any log updatable via any vehicle URL.
  - All `delete*` services ignore parent `vehicleId` (route `:id` segment decorative).
  - GET sub-resources of a nonexistent vehicle return 200 + `[]` (no existence check in any `getX(vehicleId)`).
  - `routes/api/vehicles/[id]/insurance/+server.ts:59` POST defaults `recurrenceType='no_end'` but `[insuranceId]/+server.ts:48-50` PUT defaults `'none'`; PUCC POST uses `'none'`. Defaults applied AFTER validation in POST → "end date required" silently skipped.
  - Insurance POST never validates `cost` (schema requires positive).
- **Fix (approved behavior change):** all update/delete/get-by-parent verify the vehicle scope → 404 on mismatch; single canonical recurrence default (`'none'`) applied BEFORE validation; Phase 2's schema parsing makes most of this automatic.

### 0.9 Misc one-liners

- `routes/api/vehicles/[id]/notifications/+server.ts:27` — PUT returns **201**; use 200.
- `routes/api/auth/register/+server.ts:26` — creation returns 200; use 201 for consistency.
- `routes/api/auth/+server.ts:24 vs 85` — cookie `secure` flag uses two different predicates (`env.HTTP_MODE` vs raw `process.env.NODE_ENV`); unify on `env.HTTP_MODE === 'https'`.
- `routes/api/health/+server.ts:7` — stale message "SvelteKit consolidation API is working".
- `routes/api/config/branding/+server.ts:7` — wrong error label (copy-paste).
- Delete 10 stale comments "Use body from locals if available (from middleware)" — no such middleware exists.

**Phase 0 verification:** `pnpm check && pnpm lint && pnpm test`; manual: CSV import completes promptly; export→import round-trip preserves reminders; PDF shows make/model.

---

## PHASE 1 — Dead code deletion (~600 lines, zero risk)

All verified zero-references:

| Item                                                                                                                                                                               | Location                                                                            | Lines                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------- |
| `SettingsModal.svelte` (entire file; superseded by `routes/settings/+page.svelte`)                                                                                                 | `src/lib/components/feature/settings/`                                              | 308                  |
| Legacy `openSheet`/`openForm`/`editMode`/`closeForm`                                                                                                                               | `stores/vehicle.svelte.ts:40-55`, `stores/pucc.svelte.ts:10-14,29-36`               | ~35                  |
| `HttpClient` statics + interceptor machinery + `HttpError` + default export                                                                                                        | `helper/http.helper.ts:196-257`                                                     | ~60                  |
| `hasRecurrenceEnded`, `calculateOccurrences`, `getEffectiveEndDate`, `formatRecurrenceDescription`                                                                                 | `helper/recurrence.helper.ts:55-134`                                                | ~85                  |
| `fetchMileageData`, `fetchCostData` (superseded by `chart.svelte.ts`)                                                                                                              | `services/vehicle.service.ts:5-47`                                                  | ~42                  |
| `createSettingsFieldSectionMap`                                                                                                                                                    | `helper/settings-form.helper.ts:129-158`                                            | ~30                  |
| `statusFromError`                                                                                                                                                                  | `server/exceptions/AppError.ts:19-33`                                               | ~15                  |
| `cleanup`                                                                                                                                                                          | `helper/format.helper.ts:281-291`                                                   | 11                   |
| `simulateNetworkDelay` (whole file)                                                                                                                                                | `helper/dev.helper.ts`                                                              | 5                    |
| `getEnabledFeatures`                                                                                                                                                               | `helper/feature.helper.ts:30-39`                                                    | 10                   |
| Duplicate `Status` types (keep one)                                                                                                                                                | `domain/status.ts`, `domain/index.ts:12-16`                                         | ~9                   |
| `setThemeContext`/`getThemeContext`, `ThemeContextValue`                                                                                                                           | `stores/theme.svelte.ts:74-81`, `types/theme.ts:45-49`                              | ~13                  |
| Dead imports (`toast`, `onMount`, `FuelLog`)                                                                                                                                       | vehicle/pucc/maintenance stores                                                     | 3                    |
| `FileDropZone.existingImageUrl` compat prop (only user: VehicleForm)                                                                                                               | `app/FileDropZone.svelte:26,42,60`                                                  | ~5                   |
| Test endpoints (approved removal)                                                                                                                                                  | `routes/api/test-email-digest/`, `routes/api/notifications/test-enabled-providers/` | ~25                  |
| `settings/+page.svelte:30` `processing` never set true; `Notifications.svelte:73` non-`$state` dead var; dynamic import of statically-imported module (`Notifications.svelte:117`) | —                                                                                   | small                |
| Backward-compat aliases still used as primary names                                                                                                                                | `services/pucc.service.ts:63-66`                                                    | rename at call sites |

**Phase 1 verification:** `pnpm check && pnpm lint && pnpm test` — all must stay green.

---

## PHASE 2 — Validation unification (highest-ROI structural fix)

**Problem:** Zod domain schemas exist for all 6 entities but are used in **1 of ~15 mutating endpoints** (`fuel-logs` POST only). ~24 hand-rolled validation blocks across 8 route files (12 positive-number checks — 8 byte-identical; 8 date-parse blocks; 4 cross-field date comparisons), with contradictions (fuel cost `>0` vs maintenance `>=0`). Services do no validation and spread raw bodies into `.values()`/`.set()` (mass assignment). Recurrence `endDate` rule implemented in 3 layers (route `delete`, service `clearFixedEndDate`, read normalizer).

**Steps:**

1. Add `parseBody(event, schema)` helper in `src/server/utils/route-handler.ts` — `withRouteErrorHandling` already special-cases `ZodError` (plumbing half-built). Return typed data; 400 with structured field errors.
2. Migrate every mutating endpoint (vehicles, fuel-logs ×2, maintenance-logs ×2, insurance ×2, pucc ×2, reminders ×2, notifications, config, auth/register, auth/profile) to `parseBody` + domain schema. Extend schemas where hand-rolled checks were stricter (cross-field date comparisons via `.refine`, year range, username/password lengths — add shared constants).
3. Delete all hand-rolled validation blocks and the ~39 dead `if (!id)` param guards (SvelteKit guarantees `[id]` params) — add a `requireParam(event, 'id')` only where it aids typing.
4. Single recurrence-rule location: keep `clearFixedEndDate` in `domain-payload.helper.ts`; delete route-side `delete body.endDate`/`expiryDate` (4 blocks) and the read-side normalizers in `insuranceService.ts:44-46` / `pollutionCertificateService.ts:45-47`.
5. Services stop trusting route input: types derive from the same zod schemas (`z.infer`) instead of inline `XPayload` interfaces, so route/service can no longer drift.
6. Fix mass assignment: `.values()`/`.set()` receive schema-parsed objects only.

**Also fixes:** Phase 0.8 contradictions, `fuelSchema` being the only used schema, error messages currently dumping raw `JSON.stringify(fieldErrors)` to users.

**Phase 2 verification:** `pnpm check && pnpm lint && pnpm test`; add route-level validation tests (invalid cost/date/recurrence → 400); confirm 404s on bogus parent IDs.

---

## PHASE 3 — Server service standardization + performance

### 3.1 One error convention

- **Problem:** 5 styles — throw `AppError` (most), return `success:false` w/ HTTP 200 (`notificationService.ts:262-287`), return `{success,error}` (`emailNotificationService.ts:49-122`), discriminated union w/ `status` (`data-transfer.service.ts:59-113`), ad-hoc (`notificationDispatchService.ts:184-235`, forcing casts like `(result.data ?? []) as Notification[]`). Plus 2 route wrappers with different semantics (`withRouteErrorHandling` vs `withJsonErrorHandling` — the latter logs via `console.error`, discards `AppError` status, returns leaky `Promise<T | Response>`), double logging (`console.error` + winston `handleError`), and `Error` objects serialized to `{}` in `errorHandler.ts:8-22`.
- **Fix:** throw `AppError` everywhere; delete `createFailureResponse` return-style; collapse to `withRouteErrorHandling`; services stop exchanging HTTP-shaped `ApiResponse` envelopes internally (return plain data); `errorHandler.ts` serializes `{ message, code }` not raw `Error`; single log path via winston.

### 3.2 Mileage/odometer engine → domain + SQL aggregation

- **Problem:** 4 copies of the same algorithm — `vehicleService.ts:64-109` (DB), `:125-172` (InMemory), `:28-57` vs `:111-123` (odometer ×2), `fuelLogService.ts:62-140` (3rd variant). Exists because `getAllVehicles` (`vehicleService.ts:205-210`) loads ALL fuel + maintenance logs into memory on the most-hit endpoint. `updateVehicle` validates existence via `getVehicleById` → runs 4+ queries just to check existence (`:292`).
- **Fix:** extract one engine to `src/lib/domain/fuel/mileage.ts` (pure functions over sorted log arrays); compute per-vehicle aggregates in SQL (grouped `MAX(odometer)`/latest-per-vehicle subqueries) for the list endpoint; cheap `SELECT 1` existence check.

### 3.3 Notification sync redesign (approved full redesign)

- **Problem:** `getPendingNotificationsForChannels`/`getActiveNotificationsForChannels` call `syncAllNotifications()` (ALL vehicles, sequential per-vehicle, N+1 findFirst+update/insert per row, no transaction) on **every read/dispatch** (`notificationService.ts:200-254`); `getNotifications(vehicleId)` syncs on every GET; `reminderService` triggers full resync per write.
- **Fix:**
  1. Add unique index on `notification.notificationKey` (`db/schema/notification.ts:17`) via Drizzle migration (also resolves `patch/` bypass).
  2. Batched upsert (`ON CONFLICT notificationKey`) inside a transaction.
  3. Sync only on write events (reminder/insurance/pucc/maintenance changes) for the affected vehicle; scheduled dispatch reads without resyncing; GET reads without resyncing.
  4. Merge duplicate enumerations: `CHANNEL_BY_TYPE` (`notificationService.ts:26-34`) vs `getTypeMetadata` (`emailTemplateService.ts:38-67`); `getDaysUntil` (`notification-service.helper.ts:66-71`) vs `getDaysUntilDue` (`emailTemplateService.ts:92-127`); duplicate date formatters.
- **Also:** add DB indexes on all `vehicleId` FK columns (7 tables) in the same migration; move `db/patch/index.ts` hand-rolled ALTERs into the Drizzle migration workflow.

### 3.4 CRUD skeleton + config service

- Extract shared `createOwnedEntityService`-style helpers for the 4 identical CRUD skeletons (`fuelLogService.ts:24-38`, `maintenanceLogService.ts:17-32`, `insuranceService.ts:22-37`, `pollutionCertificateService.ts:21-39`) incl. the and()-scoped ownership check.
- `configService.ts:29-51`: wrap 2N queries in a transaction; fix nested-array response shape; single config-read path (`fuelLogService.getFuelLogs:42-55` fires 3 sequential config queries; string-boolean conventions conflict — `'false'` vs `'true'` comparisons).

### 3.5 Auth middleware & misc

- Cache/short-circuit `getUsersCount` (currently `SELECT *` incl. `passwordHash` per request → `SELECT 1 LIMIT 1` or cached).
- Deduplicate CORS/error-header construction (`auth.ts:96-116`, `rateLimit.ts:63-78`, `cors.ts:53-56`).
- Explicit decision on `/api/files/` being unauthenticated (currently bypass via string-prefix accident).
- `emailNotificationService.ts:36-38`: arbitrary `providers[0]` pick (no orderBy) — make provider selection explicit.
- `getProvidersByUserId` takes no user id — rename.
- `authService`: dedupe bcrypt blocks, single cost constant.
- Schema boilerplate: shared column builders (`id`, `vehicleId` ref, recurrence pair) like `audit.ts` timestamps; fix `created_at` casing mismatch with drizzle `casing: 'snake_case'`; drop dead `authTable` comment.

**Phase 3 verification:** existing tests green; add tests for mileage engine + notification upsert idempotency; benchmark vehicles list & dispatch before/after.

---

## PHASE 4 — Client factories (stores, services, forms)

### 4.1 `createEntityStore<T>` factory

- **Problem:** identical guarded-fetch/then/catch/finally in 6 stores (~90 lines) with divergent details: sort-then-assign vs assign-then-sort (`fuel-log.svelte.ts:19-24` vs `maintenance.svelte.ts:19-24`), missing null-guard (`maintenance:23` vs `fuel-log:22`), inconsistent error strings/date mapping, async vs `.then` styles, unused `.catch((err))` params.
- **Fix:** `src/lib/stores/entity-store.svelte.ts` factory (`{ path, map?, sort? }`); migrate vehicle/fuel-log/maintenance/insurance/pucc/reminder/config. Add the missing **notification store** (extracted from `Notifications.svelte` — see 5.1).

### 4.2 `createEntityService` + `extractApiError`

- **Problem:** `saveXWithAttachment` character-identical ×4 (`fuel/insurance/pucc/maintenance.service.ts:5-33`); dynamic-dispatch `apiClient[method.toLowerCase()...]` ×6; `e.response?.data?.message || '...'` ×26; double envelope unwrap (`Response<T>` vs `ApiResponse<T>` → `res.data = response.data.data || response.data`).
- **Fix:** one `createEntityService(basePath, { fileField })` factory + `extractApiError(e)`; unify on the single `ApiResponse<T>` wire envelope (delete `domain/index.ts` `Response<T>` or make it alias); fix raw `fetch` bypasses (`autocomplete.service.ts:13`, `settings/+page.svelte:55`, `DataExportImport.svelte:28,79` — also fixes missing `withBase`).

### 4.3 `createSheetForm` composable + `RecurrenceFields.svelte`

- **Problem:** ~348 shared scaffold lines across 6 forms (superForm init, onUpdated→save→toast→`sheetStore.closeSheet(refresh)`, vehicleId injection ×4 character-identical, attachment URL derivation ×4, autocomplete effect ×4, form/fieldset shell ×6). Divergences to unify: `MaintenanceForm.svelte:60` dumps `JSON.stringify(f.errors)` in a toast; edit-detection patterns differ; recurrence UI near-cloned ×3 (Insurance:167-225 ≈ PUCC:150-208 ≈ Reminder:164-229).
- **Fix:** `src/lib/composables/sheet-form.svelte.ts` (processing state, superForm wiring, save pipeline, vehicleId effect, attachment derivation) + `RecurrenceFields.svelte` + shared `SheetForm` shell component. ~300 lines removed; toasts consistent.

### 4.4 List scaffolding

- `<StoreResourceState {store} emptyMessage>` wrapper for the processing/error/empty triad duplicated ×6 (`FuelLogList:197-205` == `MaintenanceLogList:114-124` ≈ 4 more); shared cell snippets (`AttachmentCell` ×2 identical, `DateCell`, `OdometerCell`, `CostCell`, `NotesCell`); canonical refresh effect adopting `ReminderList`'s `lastVehicleId` guard everywhere; remove `params: any` on AppTable usages.

**Phase 4 verification:** `pnpm check && pnpm lint`; smoke-test each entity CRUD in the UI; stores/forms behave identically.

---

## PHASE 5 — Settings & component decomposition

### 5.1 `Notifications.svelte` (390 → ~250 lines)

- Move fetch/mark-read/clear-all/navigation-map to new `stores/notification.svelte.ts` (~130 lines); fix non-`$state` `markingAsReadIds:73`, redundant dynamic import `:117`, channel/type conflation `:330-332` (move to domain mapper).

### 5.2 Settings notification area untangle

- Colocate the 7 form-state fields into `NotificationProviderDialog` (kills 17-prop drilling at `NotificationProvidersSettings.svelte:319-338`).
- Replace `$effect`→`onConfigChange` feedback loops (`WebhookProviderForm.svelte:49-75` JSON.parses headers on every keystroke + `console.error`s partial JSON; `EmailProviderForm.svelte:37-52`) with explicit event handlers or `bind:config`.
- Pick one channel: `CronInput.svelte` has both `$bindable` and `onValueChange` effect (`:104-106`); same in `NotificationDeliveryPanel.svelte:31-33`.
- Replace native `confirm()` (`NotificationProvidersSettings.svelte:210`) with `DeleteConfirmation`.

### 5.3 Settings single source of truth

- Settings shape defined 3× (`domain/config.ts:18-37`, `types/settings.ts:1-21`, `settings-form.helper.ts:28-66`) + `BOOLEAN_CONFIG_KEYS` + `DEFAULT_CONFIGS` — derive all from the zod schema via `z.infer`.

### 5.4 Splits

- `FuelLogImportForm.svelte` (543 → ~180): columns/hints/auto-map/date-validation → `fuel-import.config.ts` + `useCsvMapping` composable; steps → `ImportStepUpload/Mapping/Preview.svelte`.
- `format.helper.ts` (292): split `date.helper` / `unit.helper` / `timezone.helper`; config passed as parameter (completes Phase 0.5).
- Domain label helpers ×4 near-identical switches with `m: any` (`reminder.ts:30-83`, `vehicle.ts:28-43`, `insurance.ts:12-25`, `pucc.ts:12-25`) → `makeLabelHelper(map)` factory, restore typing.

**Phase 5 verification:** `pnpm check && pnpm lint`; manual settings round-trip (provider create/edit/test/delete, cron reload, branding).

---

## PHASE 6 — DB schema & infra cleanup

1. Migration: indexes on all `vehicleId` FKs (7 tables) + unique index on `notification.notificationKey`; fold `db/patch/index.ts` into the migration workflow; consider unique constraint decision for `licensePlate` (currently nullable+non-unique but used as lookup key in `serviceUtils.ts:26-34`, `fuelLogService.ts:187-190`).
2. Shared column builders for repeated columns (`id` ×9, `vehicleId` ×7, recurrence pair ×3, notes/attachment ×4).
3. Fix `audit.ts` literal `created_at`/`updated_at` vs drizzle `casing: 'snake_case'` mismatch (code like `notification.created_at` mixes conventions).
4. Rate limiter: bound the in-memory `Map` (periodic sweep) or document the single-instance assumption; 1000 req/min is effectively no limit.
5. `middlewares/base.ts:49`: empty chain must fail fast, not hang.
6. Remove dead `authTable` ("migration purposes") if truly unreferenced; align RTL language list duplicated in `hooks.server.ts:123` and `src/lib/utils.ts:32`.

**Phase 6 verification:** `pnpm db:generate && pnpm db:migrate` on a copy of `tracktor.db`; full test suite; seed from scratch (`pnpm db:seed`).

---

## Cross-cutting notes

- **Logging:** replace all `console.error/warn` in routes/middleware with winston `logger` (`route-handler.ts:29,43`, `auth/+server.ts:50`, `files/[filename]/+server.ts:31`).
- **`any` cleanup:** `export-pdf` `pdfBuffer: any`, `http.helper.ts` (`Record<string, any>`, `catch (error: any)`), AppTable `params: any`, label helpers `m: any`.
- **REST shape:** vehicle update is `PUT /api/vehicles` with id in body (others use path param) — consider `PUT /api/vehicles/[id]`; notification read-state uses PUT (collection) vs PATCH (item) — pick one. Low priority; do opportunistically in Phase 2.
- Do NOT further deduplicate the five `*ContextMenu.svelte` files — already thin and well-factored via `CrudActionsMenu`.

## Running totals

- Dead code: ~600 lines removed (Phase 1)
- Duplication recovered: ~270 forms + ~120 services + ~90 stores + ~80 server CRUD + ~100 mileage + ~160 route boilerplate + ~100 recurrence UI ≈ **~900 lines**
- Production bugs fixed: 10 (Phase 0)
- Net effect: ~1,500 lines removed, 5 error conventions → 1, 4 mileage algorithms → 1, 3 settings shapes → 1, 15 ad-hoc validators → schema-driven

## Progress log

- [x] Plan document created
- [ ] Phase 0 — Critical bug fixes
- [ ] Phase 1 — Dead code deletion
- [ ] Phase 2 — Validation unification
- [ ] Phase 3 — Server services + notification redesign
- [ ] Phase 4 — Client factories
- [ ] Phase 5 — Settings & component decomposition
- [ ] Phase 6 — DB & infra cleanup
