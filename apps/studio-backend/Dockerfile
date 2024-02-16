# stage0
FROM node:19-alpine3.16 as stage0

WORKDIR /opt/studio-backend

RUN npm install -g pnpm

COPY ./package.json ./pnpm-lock.yaml /opt/studio-backend/

RUN pnpm install

COPY ./tsconfig.json /opt/studio-backend/
COPY ./src /opt/studio-backend/src

RUN pnpm run build:ncc

# stage 1
FROM node:19-alpine3.16 as stage1

WORKDIR /opt/studio-backend

COPY --from=stage0 /opt/studio-backend/build-ncc/ /opt/studio-backend

EXPOSE 8081

CMD ["node", "./index.js"]
