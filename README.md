> ⚠️ **WARNING:**
> Tracktor is under active development. There may be frequent breaking changes, though we are taking precautions but it is **not stable for production use**.
> _Please keep regular backups of your data!_

<div align="center" style="margin-bottom: 20px;">
  <img src="./docs/images/logo.svg" style="height:60px; margin-right: 10px; vertical-align: middle;"/>
  <h1 style="display:inline; font-size: 2.5rem; vertical-align: middle;">Tracktor</h1>
</div>

<div align="center">

![GitHub License](https://img.shields.io/github/license/javedh-dev/tracktor?label=License)
[![Demo Instance](https://img.shields.io/website?url=https://tracktor.bytedge.in&label=Demo&logo=rocket&logoColor=white)](https://tracktor.bytedge.in)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/javedh-dev/tracktor/ci.yml?logo=githubactions&logoColor=white&label=Build)](https://github.com/javedh-dev/tracktor/actions/workflows/ci.yml)
[![GitHub Tag](https://img.shields.io/github/v/tag/javedh-dev/tracktor?logo=docker&logoColor=white&label=Tag)](https://github.com/javedh-dev/tracktor/releases/latest)
[![GitHub Sponsor](https://img.shields.io/github/sponsors/javedh-dev?label=Sponsor&logo=githubsponsors)](https://github.com/sponsors/javedh-dev)

</div>

If you own more than one vehicle, you know the drill: fuel receipts in a drawer, insurance PDFs buried in email, a maintenance date you meant to write down somewhere. Tracktor is a self-hosted app that keeps all of that in one place — fuel logs, service history, insurance and pollution certs, reminders before they lapse, and a dashboard that actually shows you what's going on across your fleet.

Run it on a Raspberry Pi, a home server, or a $5 VPS. Your data stays yours.

<p align="center">
    <image alt="Dashboard" src="./docs/images/tracktor-demo.gif" width="90%" style="border-radius: 10px" />
</p>

## What it does

- **Garage** — Add and manage multiple vehicles, each with its own fuel type and history.
- **Fuel tracking** — Log every fill-up and watch your mileage/efficiency trends over time.
- **Maintenance log** — Keep a full service history per vehicle, and know what's coming up next.
- **Compliance** — Track insurance and pollution (PUCC) certificates, with renewal dates that don't sneak up on you.
- **Reminders** — Get nudged before something expires or a service is due.
- **Expenses & reports** — See what your vehicles actually cost you.
- **Dashboard** — A fleet-wide overview with widgets you can rearrange to your liking.
- **Auth & feature toggles** — Username/password login with sessions, and the ability to turn off features you don't need.
- **11 languages** — English, Hindi, Spanish, French, German, Italian, Arabic, Romanian, Hungarian, Finnish, Russian and Czech.

## Tech stack

SvelteKit (Svelte 5) + Tailwind CSS on the frontend, SvelteKit server routes on the backend, SQLite via Drizzle ORM for storage, shipped as a Docker image.

## Getting started

The fastest way to try Tracktor is Docker Compose:

```yaml
services:
  app:
    image: ghcr.io/javedh-dev/tracktor:latest
    container_name: tracktor-app
    restart: always
    ports:
      - '3333:3000'
    volumes:
      - tracktor-data:/data
volumes:
  tracktor-data:
```

```bash
docker-compose up -d
```

Then open `http://<your_ip_address>:3333`.

For local development, Proxmox LXC setup, reverse proxies, and every configuration option, see the [installation guide](./docs/installation.md).

## Documentation

- [Installation Guide](./docs/installation.md) — Docker, local dev, Proxmox LXC
- [Environment Variables](./docs/environment.md) — every config option, explained
- [Authentication](./docs/authentication.md) — how login and sessions work
- [Feature Toggles](./docs/feature-toggles.md) — turning features on/off
- [Contributing](./docs/contributing.md) — how to get involved

## Contributing

PRs and issues are welcome — read the [contributing guide](./docs/contributing.md) first. If Tracktor is useful to you, a star ⭐ or a [sponsorship](https://github.com/sponsors/javedh-dev) helps keep it going.

## License

MIT — see [LICENSE](LICENSE).

## Contributors

<a href="https://github.com/javedh-dev/tracktor/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=javedh-dev/tracktor"/>
</a>
