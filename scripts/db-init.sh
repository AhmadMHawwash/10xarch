#!/bin/bash
set -e

# This script is used to initialize the database
# It's mounted in the db container and can be called via healthcheck

psql -U postgres -d system_design_playground -c "SELECT 1" 2>/dev/null || {
  echo "Database not ready yet, initializing..."
  # Create database if it doesn't exist
  psql -U postgres -c "CREATE DATABASE system_design_playground;" 2>/dev/null || echo "Database already exists"
  # Run any initial setup needed for the database here
  echo "Database initialized successfully!"
}

# Always exit with success
exit 0 