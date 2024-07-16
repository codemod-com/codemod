import { PrismaClient } from "../generated/client";

declare global {
  var prisma: PrismaClient | undefined;
  // TODO: create api-types package and remove database dependency from utilities to avoid circular
  // namespace PrismaJson {
  //   // you can use classes, interfaces, types, etc.
  //   type Argument = CodemodConfig;
  // }
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
