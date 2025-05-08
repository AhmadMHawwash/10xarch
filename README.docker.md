# Docker Setup for System Design Playground

This document explains how to run the System Design Playground application using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Development Mode

The Docker setup includes a development mode that uses dummy Clerk authentication credentials. This allows contributors to run the application without needing to create their own Clerk account.

### Required Environment Variables

For development mode, you have two options:

#### Option 1: Use with your own OpenAI API Key (recommended)

Create a `.env` file and set your OpenAI API key:

```
# Your OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here
```

With this configuration:
- You'll have infinite AI credits in the application
- Stripe payment system will be bypassed
- You can test all AI features without limits

#### Option 2: Run without OpenAI API Key

If you don't set an OpenAI API key, the application will run but AI features won't be functional.

All Clerk-related and Stripe-related environment variables are pre-configured with dummy values.

## Database Setup

The Docker setup creates and initializes an empty PostgreSQL database automatically. The initialization script will:

1. Wait for the database to be available
2. Run migrations to create the schema
3. Seed the database with a development user

No manual steps are required! Just start the application:

   ```bash
docker-compose up
   ```

You can verify the user was created with:

   ```bash
   docker-compose exec db psql -U postgres -d system_design_playground -c "SELECT * FROM sdp_users;"
   ```

If you need to reinitialize the database, you can set the `FORCE_DB_INIT` environment variable:

```bash
FORCE_DB_INIT=true docker-compose up
```

The seeded user details:
- ID: `dev_user_123`
- Email: `dev@example.com`
- Initial credits: 10,000

For more details on managing the database, see [README.database.md](./README.database.md).

## Production Mode

If you want to run in production mode with real authentication, edit the docker-compose.yml file and update these environment variables:

```
NODE_ENV=production
CLERK_SECRET_KEY=your_real_clerk_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_real_clerk_publishable_key
STRIPE_SECRET_KEY=your_real_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_real_stripe_publishable_key
OPENAI_API_KEY=your_real_openai_api_key
```

And remove or set to false:
```
NEXT_PUBLIC_DEV_MODE=false
```

## Running the Application

1. Start the application:

```bash
docker-compose up
```

This will:
- Build the container if needed
- Start the database
- Automatically run migrations and seed data
- Start the Next.js application in development mode

2. Access the application at http://localhost:3000

3. To stop the application:

```bash
docker-compose down
```

4. To rebuild the application after making changes:

```bash
docker-compose up --build
```

5. To restart with a fresh database:

```bash
docker-compose down -v && docker-compose up
```

## Data Persistence

PostgreSQL data is persisted in a Docker volume named `postgres_data`. This ensures your data survives container restarts.

If you want to completely reset the database, you can remove the volume:

```bash
docker-compose down -v
```

After resetting, you'll need to run migrations and seed the database again.

## Troubleshooting

- If you encounter build errors related to environment variables, the default development configuration should work without any additional setup.
- To check container logs:
  ```bash
  docker-compose logs app  # For application logs
  docker-compose logs db   # For database logs
  ```
- If the database connection fails, ensure the database container is fully initialized before the application attempts to connect. 
- If you encounter migration errors (like `Can't find meta/_journal.json file`), try rebuilding the containers with:
  ```bash
  docker-compose down -v && docker-compose up --build
  ```
- For persistent migration issues, check that the drizzle directory is properly mounted in the container:
  ```bash
  docker-compose exec app ls -la /app/drizzle/meta
  ``` 