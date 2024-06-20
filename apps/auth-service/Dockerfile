FROM node:20-alpine3.16 as builder

WORKDIR /app

RUN npm install -g pnpm

COPY ./package.json ./turbo.json ./pnpm-workspace.yaml ./pnpm-lock.yaml /app/
COPY ./apps/auth-service/package.json /app/apps/auth-service/

COPY ./packages/tsconfig /app/packages/tsconfig/
COPY ./packages/utilities /app/packages/utilities/
COPY ./packages/database /app/packages/database/

RUN pnpm install

COPY ./apps/auth-service/tsconfig.json /app/apps/auth-service/
COPY ./apps/auth-service/esbuild.config.js /app/apps/auth-service/
COPY ./apps/auth-service/src /app/apps/auth-service/src/

RUN pnpm build --filter @codemod-com/utilities --filter @codemod-com/database --filter @codemod-com/auth-service

FROM node:20-alpine3.16

WORKDIR /app

COPY --from=builder /app/apps/auth-service/package.json /app
COPY --from=builder /app/apps/auth-service/build /app/build
COPY --from=builder /app/packages /app/packages

EXPOSE 8084

CMD ["sh", "-c", "npx prisma migrate deploy && node build/index.js"]
