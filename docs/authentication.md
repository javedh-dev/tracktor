# Authentication System

Tracktor uses a modern username/password authentication system with session management for secure access to your vehicle data.

## Overview

The authentication system has been migrated from PIN-based authentication to a more robust username/password system with the following features:

- **Username/Password Authentication**: Secure login with username and password
- **Session Management**: Uses secure session cookies for maintaining login state
- **User Registration**: Create new user accounts
- **Password Hashing**: Passwords are securely hashed using bcrypt
- **Session Expiration**: Sessions automatically expire after 30 days of inactivity

## Creating Your First User

When you first set up Tracktor, you'll need to create a user account. You can do this in two ways:

### Method 1: Through the Web Interface

1. Navigate to the login page
2. If no users exist, you'll see a registration form
3. Enter your desired username and password
4. Click "Create Account"

### Method 2: Using the Command Line Script

```bash
pnpm tsx scripts/create-user.ts <username> <password>
```

Example:

```bash
pnpm tsx scripts/create-user.ts admin mypassword123
```

## API Authentication

For API access, the system uses session-based authentication:

### Login

```bash
POST /api/auth
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

### Logout

```bash
DELETE /api/auth
```

### Check Authentication Status

```bash
GET /api/auth
```

## Session Management

- Sessions are stored in the database and linked to user accounts
- Session cookies are HTTP-only and secure (in production)
- Sessions automatically refresh when they're close to expiring
- Sessions are invalidated on logout

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds
- **Session Tokens**: Cryptographically secure session tokens
- **Automatic Cleanup**: Expired sessions are automatically removed
- **CSRF Protection**: Session cookies include CSRF protection

## Migration from PIN Authentication

If you're upgrading from a PIN-based system:

1. The old PIN authentication table is preserved for backward compatibility
2. Create new user accounts using the registration system
3. The old PIN endpoints are still available but deprecated
4. Consider migrating to the new authentication system for better security

## Environment Variables

- `TRACKTOR_DISABLE_AUTH`: Set to 'true' to disable authentication (not recommended for production)

## Troubleshooting

### Can't Login

- Ensure you've created a user account
- Check that your username and password are correct
- Clear your browser cookies if you're having session issues

### Session Expired

- Sessions expire after 30 days of inactivity
- Simply log in again to create a new session

### API Access Issues

- Ensure you're including session cookies in your API requests
- Check that your session hasn't expired
- Verify the API endpoint URLs are correct
