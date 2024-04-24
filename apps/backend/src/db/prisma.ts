import type { CodemodConfig } from "@codemod-com/utilities";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// Prisma json generator types
declare global {
	namespace PrismaJson {
		type ApplicabilityCriteria = CodemodConfig["applicability"];
		type Arguments = CodemodConfig["arguments"];
	}
}
