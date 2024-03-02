FROM node:19-alpine3.16 as builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm -r --filter=studio-backend run build
RUN pnpm -r --filter=studio-backend run db:generate

FROM node:19-alpine3.16
WORKDIR /app

COPY --from=builder /app/apps/studio-backend/build/server.js .
COPY --from=builder /app/apps/studio-backend/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/apps/studio-backend/prisma/schema.prisma ./prisma/

EXPOSE 8081
CMD ["node", "./server.js"]
