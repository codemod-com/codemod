FROM node:20-alpine3.16 as builder

WORKDIR /app

RUN npm install -g pnpm

COPY ./package.json ./turbo.json ./pnpm-workspace.yaml ./pnpm-lock.yaml ./.npmrc /app/
COPY ./apps/backend/package.json /app/apps/backend/

COPY ./packages/tsconfig /app/packages/tsconfig/
COPY ./packages/utilities /app/packages/utilities/
COPY ./packages/filemod /app/packages/filemod/
COPY ./packages/telemetry /app/packages/telemetry/
COPY ./packages/database /app/packages/database/
COPY ./packages/runner /app/packages/runner/
COPY ./packages/printer /app/packages/printer/
COPY ./packages/workflow /app/packages/workflow/
COPY ./packages/api-types /app/packages/api-types/
COPY ./packages/auth /app/packages/auth/

RUN pnpm install

COPY ./apps/backend/tsconfig.json /app/apps/backend/
COPY ./apps/backend/esbuild.config.js /app/apps/backend/
COPY ./apps/backend/reset.d.ts /app/apps/backend/
COPY ./apps/backend/src /app/apps/backend/src/

COPY ./node_modules/prisma-json-types-generator /app/node_modules/prisma-json-types-generator/

RUN pnpm build --filter @codemod-com/backend

FROM node:20-alpine3.16

RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/apps/backend/package.json /app
COPY --from=builder /app/apps/backend/build /app/build
COPY --from=builder /app/packages /app/packages

COPY --from=builder /app/node_modules/prisma-json-types-generator /app/node_modules/prisma-json-types-generator/
COPY --from=builder /app/node_modules/prisma-json-types-generator /app/packages/database/node_modules/prisma-json-types-generator/

EXPOSE 8081

CMD cd packages/database && pnpx prisma migrate deploy && pnpx prisma generate && cd - && node build/index.js
