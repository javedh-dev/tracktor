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
