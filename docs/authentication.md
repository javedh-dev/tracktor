# Authentication

Tracktor uses username/password authentication with session management for secure access.

## Features

- **Username/Password Authentication**: Secure login credentials
- **Session Management**: HTTP-only secure session cookies
- **User Registration**: First time account creation through web interface
- **Password Hashing**: Bcrypt-based password security
- **Session Expiration**: Automatic expiration after 30 days of inactivity

## Creating User Accounts

Registration is available only until the first account exists. The API enforces
this restriction with an atomic database insert; hiding the registration page is
not the security boundary. Concurrent setup requests cannot create a second user.
Existing accounts are not deleted or altered by this restriction.

### Local account recovery

Do not reopen public registration on an initialized instance. To recover the owner
account, stop Tracktor, make a backup of the SQLite database, and update that user's
`password_hash` locally with a bcrypt hash generated using the application's
installed `bcrypt` package. Remove that user's rows from `sessions`, then restart
Tracktor and sign in. Keep the database and password hash private. This preserves
the owner's user ID and vehicle data without exposing a public setup window.

If reinitialization is required, create a separate instance with a new empty data
directory, restrict it to localhost, create the owner account, and then restore
the vehicle data through the supported import flow. Preserve the original data
directory until recovery is verified. There is intentionally no remote switch
that reopens registration while accounts exist.

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
