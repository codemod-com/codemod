# Backend

This is the backend for Codemod.com products.

## Local Development

This project utilizes Node.js, PNPM, Fastify, and Prisma ORM. Ensure to provide necessary environment variables which can be found in `.env.example` or `docker-compose.yml`.

### Setting Up Environment

To set up the database and Redis:

```bash
docker-compose up -d
```

To generate the Prisma client:

```bash
pnpm --filter backend db:generate
```

### Building and Running

To build the application:

```bash
pnpm --filter backend build
```

To start the server application:

```bash
pnpm --filter backend start
```

### Development with Docker

To run the backend with Docker:

```bash
docker-compose up -d && docker-compose -f apps/backend/docker-compose.yml up --build
```

### Testing

To run unit tests:

```bash
docker-compose up -d database && pnpm --filter backend test
```

### Seeds & Migrations

To run the seeder script:

```bash
docker-compose up -d database && pnpm --filter backend db:seed
```
To generate a new migration:

```bash
docker-compose up -d database && pnpm --filter backend db:migrate:generate
```

To apply migrations:

```bash
docker-compose up -d database && pnpm --filter backend db:migrate:apply
```
