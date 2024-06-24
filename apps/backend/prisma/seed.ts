import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const useCaseCategories = [
  "Migration",
  "Best practices",
  "Refactoring",
  "Cleanup",
  "Mining",
  "Security",
  "Other",
];

const frameworks = [
  "React",
  "NextJS",
  "NestJS",
  "Typescript",
  "Biome",
  "EmberJS",
  "Prettier",
  "ESlint",
];

const engines = ["jscodeshift", "ts-morph", "ast-grep"];

const getRandomElementOfArray = (array: any[]) =>
  faker.helpers.arrayElement(array);
const getRandomName = () => faker.person.fullName();
const getRandomNumber = (min: number, max: number) =>
  faker.helpers.rangeToNumber({ min, max });
const getRandomWord = () => faker.lorem.word();
const getRandomWords = (min: number, max: number) =>
  faker.lorem.words({ min, max });
const getRandomCategory = () => faker.helpers.arrayElement(useCaseCategories);
const getRandomFramework = () => faker.helpers.arrayElement(frameworks);
const getRandomEngine = () => faker.helpers.arrayElement(engines);
const getRandomUrl = () => faker.internet.url();
const getRandomSemver = () => faker.system.semver();

async function seedDatabaseWithFrameworks(): Promise<void> {
  const { count } = await prisma.tag.createMany({
    data: Array.from({ length: getRandomNumber(3, 8) }, () => {
      const frameworkName = getRandomFramework();
      return {
        classification: "framework",
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
  const { count } = await prisma.tag.createMany({
    data: Array.from({ length: getRandomNumber(3, 7) }, () => {
      const category = getRandomCategory();
      return {
        classification: "category",
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
      const codemodName = getRandomWord();

      const category = getRandomCategory().toLowerCase();
      const frameworkName = getRandomFramework().toLowerCase();
      const frameworkVersion = getRandomNumber(1, 10).toString();

      const codemod = await prisma.codemod.create({
        data: {
          slug: [frameworkName, frameworkVersion, codemodName].join("-"),
          name: [frameworkName, frameworkVersion, codemodName].join("/"),
          frameworks: [frameworkName],
          owner: getRandomName(),
          category: category,
          tags: [frameworkName, category, getRandomWord()],
          description: getRandomWords(10, 50),
          featured: getRandomNumber(0, 1) === 1,
          verified: getRandomNumber(0, 1) === 1,
          private: getRandomNumber(0, 1) === 1,
          totalRuns: getRandomNumber(100, 1000),
          labels: [getRandomWord(), getRandomWord(), getRandomWord()],
        },
      });

      console.log(`Codemod ${codemod.name} was added to database!`);

      const { count } = await prisma.codemodVersion.createMany({
        data: Array.from({ length: getRandomNumber(1, 3) }, () => {
          return {
            codemodId: codemod.id,
            version: getRandomSemver(),
            description: getRandomWords(10, 50),
            engine: getRandomEngine(),
            applicability: [
              [
                frameworkName,
                getRandomElementOfArray([">=", "<=", "<", ">"]),
                frameworkVersion,
              ],
            ],
            arguments: [getRandomWord(), getRandomWord(), getRandomWord()],
            vsCodeLink: getRandomUrl(),
            codemodStudioExampleLink: getRandomUrl(),
            testProjectCommand: getRandomWords(1, 2),
            sourceRepo: getRandomUrl(),
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
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
}

main();
