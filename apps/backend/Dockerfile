FROM node:20-alpine3.16 as base

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

RUN pnpm install
RUN pnpm build --filter @codemod-com/backend

FROM base AS runner
# Copy stuff for prisma to work
COPY --from=builder /app/node_modules/.pnpm/@prisma+client@5.15.1_prisma@5.15.1/node_modules/.prisma/ ./node_modules/.pnpm/@prisma+client@5.15.1_prisma@5.15.1/node_modules/.prisma/

WORKDIR /app
COPY --from=builder /app/apps/backend ./apps/backend
COPY --from=builder /app/packages/database ./packages/database

CMD cd packages/database && pnpm dlx prisma@latest migrate deploy && cd - && node apps/backend/build/index.js

