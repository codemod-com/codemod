import type { CodemodConfig } from "@codemod-com/utilities";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
  namespace PrismaJson {
    type Argument = CodemodConfig["arguments"];
    type Applicability = CodemodConfig["applicability"];
    type ExecutionProgress = {
      processed: number;
      total: number;
      percentage: number;
    };
  }
}

export const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export * from "@prisma/client";
