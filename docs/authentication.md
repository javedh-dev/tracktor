# Authentication

Tracktor uses username/password authentication with session management for secure access.

## Features

- **Username/Password Authentication**: Secure login credentials
- **Session Management**: HTTP-only secure session cookies
- **User Registration**: First time account creation through web interface
- **Password Hashing**: Bcrypt-based password security
- **Session Expiration**: Automatic expiration after 30 days of inactivity

## Creating User Accounts

### Web Interface

1. Navigate to the login page
2. If no users exist, a registration form will be displayed
3. Enter username and password
4. Click "Create Account"
   ˝

## API Endpoints

### Login

```http
POST /api/auth
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

### Logout

```http
DELETE /api/auth
```

### Check Authentication Status

```http
GET /api/auth
```

## Session Management

- Sessions stored in database and linked to user accounts
- HTTP-only secure cookies (in production)
- Automatic session refresh when approaching expiration
- Sessions invalidated on logout

## Security

- **Password Hashing**: Bcrypt with salt rounds
- **Session Tokens**: Cryptographically secure tokens
- **Automatic Cleanup**: Expired sessions removed automatically
- **CSRF Protection**: Built-in session cookie protection

## Configuration

**Environment Variable**: `TRACKTOR_DISABLE_AUTH`

- Set to `true` to disable authentication (not recommended for production)
- Default: `false`

## Troubleshooting

**Login Issues**:

- Verify user account exists
- Confirm username and password are correct
- Clear browser cookies if experiencing session issues

### Session Expired

- Sessions expire after 30 days of inactivity
- Simply log in again to create a new session

### API Access Issues

- Ensure you're including session cookies in your API requests
- Check that your session hasn't expired
- Verify the API endpoint URLs are correct

## Fleet accounts

Existing accounts retain administrator access when fleet permissions are installed.
New managed accounts default to the `driver` role. Only the first local account can
be registered publicly; later accounts are created by an administrator.
Administrators can deactivate accounts, reset local passwords, and assign vehicles.
A disabled account cannot log in, and its existing sessions are invalidated.
The final active administrator cannot be disabled or demoted.

Schema changes use additive migrations. Historical Drizzle snapshots predate some
applied migrations; `scripts/generate-schema-migration.mjs <baseline-ref> <name>`
generates a narrow schema diff against the baseline source without rewriting history.
Back up the SQLite database and uploads before upgrading. Database rollback requires
restoring that backup together with the matching application version.

### Permissions

| Operation                                                           | Administrator | Driver            |
| ------------------------------------------------------------------- | ------------- | ----------------- |
| View vehicles and reports                                           | All vehicles  | Assigned vehicles |
| Create, edit, or delete operational records                         | All vehicles  | Assigned vehicles |
| Create, edit, or delete vehicle details                             | Yes           | No                |
| Manage accounts and assignments                                     | Yes           | No                |
| Global settings, shared dashboard layout, notification destinations | Yes           | No                |
| Full-instance import/export                                         | Yes           | No                |
| Update own username/password                                        | Yes           | Yes               |

Administrators manage accounts under **Settings > Users**. Vehicle assignments take
effect on the next request, including for already logged-in users. Drivers without
assignments see an empty fleet. Notifications retain shared read state per vehicle;
scheduled delivery uses administrator-configured instance destinations.

Management API additions use the existing `{ success, data }` response envelope:

- `GET /api/users`: list accounts and their `vehicleIds` (no password hashes).
- `POST /api/users`: create an account with `username`, `password`, and optional `role`.
- `PATCH /api/users/{id}`: update `role` and/or `isActive`.
- `POST /api/users/{id}/password`: reset `password` and invalidate sessions.
- `PUT /api/users/{id}/vehicles`: replace assignments with `vehicleIds`.

Auth responses now include the account's `role` and `isActive`. Public registration
returns 403 after the first account exists. Protected resources return 401 without
an active session, 403 for prohibited operations, and 404 for inaccessible records.
Files referenced by vehicle data follow the same vehicle access restrictions.
Pending uploads remain accessible to their uploader; legacy unreferenced files are
administrator-only. Existing attachment URLs remain valid.

Full-instance imports preserve assignments for vehicle IDs that survive the import.
They do not import accounts or grant permissions based on file contents.
`TRACKTOR_DISABLE_AUTH=true` deliberately retains trusted full-instance access.

## OpenID Connect (OIDC)

OIDC support adapts [Alejandro-SB's contribution in PR #232](https://github.com/javedh-dev/tracktor/pull/232),
with separate issuer/subject identities, explicit linking, single-use server-side
transactions, and fleet authorization. One provider is configured per instance.

### Provider setup

1. Create a confidential OIDC client using Authorization Code flow and PKCE S256.
   Enable asymmetrically signed ID tokens (for example, RS256) and publish the
   signing keys through the provider's discovered JWKS endpoint.
2. Configure an exact redirect URI: `https://tracktor.example.com/api/auth/oidc/callback`.
   Include the application's base path when using `BASE_URL`.
3. Set `OIDC_ENABLED=true`, `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`,
   and `OIDC_REDIRECT_URI`. Keep `OIDC_SCOPES="openid profile email"` and set
   `HTTP_MODE=https` for HTTPS deployments.
4. Configure the reverse proxy/application origin so incoming callback URLs match
   `OIDC_REDIRECT_URI`. Restart Tracktor and choose **Sign in with SSO**.

The issuer must use HTTPS. Insecure loopback issuers are accepted only in
`NODE_ENV=test` for disposable tests; production has no insecure-provider switch.
Provider-side application assignments control which identities may authenticate.
New identities become Drivers without assigned vehicles. An administrator must
assign their fleet access. OIDC claims never grant administrator privileges.

### Link an existing account

Sign in locally, open your profile, and choose **Link SSO account**. Authenticate
with the intended provider account. The callback binds the identity to the same
still-valid Tracktor browser session. Existing usernames or email addresses never
automatically link accounts. An identity already owned by another Tracktor account
cannot be linked, and an account can have only one identity per issuer.

New OIDC-only accounts have no usable local password. In mixed mode an
administrator may set one through password reset; in OIDC-only mode all local
credential operations are disabled. Changing provider usernames does not change
identity ownership: Tracktor identifies users through the validated issuer and
subject. Provider-wide logout and group/role synchronization are not supported;
Tracktor logout invalidates only its own session.

### Enable OIDC-only mode

1. Start in mixed mode (`OIDC_DISABLE_LOCAL_AUTH=false`). On a fresh installation,
   explicitly visit `/register` to create the first local administrator.
2. Link an active administrator to the configured provider and verify SSO login.
3. Set `OIDC_DISABLE_LOCAL_AUTH=true` and restart.

Startup refuses OIDC-only mode without an active administrator linked to that
issuer. Account administration also prevents removing the last such administrator.
Local login, local registration, and local password changes/resets are denied
server-side. To recover provider access, the instance operator can restore
`OIDC_DISABLE_LOCAL_AUTH=false` and restart; the existing local administrator
password remains intact. `TRACKTOR_DISABLE_AUTH=true` retains its explicitly
trusted full-access behavior and disables interactive OIDC.

### Validation and disposable Authentik smoke test

`pnpm test` includes real discovery, PKCE exchanges, signed ID-token validation,
claim failures, identity collisions, transaction replay, session-bound linking,
and OIDC-only lockout tests against a local synthetic provider and disposable SQLite.

For a real Authentik smoke test, Docker Compose is required:

```bash
node scripts/test-authentik-oidc.mjs --prepare
set -a
. /tmp/tracktor-oidc-smoke.env
set +a
DB_PATH=/tmp/tracktor-oidc-smoke-app.db \
  UPLOADS_DIR=/tmp/tracktor-oidc-smoke-uploads \
  LOG_DIR=/tmp/tracktor-oidc-smoke-logs \
  pnpm dev --port 5189
```

In another terminal, run `node scripts/test-authentik-oidc.mjs --test --keep`.
The script creates synthetic test accounts and verifies new-user provisioning,
empty vehicle access, callback replay denial, explicit linking, and linked login.
After stopping the test application, run
`node scripts/test-authentik-oidc.mjs --cleanup` to remove only the disposable
Compose project and its volumes. The test SQLite database and uploads are also
throwaway; never use production paths with this workflow.

To check OIDC-only behavior with the same linked test administrator, stop the app,
restart with `OIDC_DISABLE_LOCAL_AUTH=true` and the same disposable database, then
run `node scripts/test-authentik-oidc.mjs --test-oidc-only --keep` before cleanup.
