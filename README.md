# 10×arch 🏗️

A modern web application for learning and practicing system design concepts. Built with the T3 Stack.

## Our Mission 🌟

This project is part of a charitable initiative. All profits generated from commercial use of this software will be donated to Children of Palestine through trusted organisations.

## Features ✨

- Interactive system design learning environment
- Modern tech stack with Next.js, Drizzle, and Tailwind CSS
- Type-safe API with tRPC
- Comprehensive testing setup with Vitest

## Tech Stack 💻

- [Next.js](https://nextjs.org) - React framework
- [Drizzle](https://orm.drizzle.team) - TypeScript ORM
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [tRPC](https://trpc.io) - End-to-end typesafe APIs
- [Vitest](https://vitest.dev) - Unit testing framework

## Getting Started 🚀

1. Clone the repository:

```bash
git clone https://github.com/AhmadMHawwash/system-design-playground.git
cd system-design-playground
```

2. Install dependencies:

```bash
yarn
```

3. Set up your environment variables:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your configuration.

4. Start the development server:

```bash
yarn dev
```

## Docker Development Environment

For contributors and maintainers, we've containerized the application to make setup easy without requiring API keys for third-party services.

### Quick Start for Contributors

1. **Prerequisites**: Install [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

2. **Clone and start the application**:
   ```bash
   git clone https://github.com/yourusername/system-design-playground.git
   cd system-design-playground
   docker-compose up
   ```

3. **Access the application**: Visit http://localhost:3000

That's it! The containers will automatically:
- Set up the PostgreSQL database
- Run migrations and seed data
- Start the Next.js development server

### Development Mode Features

In development mode:
- Authentication with Clerk is mocked - you'll be logged in automatically
- A test user with 10,000 credits is created
- Rate limiting is handled in-memory instead of using Upstash
- Database persistence is maintained between restarts

The only requirement is an OpenAI API key if you want to test AI features. Set it in a `.env` file:
```
OPENAI_API_KEY=your_key_here
```

For more information, see [README.docker.md](./README.docker.md) and [README.database.md](./README.database.md).

## Contributing 🤝

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repo and create your feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## License ⚖️

This project is licensed under the Hippocratic License 3.0 with BDS module (HL3-BDS) - see the [LICENSE](LICENSE) file for details. This ethical license ensures that the software is used in ways that respect human rights and the environment. The Hippocratic License prohibits uses that violate human rights principles or cause harm to individuals and communities, including the Boycott, Divestment, Sanctions (BDS) clause. While the software is free to use, any commercial use of this software by the original author will result in profits being donated to charitable causes.
