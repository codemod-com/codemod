FROM --platform=linux/amd64 node:19-alpine3.16

WORKDIR /app/

RUN npm install -g pnpm

COPY ./package.json ./pnpm-workspace.yaml ./pnpm-lock.yaml /app/
COPY ./apps/backend/package.json /app/apps/backend/
COPY ./packages /app/packages/

RUN pnpm install

COPY ./apps/backend/prisma /app/apps/backend/prisma/
COPY ./apps/backend/tsconfig.json /app/apps/backend/
COPY ./apps/backend/esbuild.config.js /app/apps/backend/
COPY ./apps/backend/src /app/apps/backend/src/

RUN pnpm build --filter @codemod-com/filemod @codemod-com/utilities @codemod-com/backend

WORKDIR /app/apps/backend

RUN pnpm db:generate

RUN pnpm build

EXPOSE 8081

CMD ["pnpm", "run", "start"]
