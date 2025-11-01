# Installation
There are couple of ways to install the tracktor app.

## Docker Compose (Recommended)
The recommended way to install tracktor is by using Docker Compose. This method ensures that all dependencies are properly managed and the application runs in an isolated environment.

1. Make sure you have Docker and Docker Compose installed on your system.

2. Create a `docker-compose.yml` file with the following content:

```yaml
services:
  app:
    image: ghcr.io/javedh-dev/tracktor:latest # Use a specific version tag for production
    container_name: tracktor-app
    restart: always
    ports:
      - "3333:3000"
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

3. Start the application using Docker Compose:

```bash
docker-compose up -d
```
4. Access the application by navigating to `http://<your_ip_address>:3333` in your web browser.

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


## Manual Docker Installation
If you prefer not to use Docker Compose, you can manually run the Tracktor application using Docker
1. Make sure you have Docker installed on your system.
2. Pull the latest Tracktor image from GitHub Container Registry:

```bash
docker pull ghcr.io/javedh-dev/tracktor:latest
```

3. Create a Docker volume to persist data:

```bash
docker volume create tracktor-data
```

4. Run the Tracktor container with the necessary configurations:

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
5. Access the application by navigating to `http://<your_ip_address>:3333` in your web browser.

### Updating Tracktor
To update Tracktor to the latest version, follow these steps:
1. Stop the running Tracktor container:

```bash
docker stop tracktor-app
```
2. Remove the existing Tracktor container:

```bash
docker rm tracktor-app
```
3. Pull the latest Tracktor image from GitHub Container Registry:
```bash
docker pull ghcr.io/javedh-dev/tracktor:latest
```
4. Re-run the Tracktor container with the same configurations as before:
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
5. Access the application by navigating to `http://<your_ip_address>:3333` in your web browser.

### Uninstalling Tracktor
To uninstall Tracktor and remove all associated data, follow these steps:
1. Stop the running Tracktor container:
```bash
docker stop tracktor-app
```
2. Remove the Tracktor container:
```bash
docker rm tracktor-app
```
3. Remove the Docker volume that contains Tracktor data:
```bash
docker volume rm tracktor-data
```

## Proxmox LXC Setup
To set up Tracktor in a Proxmox LXC container, Please use [Community-Scripts](https://community-scripts.github.io/ProxmoxVE/scripts?id=tracktor) by following the instructions provided there for a streamlined installation process.

## Local Development Setup
To set up Tracktor for local development, follow these steps:

1. Ensure you have Node.js and npm installed on your system.
2. Clone the Tracktor repository from GitHub:

```bash
git clone https://github.com/javedh-dev/tracktor.git
cd tracktor
```
3. Install the required dependencies:

```bash
npm install
```
4. Update the environment variables as needed in the `.env` file in root directory.

5. Migrate the database:
```bash
npm run db:migrate:dev
```

6. Start the development server:
```bash
npm run dev
```

7. Access the application by navigating to `http://localhost:5173` in your web browser.
The app is now running in development mode. Both frontend and backend will automatically reload upon code changes. Frontend runs on port 5173 and backend on port 3000 by default.

## Additional Configuration
For more configuration options and environment variables, please refer to the official documentation.

## Troubleshooting
If you encounter any issues during installation or setup, please check the logs of the Docker container or the terminal output for error messages. You can also refer to the GitHub repository for known issues and solutions.
