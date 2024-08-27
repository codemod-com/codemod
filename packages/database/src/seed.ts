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

const getRandomElementOfArray = <T>(array: T[]) =>
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
        classification: "useCaseCategory",
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

      const useCaseCategory = getRandomCategory().toLowerCase();
      const frameworkName = getRandomFramework().toLowerCase();
      const frameworkVersion = getRandomNumber(1, 10).toString();

      const codemod = await prisma.codemod.create({
        data: {
          slug: [frameworkName, frameworkVersion, codemodName].join("-"),
          name: [frameworkName, frameworkVersion, codemodName].join("/"),
          tags: [frameworkName, useCaseCategory, getRandomWord()],
          shortDescription: getRandomWords(10, 50),
          applicability: {
            from: [
              [
                frameworkName,
                getRandomElementOfArray([">=", "<=", "<", ">"]),
                frameworkVersion,
              ],
            ],
            to: [
              [
                frameworkName,
                getRandomElementOfArray([">=", "<=", "<", ">"]),
                frameworkVersion,
              ],
            ],
          },
          engine: getRandomEngine(),
          arguments: [
            {
              kind: getRandomElementOfArray(["string", "number", "boolean"]),
              name: getRandomWord(),
              required: getRandomElementOfArray([true, false]),
            },
            {
              kind: getRandomElementOfArray(["string", "number", "boolean"]),
              name: getRandomWord(),
              required: getRandomElementOfArray([true, false]),
            },
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

      const { count } = await prisma.codemodVersion.createMany({
        data: Array.from({ length: getRandomNumber(1, 3) }, () => {
          return {
            codemodId: codemod.id,
            tags: [frameworkName, useCaseCategory, getRandomWord()],
            shortDescription: getRandomWords(10, 50),
            applicability: {
              from: [
                [
                  frameworkName,
                  getRandomElementOfArray([">=", "<=", "<", ">"]),
                  frameworkVersion,
                ],
              ],
              to: [
                [
                  frameworkName,
                  getRandomElementOfArray([">=", "<=", "<", ">"]),
                  frameworkVersion,
                ],
              ],
            },
            engine: getRandomEngine(),
            arguments: [
              {
                kind: getRandomElementOfArray(["string", "number", "boolean"]),
                name: getRandomWord(),
                required: getRandomElementOfArray([true, false]),
              },
              {
                kind: getRandomElementOfArray(["string", "number", "boolean"]),
                name: getRandomWord(),
                required: getRandomElementOfArray([true, false]),
              },
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

async function seedDatabaseWithInsightsAndWidgets(): Promise<void> {
  await Promise.all(
    Array.from({ length: getRandomNumber(4, 7) }, async () => {
      const ownerId = "1";
      const framework = getRandomFramework();
      const repoUrls = [getRandomUrl(), getRandomUrl(), getRandomUrl()];

      await prisma.insight.create({
        data: {
          name: `${framework} Migration`,
          description: `Migrate to ${framework} 18.3.1`,
          ownerId,
          repoUrls,
          tags: ["Migration", "Cleanup"],
          codemodRuns: {
            createMany: {
              data: repoUrls.flatMap((repoUrl, i) => [
                {
                  repoUrl,
                  ownerId,
                  branch: "main",
                  data: {
                    status: "done",
                    codemod: {
                      engine: "workflow",
                      name: "drift_analyzer",
                      args: { repos: repoUrl },
                    },
                    id: faker.string.uuid(),
                    data: JSON.stringify([
                      {
                        name: "react",
                        current: "v17.0.3",
                        available: "v19.0.0",
                        behind: 2,
                        drift: 3,
                      },
                      {
                        name: "lodash",
                        current: "v2.0.3",
                        available: "v4.0.0",
                        behind: 2,
                        drift: 4,
                      },
                      {
                        name: "node",
                        current: "v12.3.4",
                        available: "v22.0.0",
                        behind: 10,
                        drift: 4,
                      },
                      {
                        name: "express",
                        current: "v4.0.1",
                        available: "v4.17.1",
                        behind: 3,
                        drift: 2,
                      },
                      {
                        name: "moment",
                        current: "v2.16.0",
                        available: "v2.29.1",
                        behind: 6,
                        drift: 5,
                      },
                      {
                        name: "webpack",
                        current: "v4.65.3",
                        available: "v5.38.1",
                        behind: 2,
                        drift: 3,
                      },
                    ]),
                    progress: { total: 100, processed: 50, percentage: 50 },
                  },
                  jobId: faker.string.uuid(),
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                {
                  repoUrl,
                  ownerId,
                  branch: "main",
                  data: {
                    status: "done",
                    codemod: {
                      engine: "workflow",
                      name: "outdated_dependencies_analyzer",
                      args: { repos: repoUrl },
                    },
                    data: JSON.stringify([
                      { timestamp: new Date(), use: 10, useContext: 20 },
                      { timestamp: new Date(), use: 15, useContext: 10 },
                    ]),
                    id: faker.string.uuid(),
                    progress: { total: 100, processed: 100, percentage: 100 },
                  },
                  jobId: faker.string.uuid(),
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                {
                  repoUrl,
                  ownerId,
                  branch: "main",
                  data: {
                    status: "done",
                    codemod: {
                      engine: "workflow",
                      name: "timesave_analyzer",
                      args: {
                        repos: repoUrl,
                        packageNames: "@codemod-com/codemod",
                      },
                    },
                    data: JSON.stringify([
                      { timestamp: new Date(), savedTimeFormatted: "1h 30m" },
                      { timestamp: new Date(), savedTimeFormatted: "1h 45m" },
                    ]),
                    id: faker.string.uuid(),
                    progress: { total: 100, processed: 100, percentage: 100 },
                  },
                  jobId: faker.string.uuid(),
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ]),
            },
          },
          widgets: {
            createMany: {
              data: [
                {
                  kind: "primitive",
                  data: {
                    text: "Hello world, I am from timesave_analyzer. `timesave_analyzer.savedTimeFormatted`",
                  },
                  title: "Time saved with Codemod",
                },
                {
                  kind: "chart",
                  data: {
                    y: [
                      {
                        title: "use (React 19)",
                        value: "`chart_analyzer.use`",
                        color: "#F59E0B",
                      },
                      {
                        title: "useContext (React 18)",
                        value: "`chart_analyzer.useContext`",
                        color: "#FCD34D",
                      },
                    ],
                    x: "`chart_analyzer.timestamp`",
                  },
                  title: "My chart",
                },
                {
                  kind: "table",
                  data: [
                    {
                      value: "`drift_analyzer.lib`",
                      color: "black",
                      icon: "`pr_analyzer.user.id`",
                    },
                    {
                      value: "`drift_analyzer.drift`",
                      color: "red",
                    },
                  ],
                  title: "My table",
                },
                {
                  kind: "primitive",
                  data: {
                    heading: "`timesave_analyzer.savedTimeFormatted`",
                    description: "`timesave_analyzer.` better than last month",
                  },
                  title: "Time saved with Codemod",
                },
              ],
            },
          },
        },
      });
    }),
  );
}

async function main() {
  try {
    await seedDatabaseWithFrameworks();
    await seedDatabaseWithCategories();
    await seedDatabaseWithCodemods();
    await seedDatabaseWithInsightsAndWidgets();
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
}

main();
