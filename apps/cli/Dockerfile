FROM node:latest as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g pnpm@latest
RUN pnpm -g add turbo@^1



FROM base AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends libc6

COPY package.json turbo.json pnpm-workspace.yaml pnpm-lock.yaml /app/
COPY apps/cli /app/apps/cli/

COPY packages/tsconfig /app/packages/tsconfig/
COPY packages/utilities /app/packages/utilities/
COPY packages/filemod /app/packages/filemod/
COPY packages/telemetry /app/packages/telemetry/
COPY packages/database /app/packages/database/
COPY packages/runner /app/packages/runner/
COPY packages/printer /app/packages/printer/
COPY packages/workflow /app/packages/workflow/
COPY packages/codemod-utils /app/packages/codemod-utils/
COPY packages/api-types /app/packages/api-types/
COPY packages/auth /app/packages/auth/
 
# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Assuming "web" is the name entered in the project's package.json: { name: "web" }
RUN turbo prune codemod --docker



FROM base AS installer
WORKDIR /app

# Update the package list and install necessary packages
RUN apt-get update && apt-get install -y --no-install-recommends libc6
 
# First install the dependencies
COPY --from=builder /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN pnpm build:prod --filter codemod

RUN pnpm deploy --filter=codemod --prod /prod/cli



FROM base AS runner

COPY --from=installer /prod/cli /prod/cli
WORKDIR /prod/cli
CMD node dist/index.cjs whoami
