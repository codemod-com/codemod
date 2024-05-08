FROM node:20-alpine3.16 as builder

WORKDIR /app

RUN npm install -g pnpm

COPY ./package.json ./turbo.json ./pnpm-workspace.yaml ./pnpm-lock.yaml /app/
COPY ./apps/modgpt/package.json /app/apps/modgpt/
COPY ./packages/tsconfig /app/packages/tsconfig/
COPY ./packages/utilities /app/packages/utilities/
COPY ./packages/filemod /app/packages/filemod/

RUN pnpm install

COPY ./apps/modgpt/tsconfig.json /app/apps/modgpt/
COPY ./apps/modgpt/esbuild.config.js /app/apps/modgpt/
COPY ./apps/modgpt/src /app/apps/modgpt/src/

RUN pnpm build --filter @codemod-com/filemod --filter @codemod-com/utilities
RUN pnpm build --filter @codemod-com/modgpt

FROM node:20-alpine3.16

WORKDIR /app

COPY --from=builder /app/apps/modgpt/build /app

CMD ["pnpm", "run", "start"]

EXPOSE 8082
