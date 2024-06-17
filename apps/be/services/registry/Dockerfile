FROM node:20-alpine3.16 as builder

WORKDIR /app

RUN npm install -g pnpm

COPY ./package.json ./turbo.json ./pnpm-workspace.yaml ./pnpm-lock.yaml /app/
COPY ./apps/backend/package.json /app/apps/backend/


COPY ./packages/database /app/packages/database/
COPY ./packages/tsconfig /app/packages/tsconfig/
COPY ./packages/utilities /app/packages/utilities/

RUN pnpm install

COPY ./apps/backend/tsconfig.json /app/apps/backend/
COPY ./apps/backend/services/auth/build.js /app/apps/backend/services/auth/
COPY ./apps/backend/services/auth/src /app/apps/backend/services/auth/src/

RUN pnpm db:generate
RUN pnpm ---filter backend build:auth

RUN pnpm build ---filter @codemod-com/utilities --filter @codemod-com/database

FROM node:20-alpine3.16

WORKDIR /app

COPY --from=builder /app/apps/backend/package.json /app
COPY --from=builder /app/apps/backend/services/auth/build /app/build

EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy && node build/index.js"]
