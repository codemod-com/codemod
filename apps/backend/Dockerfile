FROM node:20-alpine3.16 as builder

WORKDIR /app

RUN npm install -g pnpm

COPY ./package.json ./turbo.json ./pnpm-workspace.yaml ./pnpm-lock.yaml /app/
COPY ./apps/backend/package.json /app/apps/backend/

COPY ./packages/tsconfig /app/packages/tsconfig/
COPY ./packages/utilities /app/packages/utilities/
COPY ./packages/filemod /app/packages/filemod/
COPY ./packages/telemetry /app/packages/telemetry/

RUN pnpm install

COPY ./apps/backend/tsconfig.json /app/apps/backend/
COPY ./apps/backend/esbuild.config.js /app/apps/backend/
COPY ./apps/backend/prisma /app/apps/backend/prisma/
COPY ./apps/backend/src /app/apps/backend/src/

RUN pnpm build --filter @codemod-com/filemod --filter @codemod-com/utilities --filter @codemod-com/backend

RUN pnpm --filter backend db:generate

FROM node:20-alpine3.16

WORKDIR /app

COPY --from=builder /app/apps/backend/package.json /app
COPY --from=builder /app/apps/backend/build /app/build
COPY --from=builder /app/apps/backend/prisma /app/prisma

EXPOSE 8081

CMD ["sh", "-c", "npx prisma migrate deploy && node build/index.js"]
