// src/db/seed.ts
import "dotenv/config";

import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { codemods, typeEnum } from "./src/db/drizzle/schemata.ts";

if (!("DATABASE_URI" in process.env)) {
	throw new Error("DATABASE_URI not found in .env");
}

const main = async () => {
	const client = new Client({
		connectionString: process.env.DATABASE_URI,
	});
	const db = drizzle(client);
	const data: (typeof codemods.$inferInsert)[] = [];

	for (let i = 0; i < 10; i++) {
		data.push({
			slug: faker.string.alpha(),
			name: faker.lorem.words(2),
			shortDescription: faker.lorem.words(10),
			type: faker.helpers.arrayElement(typeEnum.enumValues),
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

	console.log("Seed start");
	await db.insert(codemods).values(data);
	console.log("Seed done");
};

main();
