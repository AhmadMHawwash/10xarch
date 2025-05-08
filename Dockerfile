# Use Node.js LTS version as the base image with full Linux instead of Alpine
FROM node:18-slim AS app

# Set working directory
WORKDIR /app

# Set essential environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development
ENV NEXT_PUBLIC_DEV_MODE=true

# Install all dependencies (including dev deps)
COPY package.json yarn.lock ./
RUN yarn install && \
    yarn cache clean

# Install PostgreSQL client for database health checks (using slim package)
RUN apt-get update && \
    apt-get install -y --no-install-recommends postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# Copy only necessary files
COPY tsconfig.json next.config.js ./
COPY src ./src
COPY public ./public
COPY scripts ./scripts
COPY drizzle ./drizzle
COPY tailwind.config.ts postcss.config.cjs ./

# Create dummy environment variables
RUN touch .env.local && \
    echo "DATABASE_URL=postgresql://postgres:postgres@db:5432/system_design_playground" >> .env.local && \
    echo "OPENAI_API_KEY=sk-dummy-openai-key" >> .env.local && \
    echo "NEXT_PUBLIC_DEV_MODE=true" >> .env.local && \
    echo "NEXT_PUBLIC_APP_URL=http://localhost:3000" >> .env.local

# Make the initialization script executable
COPY scripts/init-container.sh /app/init-container.sh
RUN chmod +x /app/init-container.sh

# Expose the port the app will run on
EXPOSE 3000

# Start the application with our initialization script
CMD ["/app/init-container.sh"] 