import 'dotenv/config';

import { faker } from '@faker-js/faker';
import { PrismaClient } from './client';

let prisma = new PrismaClient();

let useCaseCategories = [
	'Migration',
	'Best practices',
	'Refactoring',
	'Cleanup',
	'Mining',
	'Security',
	'Other',
];

let frameworks = [
	'React',
	'NextJS',
	'NestJS',
	'Typescript',
	'Biome',
	'EmberJS',
	'Prettier',
	'ESlint',
];

let engines = ['jscodeshift', 'ts-morph', 'ast-grep'];

let getRandomElementOfArray = (array) => faker.helpers.arrayElement(array);
let getRandomName = () => faker.person.fullName();
let getRandomNumber = (min, max) => faker.helpers.rangeToNumber({ min, max });
let getRandomWord = () => faker.lorem.word();
let getRandomWords = (min, max) => faker.lorem.words({ min, max });
let getRandomCategory = () => faker.helpers.arrayElement(useCaseCategories);
let getRandomFramework = () => faker.helpers.arrayElement(frameworks);
let getRandomEngine = () => faker.helpers.arrayElement(engines);
let getRandomUrl = () => faker.internet.url();
let getRandomSemver = () => faker.system.semver();

async function seedDatabaseWithFrameworks(): Promise<void> {
	let { count } = await prisma.tag.createMany({
		data: Array.from({ length: getRandomNumber(3, 8) }, () => {
			let frameworkName = getRandomFramework();
			return {
				classification: 'framework',
				title: frameworkName.toLowerCase(),
				aliases: [frameworkName.toLowerCase()],
				displayName: frameworkName,
			};
		}),
		skipDuplicates: true,
	});

	console.log(`${count} frameworks was added to database!`);
}

async function seedDatabaseWithCategories(): Promise<void> {
	let { count } = await prisma.tag.createMany({
		data: Array.from({ length: getRandomNumber(3, 7) }, () => {
			let category = getRandomCategory();
			return {
				classification: 'useCaseCategory',
				title: category.toLowerCase(),
				aliases: [category.toLowerCase()],
				displayName: category,
			};
		}),
		skipDuplicates: true,
	});

	console.log(`${count} categories was added to database!`);
}

async function seedDatabaseWithCodemods(): Promise<void> {
	await Promise.all(
		Array.from({ length: getRandomNumber(15, 30) }, async () => {
			let codemodName = getRandomWord();

			let useCaseCategory = getRandomCategory().toLowerCase();
			let frameworkName = getRandomFramework().toLowerCase();
			let frameworkVersion = getRandomNumber(1, 10).toString();

			let codemod = await prisma.codemod.create({
				data: {
					slug: [frameworkName, frameworkVersion, codemodName].join(
						'-',
					),
					name: [frameworkName, frameworkVersion, codemodName].join(
						'/',
					),
					tags: [frameworkName, useCaseCategory, getRandomWord()],
					shortDescription: getRandomWords(10, 50),
					applicability: [
						[
							frameworkName,
							getRandomElementOfArray(['>=', '<=', '<', '>']),
							frameworkVersion,
						],
					],
					engine: getRandomEngine(),
					arguments: [
						getRandomWord(),
						getRandomWord(),
						getRandomWord(),
					],
					labels: [getRandomWord(), getRandomWord(), getRandomWord()],
					author: getRandomName(),
					amountOfUses: getRandomNumber(1, 5000),
					totalTimeSaved: getRandomNumber(1, 100),
					openedPrs: getRandomNumber(1, 20),
					featured: getRandomNumber(0, 1) === 1,
					verified: getRandomNumber(0, 1) === 1,
					private: getRandomNumber(0, 1) === 1,
				},
			});

			console.log(`Codemod ${codemod.name} was added to database!`);

			let { count } = await prisma.codemodVersion.createMany({
				data: Array.from({ length: getRandomNumber(1, 3) }, () => {
					return {
						codemodId: codemod.id,
						tags: [frameworkName, useCaseCategory, getRandomWord()],
						shortDescription: getRandomWords(10, 50),
						applicability: [
							[
								frameworkName,
								getRandomElementOfArray(['>=', '<=', '<', '>']),
								frameworkVersion,
							],
						],
						engine: getRandomEngine(),
						arguments: [
							getRandomWord(),
							getRandomWord(),
							getRandomWord(),
						],
						version: getRandomSemver(),
						vsCodeLink: getRandomUrl(),
						codemodStudioExampleLink: getRandomUrl(),
						sourceRepo: getRandomUrl(),
						testProjectCommand: getRandomWords(1, 2),
						amountOfUses: getRandomNumber(1, 500),
						totalTimeSaved: getRandomNumber(1, 10),
						openedPrs: getRandomNumber(1, 5),
						s3Bucket: getRandomWord(),
						s3UploadKey: getRandomWord(),
					};
				}),
			});

			console.log(
				`${count} versions of ${codemod.name} was added to database!`,
			);
		}),
	);
}

async function main() {
	try {
		await seedDatabaseWithFrameworks();
		await seedDatabaseWithCategories();
		await seedDatabaseWithCodemods();
		console.log('Database seeded successfully!');
	} catch (error) {
		console.error(error);
	} finally {
		await prisma.$disconnect();
		process.exit();
	}
}

main();
