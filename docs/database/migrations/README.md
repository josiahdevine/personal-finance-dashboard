# Database Migrations Guide

This document provides information about the database migration system used in this project.

## Migration Organization

All database migrations are now centralized in the `/migrations` directory at the project root with the following structure:

- `/migrations/sql`: Contains all SQL migration files
- `/migrations/scripts`: Contains migration execution scripts

## Migration Procedure

1. **Creating a Migration**:
   - Create a new SQL file in `/migrations/sql` with a descriptive name and timestamp
   - Format: `YYYYMMDD_description_migration.sql`

2. **Running a Migration**:
   - Use the migration runner script: `node migrations/scripts/run-migration.js`
   - For Neon DB migrations: `node migrations/scripts/run-neon-migration.js`

3. **Tracking Migrations**:
   - All migrations are tracked in the database through a migrations table
   - Each migration is run exactly once and in the correct order

## Migration Files

| Migration File | Purpose | Status |
|----------------|---------|--------|
| `plaid_tables_migration.sql` | Creates Plaid integration tables | Active |
| `salary_table_migration.sql` | Creates salary tracking tables | Active |
| `users_table_migration.sql` | Updates user table structure | Active |

## Migration Scripts

- `run-migration.js`: General migration runner
- `run-neon-migration.js`: Neon DB specific migration runner
- `run-plaid-migration.js`: Plaid specific migration runner

## Best Practices

1. **Testing**: Always test migrations in a development environment before applying to production
2. **Backup**: Create a database backup before running migrations
3. **Atomic Changes**: Keep migrations atomic and focused on a single purpose
4. **Reversibility**: When possible, include a way to reverse/rollback the migration
5. **Documentation**: Document new migrations in this file

## Related Documentation

- [Database Schema](../DATABASE-SCHEMA.md)
- [Database Connector](../database-connector.md)
