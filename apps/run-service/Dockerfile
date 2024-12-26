FROM node:20-alpine3.16 as builder

WORKDIR /app

RUN npm install -g pnpm

COPY ./package.json ./turbo.json ./pnpm-workspace.yaml ./pnpm-lock.yaml /app/
COPY ./apps/run-service/package.json /app/apps/run-service/

COPY ./packages/tsconfig /app/packages/tsconfig/
COPY ./packages/utilities /app/packages/utilities/
COPY ./packages/filemod /app/packages/filemod/
COPY ./packages/database /app/packages/database/
COPY ./packages/api-types /app/packages/api-types/
COPY ./packages/auth /app/packages/auth/

RUN pnpm install

COPY ./apps/run-service/tsconfig.json /app/apps/run-service/
COPY ./apps/run-service/esbuild.config.js /app/apps/run-service/
COPY ./apps/run-service/src /app/apps/run-service/src/

RUN pnpm build --filter @codemod-com/utilities --filter @codemod-com/run-service

FROM node:20-alpine3.16

RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/apps/run-service/package.json /app
COPY --from=builder /app/apps/run-service/build /app/build
COPY --from=builder /app/packages /app/packages

EXPOSE 8086

CMD node build/index.js
