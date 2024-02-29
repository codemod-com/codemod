FROM node:19-alpine3.16

WORKDIR /app/

RUN npm install -g pnpm

COPY ./apps/studio-backend/package.json ./apps/studio-backend/pnpm-lock.yaml /app/apps/studio-backend/
COPY ./pnpm-workspace.yaml /app/
COPY ./packages /app/packages/
RUN pnpm install

COPY ./apps/studio-backend/prisma /app/apps/studio-backend/prisma/
COPY ./apps/studio-backend/tsconfig.json /app/apps/studio-backend/
COPY ./apps/studio-backend/src /app/apps/studio-backend/src/

WORKDIR /app/apps/studio-backend
RUN pnpm build:ncc
EXPOSE 8081
CMD node ./build-ncc/index.js
