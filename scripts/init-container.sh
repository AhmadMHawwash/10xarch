#!/bin/bash
set -e

echo "=== Container Initialization Script ==="

# Wait for the database to be ready
echo "Waiting for database to be ready..."
timeout=60
while ! pg_isready -h db -U postgres -d system_design_playground -t 1 >/dev/null 2>&1 && [ $timeout -gt 0 ]; do
  timeout=$((timeout-1))
  echo "Waiting for database... ${timeout}s remaining"
  sleep 1
done

if [ $timeout -le 0 ]; then
  echo "Timed out waiting for database"
  exit 1
fi

echo "Database is ready!"

# Check if drizzle/meta directory exists
if [ ! -d "/app/drizzle/meta" ]; then
  echo "Creating drizzle/meta directory..."
  mkdir -p /app/drizzle/meta
fi

# Check if _journal.json exists
if [ ! -f "/app/drizzle/meta/_journal.json" ]; then
  echo "Creating initial migration journal..."
  echo '{"version":"5","dialect":"pg","entries":[]}' > /app/drizzle/meta/_journal.json
  chmod 644 /app/drizzle/meta/_journal.json
fi

# Check if the database has been initialized
echo "Checking if database needs initialization..."
TABLES=$(PGPASSWORD=postgres psql -h db -U postgres -d system_design_playground -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")

if [ "$TABLES" -eq "0" ] || [ "$FORCE_DB_INIT" = "true" ]; then
  echo "Database is empty or force initialization requested. Running migrations..."
  yarn db:migrate
  
  echo "Seeding database with development data..."
  PGPASSWORD=postgres psql -h db -U postgres -d system_design_playground -f /app/scripts/db-seed.sql
  
  echo "Database initialization complete!"
else
  echo "Database already contains tables. Skipping initialization."
  
  # Optional: Run migrations to ensure schema is up to date
  echo "Running migrations to ensure schema is up to date..."
  yarn db:migrate
fi

echo "=== Starting Application ==="
exec yarn dev 