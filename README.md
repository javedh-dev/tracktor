> ⚠️ **WARNING:**
> Tracktor is under active development. There may be frequent breaking changes, though we are taking precautions but it is **not stable for production use**.
> _Please keep regular backups of your data!_

<div align="center" style="margin-bottom: 20px;">
  <img src="./docs/images/logo.svg" style="height:60px; margin-right: 10px; vertical-align: middle;"/>
  <h1 style="display:inline; font-size: 2.5rem; vertical-align: middle;">Tracktor</h1>
</div>

![GitHub License](https://img.shields.io/github/license/javedh-dev/tracktor?label=License)
[![Demo Instance](https://img.shields.io/website?url=https://tracktor.bytedge.in&label=Demo&logo=rocket&logoColor=white)](https://tracktor.bytedge.in)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/javedh-dev/tracktor/ci.yml?logo=githubactions&logoColor=white&label=Build)](https://github.com/javedh-dev/tracktor/actions/workflows/ci.yml)
[![GitHub Tag](https://img.shields.io/github/v/tag/javedh-dev/tracktor?logo=docker&logoColor=white&label=Tag)](https://github.com/javedh-dev/tracktor/releases/latest)
[![GitHub Sponsor](https://img.shields.io/github/sponsors/javedh-dev?label=Sponsor&logo=githubsponsors)](https://github.com/sponsors/javedh-dev)

<p align="center" style="font-size: 1.2rem;">
  <b>Tracktor</b> is an open-source web application for <b>comprehensive vehicle management</b>.<br>
  Easily track <span style="color:#4ade80;">⛽ fuel</span> consumption, <span style="color:#fbbf24;">🛠️ maintenance</span>, <span style="color:#60a5fa;">🛡️ insurance</span>, and <span style="color:#a78bfa;">📄 regulatory documents</span> for all your vehicles in one place.
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/images/dashboard-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./docs/images/dashboard-light.png" />
    <img alt="Dashboard" src="./docs/images/dashboard-light.png" width="90%" style="border-radius: 10px" />
  </picture>
</p>

## ✨ Features

- 🚗 **Vehicle Management:** Add, edit, and manage multiple vehicles with support for different fuel types.
- ⛽ **Fuel Tracking:** Log fuel refills and monitor fuel efficiency over time.
- 🛠️ **Maintenance Log:** Record and view maintenance history for each vehicle.
- 📄 **Document Tracking:** Track insurance and pollution certificates with renewal dates.
- 🔔 **Reminders:** Set and manage reminders for maintenance, renewals, and other vehicle events.
- 📊 **Dashboard:** Visualize key metrics, analytics, and upcoming renewals.
- 🔒 **User Authentication:** Secure username/password authentication with session management.
- 🎨 **Feature Toggles:** Enable or disable specific features based on your needs.

## 🖼️ Screenshots

<p align="center">
  <h3>🔐 Login Page</h3><br>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/images/login-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./docs/images/login-light.png" />
    <img alt="Login Page" src="./docs/images/login-light.png" style="border-radius: 10px" />
  </picture>
</p>
<p align="center">
  <h3>📈 Charts</h3><br>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/images/charts-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./docs/images/charts-light.png" />
    <img alt="Login Page" src="./docs/images/charts-light.png" style="border-radius: 10px" />
  </picture>
</p>
<p align="center">
  <h3>⛽ Fuel Log</h3><br>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/images/fuel-logs-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./docs/images/fuel-logs-light.png" />
    <img alt="Fuel Log" src="./docs/images/fuel-log-light.png" style="border-radius: 10px" />
  </picture>
</p>
<p align="center">
  <h3>🛠️ Maintenance Log</h3><br>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/images/maintenance-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./docs/images/maintenance-light.png" />
    <img alt="Maintenance Log" src="./docs/images/maintenance-light.png" style="border-radius: 10px" />
  </picture>
</p>
<p align="center">
  <h3>🛡️ Insurance Details</h3><br>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/images/insurance-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./docs/images/insurance-light.png" />
    <img alt="Insurance Details" src="./docs/images/insurance-light.png" style="border-radius: 10px" />
  </picture>
</p>
<p align="center">
  <h3>📄 PUCC Details</h3><br>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/images/pucc-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./docs/images/pucc-light.png" />
    <img alt="PUCC Details" src="./docs/images/pucc-light.png" style="border-radius: 10px" />
  </picture>
</p>

## 🛠️ Tech Stack

- 🎨 **Frontend:** SvelteKit, Tailwind CSS, Svelte 5
- 🖥️ **Backend:** SvelteKit Server Routes
- 🗄️ **Database:** SQLite with Drizzle ORM
- 🐳 **Deployment:** Docker & Docker Compose

## 🚀 Getting Started

Refer to the [installation guide](./docs/installation.md) for setup instructions.

## 📚 Documentation

- [Installation Guide](./docs/installation.md) - Setup instructions for Docker, local development, and Proxmox LXC
- [Authentication](./docs/authentication.md) - User authentication and session management
- [Environment Variables](./docs/environment.md) - Configuration options
- [Feature Toggles](./docs/feature-toggles.md) - Customizing enabled features
- [Contributing](./docs/contributing.md) - Guidelines for contributing

## 🤝 Contributing

Contributions are welcome! Please read the [contributing guidelines](./docs/contributing.md) before submitting a pull request.

Consider supporting this project by giving it a star ⭐ or [sponsoring](https://github.com/sponsors/javedh-dev).

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📊 Repository activity

![Activities](https://repobeats.axiom.co/api/embed/d41931a72a5373ee0d2073e72279862171468023.svg 'Repobeats analytics image')

## ⭐ Star History

<a href="https://www.star-history.com/#javedh-dev/tracktor&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=javedh-dev/tracktor&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=javedh-dev/tracktor&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=javedh-dev/tracktor&type=Date" />
 </picture>
</a>

## 🤝 Contributors

<a href="https://github.com/javedh-dev/tracktor/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=javedh-dev/tracktor"/>
</a>
