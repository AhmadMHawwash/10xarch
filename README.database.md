# Database Management in Docker

This guide explains how to work with the PostgreSQL database in the Docker environment.

## Development Setup

When running the application with Docker, a PostgreSQL database is automatically created but needs to be initialized with migrations and seeded with an initial development user.

## Database Initialization

After starting the containers, follow these steps to initialize the database:

1. Run migrations to create the database schema:
   ```bash
   docker-compose exec app yarn db:migrate
   ```

2. Seed the database with a development user and initial credits:
   ```bash
   docker-compose exec db psql -U postgres -d system_design_playground -f /app/scripts/db-seed.sql
   ```

This creates:
- The database schema
- A default user (`dev_user_123` with email `dev@example.com`)
- 10,000 initial credits

## Adding Credits

You can add more credits to the default development user in two ways:

### 1. Using the NPM Script

When the containers are running, you can execute:

```bash
# From the host machine
docker-compose exec app yarn db:add-credits
```

By default, this adds 5,000 credits. You can specify a different amount:

```bash
# Add a specific amount (e.g., 10000)
docker-compose exec app yarn db:add-credits 10000
```

### 2. Using SQL Directly

You can also connect to the database and add credits manually:

```bash
# Connect to the database
docker-compose exec db psql -U postgres -d system_design_playground

# Inside the psql shell, run:
UPDATE sdp_credits SET balance = balance + 5000 WHERE user_id = 'dev_user_123';
INSERT INTO sdp_credit_transactions (user_id, amount, type, description, status, created_at) 
VALUES ('dev_user_123', 5000, 'purchase', 'Manually added', 'completed', NOW());
```

## Resetting the Database

If you need to start fresh, you can remove the volume and recreate the containers:

```bash
docker-compose down -v
docker-compose up --build
```

This will recreate an empty database. Remember to run migrations and seed it again:

```bash
docker-compose exec app yarn db:migrate
docker-compose exec db psql -U postgres -d system_design_playground -f /app/scripts/db-seed.sql
```

## Accessing Database Information

You can check the current credit balance with:

```bash
docker-compose exec db psql -U postgres -d system_design_playground -c "SELECT * FROM sdp_credits;"
```

And view the transaction history with:

```bash
docker-compose exec db psql -U postgres -d system_design_playground -c "SELECT * FROM sdp_credit_transactions;"
```

## Database Schema

The database includes the following main tables:

- `sdp_users` - User information
- `sdp_credits` - Credit balances for each user
- `sdp_credit_transactions` - History of credit purchases and usage
- `sdp_playgrounds` - Saved playground data

For the complete schema, refer to `src/server/db/schema.ts`. 