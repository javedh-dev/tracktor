# Environment Variables

Configure Tracktor by setting environment variables in a `.env` file in the root directory or as system environment variables.

## Application Settings

### NODE_ENV

Application environment.

- **Values**: `dev`, `production`, `test`
- **Default**: `dev`

### HOST

Hostname or IP address for the server. Set to `0.0.0.0` to listen on all network interfaces.

- **Values**: Any valid hostname or IP address. Used only on production or build
- **Default**: `localhost`

### PORT

Port number for the server.

- **Values**: Any available port number. Used only on production or build
- **Default**: `3000`

## Database

### DB_PATH

Path to the SQLite database file.

- **Values**: Any valid file path
- **Default**: `./tracktor.db`
- **Docker**: `/data/tracktor.db`

## File Storage

### UPLOADS_DIR

Directory for uploaded files.

- **Values**: Any valid directory path
- **Default**: `./uploads`
- **Docker**: `/data/uploads`

## Security

### CORS_ORIGINS

Allowed origins for Cross-Origin Resource Sharing (CORS). When using Tracktor behind a reverse proxy or with a frontend on a different domain/port, set this to specific origins for security.

- **Values**: Comma-separated list of origins (e.g., `http://example.com,https://anotherdomain.com`)
- **Default**: `*` (allows all origins)

### TRACKTOR_DISABLE_AUTH

Disable authentication (not recommended for production).

- **Values**: `true`, `false`
- **Default**: `false`

## Demo Mode

### TRACKTOR_DEMO_MODE

Enable demo mode with sample data.

- **Values**: `true`, `false`
- **Default**: `false`

### FORCE_DATA_SEED

Force database seeding with demo data on startup overwriting the existing data (requires `TRACKTOR_DEMO_MODE=true`).

- **Values**: `true`, `false`
- **Default**: `false`

## Logging

### LOG_REQUESTS

Enable HTTP request logging.

- **Values**: `true`, `false`
- **Default**: `true`

### LOG_LEVEL

Logging verbosity level.

- **Values**: `error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`
- **Default**: `info`

### LOG_DIR

Directory for log files.

- **Values**: Any valid directory path
- **Default**: `./logs`

### BODY_SIZE_LIMIT

Limits the upload size of image/documents.

- **values**: Any number (size in bytes)
- **Defaut**: 512Kb
- **Docker**: Infinity (removes restriction)

## Notes

- Environment variables can be set in a `.env` file in the root directory or as system environment variables
- Restart the application after changing environment variables for changes to take effect
