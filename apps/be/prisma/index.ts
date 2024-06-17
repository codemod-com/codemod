import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
export type {
  Codemod,
  CodemodVersion,
  Prisma,
  PrismaClient,
  Tag,
  UserLoginIntent,
} from "@prisma/client";
