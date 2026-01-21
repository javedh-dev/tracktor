# Reverse Proxy Configuration

This guide explains how to configure Tracktor to work behind a reverse proxy under a sub-path.

## Overview

By default, Tracktor is served from the root path (`/`). However, you may want to host it under a sub-path like `/tracktor/` when:

- Running multiple applications on the same domain
- Using a reverse proxy like Nginx or Traefik
- Organizing services under a centralized gateway

## Configuration

### Setting the Base URL

Configure Tracktor to serve from a sub-path using the `BASE_URL` environment variable:

```bash
BASE_URL=/tracktor
```

**Important Rules:**

- Must start with `/`
- Must NOT end with `/`
- Examples: `/tracktor`, `/apps/vehicle-tracker`, `/services/tracktor`

### Docker Compose Example

```yaml
services:
  app:
    image: ghcr.io/javedh-dev/tracktor:latest
    container_name: tracktor-app
    restart: always
    ports:
      - '3000:3000'
    volumes:
      - tracktor-data:/data
    environment:
      - BASE_URL=/tracktor # Serve under /tracktor path
      - CORS_ORIGINS=https://example.com

volumes:
  tracktor-data:
```

### Environment File (.env)

```bash
# .env file
BASE_URL=/tracktor
```

## Reverse Proxy Examples

### Nginx

```nginx
server {
    listen 80;
    server_name example.com;

    location /tracktor/ {
        proxy_pass http://localhost:3000/tracktor/;
        proxy_http_version 1.1;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Disable cache for dynamic content
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Apache

```apache
<VirtualHost *:80>
    ServerName example.com

    ProxyPreserveHost On
    ProxyPass /tracktor/ http://localhost:3000/tracktor/
    ProxyPassReverse /tracktor/ http://localhost:3000/tracktor/

    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/tracktor/(.*)$ ws://localhost:3000/tracktor/$1 [P,L]
</VirtualHost>
```

### Traefik (Docker Labels)

```yaml
services:
  app:
    image: ghcr.io/javedh-dev/tracktor:latest
    environment:
      - BASE_URL=/tracktor
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.tracktor.rule=Host(`example.com`) && PathPrefix(`/tracktor`)'
      - 'traefik.http.routers.tracktor.entrypoints=web'
      - 'traefik.http.services.tracktor.loadbalancer.server.port=3000'
```

### Caddy

```caddy
example.com {
    handle_path /tracktor/* {
        reverse_proxy localhost:3000
    }
}
```

## Testing Your Configuration

1. **Start Tracktor** with the `BASE_URL` environment variable set
2. **Configure your reverse proxy** to forward requests to Tracktor
3. **Access the application** at `https://example.com/tracktor/`
4. **Verify assets load correctly**:
   - Check browser console for any 404 errors
   - Ensure CSS and JavaScript files load from the correct path
   - Test navigation between different pages
   - Verify API calls work correctly

## Troubleshooting

### Assets Not Loading (404 Errors)

**Problem**: CSS, JavaScript, or images return 404 errors

**Solution**:

- Ensure `BASE_URL` matches your reverse proxy path exactly
- Verify your reverse proxy is forwarding the sub-path correctly
- Check that `BASE_URL` starts with `/` and does NOT end with `/`

### API Calls Failing

**Problem**: API requests return 404 or CORS errors

**Solution**:

- Verify `CORS_ORIGINS` includes your domain
- Ensure reverse proxy is passing headers correctly
- Check that API routes are being proxied with the base path

### Redirect Loops

**Problem**: Application keeps redirecting

**Solution**:

- Verify your reverse proxy is not stripping the base path incorrectly
- Ensure `X-Forwarded-Proto` header is set correctly for HTTPS
- Check that your reverse proxy configuration includes the trailing slash consistently

### WebSocket Connection Issues

**Problem**: Real-time features don't work

**Solution**:

- Ensure your reverse proxy supports WebSocket upgrades
- Verify `Upgrade` and `Connection` headers are being forwarded
- Check firewall rules allow WebSocket connections

## Common Pitfalls

1. **Trailing Slashes**: Don't add a trailing slash to `BASE_URL`
   - ✅ Correct: `BASE_URL=/tracktor`
   - ❌ Wrong: `BASE_URL=/tracktor/`

2. **Missing Leading Slash**: Always start `BASE_URL` with `/`
   - ✅ Correct: `BASE_URL=/tracktor`
   - ❌ Wrong: `BASE_URL=tracktor`

3. **Proxy Path Mismatch**: Ensure reverse proxy path matches `BASE_URL`
   - If `BASE_URL=/tracktor`, proxy should forward to `/tracktor/`

4. **CORS Configuration**: Update `CORS_ORIGINS` when using a different domain
   - Set to your domain instead of `*` for better security

## Advanced: Multiple Instances

You can run multiple Tracktor instances under different sub-paths:

```yaml
# docker-compose.yml
services:
  tracktor-personal:
    image: ghcr.io/javedh-dev/tracktor:latest
    environment:
      - BASE_URL=/personal/tracktor
    volumes:
      - personal-data:/data

  tracktor-fleet:
    image: ghcr.io/javedh-dev/tracktor:latest
    environment:
      - BASE_URL=/fleet/tracktor
    volumes:
      - fleet-data:/data
```

Configure your reverse proxy to route to each instance accordingly.

## See Also

- [Installation Guide](./installation.md)
- [Environment Variables](./environment.md)
- [Authentication](./authentication.md)
