FROM node:19-alpine3.16

WORKDIR /opt/studio-backend

RUN npm install -g pnpm

COPY ./package.json ./pnpm-lock.yaml /opt/studio-backend/

RUN pnpm install

COPY ./tsconfig.json /opt/studio-backend/
COPY ./src /opt/studio-backend/src

