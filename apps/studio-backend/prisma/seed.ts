import "dotenv/config";

import { faker } from "@faker-js/faker";
import { CodemodType, PrismaClient } from "@prisma/client";
import { z } from "zod";
import { CodemodCreateInputSchema } from "./generated/zod";

if (!("DATABASE_URI" in process.env)) {
	throw new Error("DATABASE_URI not found in .env");
}

const prisma = new PrismaClient();

async function main() {
	const data: z.infer<typeof CodemodCreateInputSchema>[] = [];

	for (let i = 0; i < 10; i++) {
		data.push({
			slug: faker.string.alpha(10),
			name: faker.lorem.words(2),
			shortDescription: faker.lorem.words(10),
			type: faker.helpers.arrayElement(Object.values(CodemodType)),
			featured: faker.datatype.boolean(),
			verified: faker.datatype.boolean(),
			framework: faker.lorem.word(),
			frameworkVersion: faker.system.semver(),
			author: faker.lorem.word(),
			engine: faker.helpers.arrayElement(["jscodeshift", "ts-morph"]),
			requirements: faker.lorem.words(3),
			version: faker.system.semver(),
			lastUpdate: faker.date.recent(),
			command: faker.lorem.words(2),
			vsCodeLink: faker.internet.url(),
			codemodStudioExampleLink: faker.internet.url(),
			testProjectCommand: faker.lorem.words(2),
			sourceRepo: faker.internet.url(),
			readmeLink: faker.internet.url(),
			indexTsLink: faker.internet.url(),
			private: faker.datatype.boolean(),
		});
	}

	await prisma.codemod.createMany({ data });
	console.log({ data });
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
