# Database Structure

This directory contains the database configuration, migrations, and seeders for the vehicle tracking application.

## Structure

```
src/db/
├── db.ts              # Database connection configuration
├── index.ts           # Migration runner and utilities
├── init.ts            # Database initialization
├── migrate.ts         # CLI migration tool
├── migrations/        # Database schema migrations
│   └── 20250806_00_init.ts
└── seeders/          # Database seeders
    └── index.ts
```

## Usage

### Running Migrations

```bash
npm run db:migrate
```

### Seeding Database

```bash
npm run db:seed
```

### Development

The application automatically runs migrations and seeds data on startup based on environment variables:

- `DEMO_MODE=true` - Seeds with sample data
- `AUTH_PIN` - Sets the authentication PIN

## Migration Strategy

- Migrations use proper table creation with foreign key constraints
- No data loss occurs during migrations (no `sync({ force: true })`)
- Transactions ensure atomicity
- Proper rollback support

## Environment Variables

- `DB_PATH` - SQLite database file path (default: ./vehicles.db)
- `DEMO_MODE` - Enable demo data seeding (default: false)
- `AUTH_PIN` - Set authentication PIN
- `SHOW_SQL` - Show SQL queries in console (default: false)
