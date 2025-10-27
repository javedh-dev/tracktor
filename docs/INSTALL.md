## Installation Methods

Choose the installation method that best fits your needs:

- **Docker Compose (Recommended):** Complete setup with all services
- **Docker:** Single container deployment
- **Bare Metal:** Direct installation on your system
- **Proxmox LXC:** Install LXC on proxmox host using [ProxmoxVE Helper Scripts](https://community-scripts.github.io/ProxmoxVE/)
- **Development Setup:** For contributors and developers

## System Requirements

Before installing Tracktor, ensure your system meets these minimum requirements which varies based on the installation type :

| Installation Type     | Hardware Requirements                                                        | Software Dependencies          |
| --------------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| **Docker Compose**    | **-**                                                                        | - docker<br>- compose<br>- git |
| **Docker**            | **-**                                                                        | - docker<br>- git              |
| **Bare Metal**        | **- Memory:** 512MB RAM<br>**- Storage:** 1GB free space                     | - node.js<br>- git             |
| **Proxmox LXC**       | **- Memory:** 512MB RAM<br>**- Storage:** 1GB free space<br>**- CPU:** 1vCPU | - proxmox<br>- lxc             |
| **Development Setup** | [Setup Guide](CONTRIBUTING.md)                       | -                              |

> **Note:** For production deployments, it is recommended to have at least 1GB of RAM and 2GB of free disk space.

## Installation Steps

### Method 1: Docker Compose (Recommended)

Docker Compose provides the easiest way to deploy Tracktor with all services configured automatically.

#### Prerequisites

- Docker and Docker Compose installed on your system
- At least 1GB free disk space

#### Quick Start Steps

**Step 1:** Download or create a `docker-compose.yml` file in your directory:

```bash
# Downlaod Docker compose file
curl -o docker-compose.yml https://raw.githubusercontent.com/javedh-dev/tracktor/refs/heads/dev/scripts/docker/docker-compose.yml
```

```yaml
services:
  app:
    image: ghcr.io/javedh-dev/tracktor:latest
    container_name: tracktor-app
    restart: always
    env_file: .env
    ports:
      - "3333:3000"
    volumes:
      - tracktor-app-data:/data

volumes:
  tracktor-app-data: null
```

**Step 2:** Download the example `.env` file from github

```bash
curl -o .env https://raw.githubusercontent.com/javedh-dev/tracktor/refs/heads/dev/env/.env.prod
```

<!--
OR create the `.env` file and add environement variables as per your requirement.

```bash
touch .env
```

You can check the available environment variables at [ENVIRONMENT](ENVIRONMENT.md).
**Step 3:** Start the application using Docker Compose:
--->

```bash
docker-compose up -d
```

**Step 4:** Access the application:
Open `http://localhost:3333` in your browser

> **Note:** The `-d` flag runs the containers in detached mode.

### Method 2: Docker Installation

For a simpler Docker setup without Docker Compose.

#### Prerequisites

- Docker installed on your system

#### Steps

**Step 1:** Pull the Tracktor Docker image -

```bash
docker pull ghcr.io/javedh-dev/tracktor:latest
```

**Step 2:** Create a persistent volume for data storage -

```bash
docker volume create tracktor-app-data
```

<!-- maybe re-added in the future?
**Step 3:** (Optional) Create a `.env` file for environment variables or download as shown [here](#method-1-docker-compose-recommended) -

```bash
touch .env
```

Add any necessary environment variables as per your requirement.
--->

**Step 3:** Run the container -

```bash
docker run -d --name tracktor -p 3333:3000 -v tracktor-app-data:/data --env-file .env ghcr.io/javedh-dev/tracktor:latest
```

**Step 4:** Access the application -
Open `http://localhost:3333` in your browser

> **Note:** The `-v tracktor-app-data:/data` flag creates a persistent volume for your data.

### Method 3: Bare Metal (Manual) Installation

Install Tracktor directly on your system for more control over the deployment and code transparency.

#### Prerequisites

- Node.js and npm installed
- Git installed

#### Installation Steps

**Step 1:** Clone the repository and checkout main (stable) branch and navigate into it -

```bash
git clone https://github.com/javedh-dev/tracktor.git
git checkout main
cd tracktor
```

**Step 2:** Install dependencies -

```bash
npm install
```

<!-- maybe re-added in the future?
**Step 3:** (Optional) Create a `.env` file for environment variables -

```bash
touch .env
```

Add any necessary environment variables as per your requirement. You can check the available environment variables in the [Configuration Reference](../configuration/environment-variables.md).

> **Note:** Set the `NODE_ENV` variable to `production` in the `.env` file for production deployments.
--->

**Step 3:** Build the application -

```bash
npm run build
```

4. **Start the application:**

   ```bash
   npm run start
   ```

5. **Access the application:**
   Open `http://localhost:3000` in your browser

### Method 4: Proxmox LXC Installation

For installing Tracktor in a lightweight LXC container on a Proxmox host.

#### Prerequisites

- Proxmox VE installed and running
- ProxmoxVE Helper Scripts (see [ProxmoxVE Helper Scripts](https://community-scripts.github.io/ProxmoxVE/))
- At least 1GB free disk space

#### Installation Steps

**Step 1:** Create a new LXC container using the ProxmoxVE Helper Scripts by running the following command on your Proxmox host.

> Reference : [ProxmoxVE Helper Scripts - Tracktor LXC](https://community-scripts.github.io/ProxmoxVE/scripts?id=tracktor)

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/ct/tracktor.sh)"
```

### Method 5: Development Setup

For contributors and developers who want to set up a development environment.

> Please refer to the [Development Setup Guide](CONTRIBUTING.md) for detailed instructions.
