FROM node:19-alpine3.16

WORKDIR /app/

RUN npm install -g pnpm

COPY ./apps/backend/package.json ./apps/backend/pnpm-lock.yaml /app/apps/backend/
COPY ./pnpm-workspace.yaml /app/
COPY ./packages /app/packages/

RUN pnpm install

COPY ./apps/backend/prisma /app/apps/backend/prisma/
COPY ./apps/backend/tsconfig.json /app/apps/backend/
COPY ./apps/backend/src /app/apps/backend/src/

# WORKDIR /app/backend

CMD pnpm --filter @codemod-com/backend watch
