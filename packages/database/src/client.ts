import { PrismaClient } from "../prisma/client";

declare global {
  var prisma: PrismaClient<
    import("../prisma/client").Prisma.PrismaClientOptions,
    never,
    import("../prisma/client/runtime/library").DefaultArgs
  >;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
