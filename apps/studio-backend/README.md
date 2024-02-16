# studio-backend

The backend for the Codemod.com products.

## Developing locally

This project uses Node.js and PNPM. Provide an Open AI API Key as the `OPEN_AI_API_KEY` environment variable.

    pnpm install

### Building and executing

    pnpm build:ncc
    OPEN_AI_API_KEY=sk PORT=8081 pnpm start:ncc

### Watching

    OPEN_AI_API_KEY=sk PORT=8081 pnpm watch

## Developing with Docker

    docker compose build
    docker compose up

## Linting

    pnpm lint:eslint:write
    pnpm lint:prettier:write

## Creating the DATA environment variable

    pnpm ts-node --esm gzipData.ts
