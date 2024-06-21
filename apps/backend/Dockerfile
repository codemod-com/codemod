FROM node:20-alpine3.16 as builder

WORKDIR /app

RUN npm install -g pnpm

COPY ./package.json ./turbo.json ./pnpm-workspace.yaml ./pnpm-lock.yaml /app/
COPY ./apps/backend/package.json /app/apps/backend/

COPY ./packages/tsconfig /app/packages/tsconfig/
COPY ./packages/utilities /app/packages/utilities/
COPY ./packages/filemod /app/packages/filemod/
COPY ./packages/telemetry /app/packages/telemetry/
COPY ./packages/database /app/packages/database/

RUN pnpm install

COPY ./apps/backend/tsconfig.json /app/apps/backend/
COPY ./apps/backend/esbuild.config.js /app/apps/backend/
COPY ./apps/backend/src /app/apps/backend/src/

RUN pnpm build --filter @codemod-com/filemod --filter @codemod-com/utilities --filter @codemod-com/database --filter @codemod-com/backend

RUN pnpm db:migrate:deploy

FROM node:20-alpine3.16

WORKDIR /app

COPY --from=builder /app/apps/backend/package.json /app
COPY --from=builder /app/apps/backend/build /app/build
COPY --from=builder /app/packages /app/packages

EXPOSE 8081

CMD ["node build/index.js"]
