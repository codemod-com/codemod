FROM node:20-alpine3.16 AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json turbo.json pnpm-workspace.yaml pnpm-lock.yaml ./

COPY apps/modgpt/package.json apps/modgpt/
COPY packages/tsconfig packages/tsconfig/
COPY packages/utilities packages/utilities/
COPY packages/filemod packages/filemod/
COPY packages/database packages/database/
COPY packages/api-types packages/api-types/
COPY packages/auth packages/auth/


RUN pnpm install

COPY apps/modgpt/tsconfig.json apps/modgpt/
COPY apps/modgpt/esbuild.config.js apps/modgpt/
COPY apps/modgpt/src apps/modgpt/src/

RUN pnpm build --filter @codemod-com/modgpt

FROM node:20-alpine3.16

WORKDIR /app

COPY --from=builder /app/apps/modgpt/build /app/build
COPY --from=builder /app/apps/modgpt/package.json /app

EXPOSE 8082

CMD ["node", "build/index.js"]
