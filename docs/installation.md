# Installation Guide

This guide covers multiple installation methods for Tracktor.

## Docker Compose (Recommended)

Docker Compose is the recommended installation method as it ensures proper dependency management and runs the application in an isolated environment.

### Prerequisites

- Docker and Docker Compose installed on your system

### Steps

1. Create a `docker-compose.yml` file:

```yaml
services:
  app:
    image: ghcr.io/javedh-dev/tracktor:latest # Use a specific version tag for production
    container_name: tracktor-app
    restart: always
    ports:
      - '3333:3000'
    volumes:
      - tracktor-data:/data # Database and uploads are placed in this location
    environment:
      - TRACKTOR_DEMO_MODE=false
      - FORCE_DATA_SEED=false
      - CORS_ORIGINS="http://localhost:3000" # Adjust as needed for your setup
    # OR you can use an env file to manage environment variables
    # env_file:
    #   - ./.env
    # Please check environemnt variables in the documentation for all configuration options
    #
# Adding a volume is recommended to persist data across container restarts
volumes:
  tracktor-data:
    name: tracktor-data
```

2. Start the application:

```bash
docker-compose up -d
```

3. Access the application at `http://<your_ip_address>:3333`.

### Updating Tracktor

To update Tracktor to the latest version using Docker Compose, follow these steps:

1. Stop the running Tracktor container:

```bash
docker-compose down
```

2. Pull the latest Tracktor image from GitHub Container Registry:

```bash
docker-compose pull
```

3. Start the application again using Docker Compose:

```bash
docker-compose up -d --force-recreate
```

4. Access the application by navigating to `http://<your_ip_address>:3333` in your web browser.

### Uninstalling Tracktor

To uninstall Tracktor and remove all associated data, follow these steps:

1. Stop the running Tracktor container:

```bash
docker-compose down
```

2. Remove the Docker volume that contains Tracktor data:

```bash
docker volume rm tracktor-data
```

## Docker (Manual)

### Prerequisites

- Docker installed on your system

### Steps

1. Pull the latest Tracktor image:

```bash
docker pull ghcr.io/javedh-dev/tracktor:latest
```

2. Create a Docker volume:

```bash
docker volume create tracktor-data
```

3. Run the container:

```bash
docker run -d \
    --name tracktor-app \
    -p 3333:3000 \
    -v tracktor-data:/data \ # Database and uploads are placed in this location
    -e TRACKTOR_DEMO_MODE=false \
    -e FORCE_DATA_SEED=false \
    -e CORS_ORIGINS="http://localhost:3000" \ # Adjust as needed for your setup
    ghcr.io/javedh-dev/tracktor:latest
```

4. Access the application at `http://<your_ip_address>:3333`.

### Updating

1. Stop and remove the container:

```bash
docker stop tracktor-app && docker rm tracktor-app
```

2. Pull the latest image:

```bash
docker pull ghcr.io/javedh-dev/tracktor:latest
```

3. Restart the container with the same configuration as before:

```bash
docker run -d \
    --name tracktor-app \
    -p 3333:3000 \
    -v tracktor-data:/data \ # Database and uploads are placed in this location
    -e TRACKTOR_DEMO_MODE=false \
    -e FORCE_DATA_SEED=false \
    -e CORS_ORIGINS="http://localhost:3000" \ # Adjust as needed for your setup
    ghcr.io/javedh-dev/tracktor:latest
```

### Uninstalling

1. Stop and remove the container:

```bash
docker stop tracktor-app && docker rm tracktor-app
```

2. Remove the data volume:

```bash
docker volume rm tracktor-data
```

## Proxmox LXC

For Proxmox LXC container setup, use [Community-Scripts](https://community-scripts.github.io/ProxmoxVE/scripts?id=tracktor) for a streamlined installation process.

## Local Development

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager

### Steps

1. Clone the repository:

```bash
git clone https://github.com/javedh-dev/tracktor.git
cd tracktor
```

2. Install dependencies:

```bash
pnpm install
```

3. Configure environment variables in the `.env` file (refer to [environment.md](./environment.md)).

4. Run database migrations:

```bash
pnpm run db:migrate
```

5. Start the development server:

```bash
pnpm run dev
```

6. Access the application at `http://localhost:5173`.

The development server runs on port 5173 with hot module reloading enabled.

## Configuration

For environment variables and configuration options, refer to the [environment documentation](./environment.md).

## Troubleshooting

- Check Docker container logs: `docker logs tracktor-app`
- For local development, check terminal output for error messages
- Review the [GitHub repository](https://github.com/javedh-dev/tracktor) for known issues and solutions
