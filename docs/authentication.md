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
