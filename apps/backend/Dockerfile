FROM node:20.18-alpine as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g pnpm@latest
RUN pnpm -g add turbo@^1



FROM base AS builder
WORKDIR /app

RUN apk update
RUN apk add --no-cache libc6-compat

COPY package.json turbo.json pnpm-workspace.yaml pnpm-lock.yaml /app/
COPY apps/backend /app/apps/backend/

COPY packages/tsconfig /app/packages/tsconfig/
COPY packages/utilities /app/packages/utilities/
COPY packages/filemod /app/packages/filemod/
COPY packages/telemetry /app/packages/telemetry/
COPY packages/database /app/packages/database/
COPY packages/runner /app/packages/runner/
COPY packages/printer /app/packages/printer/
COPY packages/workflow /app/packages/workflow/
COPY packages/api-types /app/packages/api-types/
COPY packages/codemod-utils /app/packages/codemod-utils/
COPY packages/auth /app/packages/auth/

RUN turbo prune @codemod-com/backend --docker



FROM base AS installer
WORKDIR /app

RUN apk update
RUN apk add --no-cache libc6-compat

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm build --filter @codemod-com/backend



FROM base AS runner
# Copy stuff for prisma to work
COPY --from=installer /app/node_modules/.pnpm/@prisma+client@5.15.1_prisma@5.15.1/node_modules/.prisma/ ./node_modules/.pnpm/@prisma+client@5.15.1_prisma@5.15.1/node_modules/.prisma/

RUN apk update
RUN apk add --no-cache openssl

WORKDIR /app
COPY --from=installer /app/apps/backend ./apps/backend
COPY --from=installer /app/packages/database ./packages/database

CMD node apps/backend/build/index.cjs
