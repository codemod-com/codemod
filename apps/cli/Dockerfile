FROM node:latest as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g pnpm@latest
RUN pnpm -g add turbo@^1



FROM base AS builder
WORKDIR /app

RUN apk update
RUN apk add --no-cache libc6-compat

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
COPY packages/api-types /app/packages/api-types/
COPY packages/auth /app/packages/auth/
 
# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Assuming "web" is the name entered in the project's package.json: { name: "web" }
RUN turbo prune codemod --docker
 
 

FROM base AS installer
WORKDIR /app

RUN apk update
RUN apk add --no-cache libc6-compat
 
# First install the dependencies
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/full/ .
RUN pnpm install
 
# Build the project
# COPY --from=builder /app/out/full/ .
RUN pnpm build --filter codemod



# FROM base AS runner
# COPY --from=installer /app/node_modules/.pnpm/@ast-grep+napi-linux-arm64-musl@0.24.1/ ./node_modules/.pnpm/@ast-grep+napi-linux-arm64-musl@0.24.1/
# COPY --from=installer /app/apps/cli/node_modules/ ./apps/cli/node_modules/

# WORKDIR /app
# COPY --from=installer /app/apps/cli ./apps/cli
 
CMD node apps/cli/dist/index.cjs
