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
                        name: "@codemod-com/studio",
                        drift: 1.689288623311909,
                        timestamp: "2024-02-23T12:59:21.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/studio",
                        drift: 1.7248814144027598,
                        timestamp: "2024-03-07T16:00:18.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/studio",
                        drift: 1.7467846704586678,
                        timestamp: "2024-03-15T18:53:00.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.3915207019993566,
                        timestamp: "2024-03-15T18:53:00.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/studio",
                        drift: 1.7796395545425299,
                        timestamp: "2024-03-27T12:34:24.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.3915207019993566,
                        timestamp: "2024-03-27T12:34:24.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/studio",
                        drift: 1.8152323456333805,
                        timestamp: "2024-04-09T13:54:03.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.3915207019993566,
                        timestamp: "2024-04-09T13:54:03.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/studio",
                        drift: 1.8426114157032656,
                        timestamp: "2024-04-18T16:18:22.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.3915207019993566,
                        timestamp: "2024-04-18T16:18:22.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/frontend",
                        drift: 1.8617767647521852,
                        timestamp: "2024-04-26T13:54:15.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.6379323326283223,
                        timestamp: "2024-04-26T13:54:15.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/frontend",
                        drift: 1.8918937418290587,
                        timestamp: "2024-05-07T14:21:21.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.8268479161105293,
                        timestamp: "2024-05-07T14:21:21.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.3942586090063451,
                        timestamp: "2024-05-15T11:07:05.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/frontend",
                        drift: 1.9137969978849667,
                        timestamp: "2024-05-15T11:07:05.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/frontend",
                        drift: 1.9302244399268977,
                        timestamp: "2024-05-21T10:31:00.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.3942586090063451,
                        timestamp: "2024-05-21T10:31:00.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/frontend",
                        drift: 1.941176067954852,
                        timestamp: "2024-05-27T17:44:54.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.3942586090063451,
                        timestamp: "2024-05-27T17:44:54.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/frontend",
                        drift: 1.957603509996783,
                        timestamp: "2024-05-31T14:37:38.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.3942586090063451,
                        timestamp: "2024-05-31T14:37:38.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/frontend",
                        drift: 1.990458394080645,
                        timestamp: "2024-06-11T16:11:14.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.3942586090063451,
                        timestamp: "2024-06-11T16:11:14.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/frontend",
                        drift: 2.012361650136553,
                        timestamp: "2024-06-21T07:56:38.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.49829907527190836,
                        timestamp: "2024-06-21T07:56:38.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/frontend",
                        drift: 2.034264906192461,
                        timestamp: "2024-06-28T14:22:22.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.5366297733697475,
                        timestamp: "2024-06-28T14:22:22.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/frontend",
                        drift: 2.0725956042903,
                        timestamp: "2024-07-12T12:24:06.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.539367680376736,
                        timestamp: "2024-07-12T12:24:06.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/frontend",
                        drift: 2.1081883953811507,
                        timestamp: "2024-07-24T19:02:49.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.539367680376736,
                        timestamp: "2024-07-24T19:02:49.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/frontend",
                        drift: 2.14651909347899,
                        timestamp: "2024-08-08T15:54:34.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.539367680376736,
                        timestamp: "2024-08-08T15:54:34.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/frontend",
                        drift: 2.20127723361876,
                        timestamp: "2024-08-27T15:47:25.000Z",
                        label: "real_drift",
                      },
                      {
                        name: "@codemod-com/backend",
                        drift: 0.539367680376736,
                        timestamp: "2024-08-27T15:47:25.000Z",
                        label: "real_drift",
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
                      name: "drift_analyzer_pkg",
                      args: { repos: repoUrl },
                    },
                    data: JSON.stringify([
                      {
                        repoName: "https://github.com/stackbit/stackbit-app",
                        behind: "1 minor",
                        drift: 0.3942586090063451,
                        packageName: "ansi-to-html",
                        packageJsonName: "stackbit-app",
                        specifier: "ansi-to-html@^0.6.14",
                        declared: "^0.6.14",
                        installed: "0.6.15",
                        latest: "0.7.2",
                      },
                      {
                        repoName: "https://github.com/stackbit/stackbit-app",
                        behind: "1 major",
                        drift: 1.8699904857731506,
                        packageName: "remark-gfm",
                        packageJsonName: "stackbit-app",
                        specifier: "remark-gfm@3.0.1",
                        declared: "3.0.1",
                        installed: "3.0.1",
                        latest: "4.0.0",
                      },
                      {
                        repoName: "https://github.com/stackbit/stackbit-app",
                        behind: "1 major",
                        drift: 0.3395004688665749,
                        packageName: "remark-parse",
                        packageJsonName: "stackbit-app",
                        specifier: "remark-parse@10.0.2",
                        declared: "10.0.2",
                        installed: "10.0.2",
                        latest: "11.0.0",
                      },
                      {
                        repoName: "https://github.com/stackbit/stackbit-app",
                        behind: "1 major",
                        drift: 0.005475814013977016,
                        packageName: "@types/history",
                        packageJsonName: "stackbit-app",
                        specifier: "@types/history@4.7.11",
                        declared: "4.7.11",
                        installed: "4.7.11",
                        latest: "5.0.0",
                      },
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
                      name: "prs_tracker",
                      args: {
                        repos: repoUrl,
                        packageNames: "@codemod-com/codemod",
                      },
                    },
                    data: JSON.stringify([
                      {
                        timestamp: faker.date.anytime(),
                        task: faker.lorem.words(3),
                        status: "In Review",
                        pr: {
                          url: faker.internet.url(),
                          name: faker.lorem.words(3),
                        },
                        reviewer: {
                          img: faker.image.avatar(),
                          name: faker.person.fullName(),
                        },
                        filesChanged: 3,
                        timeSaved: "1h 45m",
                      },
                      {
                        timestamp: faker.date.anytime(),
                        task: faker.lorem.words(3),
                        status: "Merged",
                        pr: {
                          url: faker.internet.url(),
                          name: faker.lorem.words(3),
                        },
                        reviewer: {
                          img: faker.image.avatar(),
                          name: faker.person.fullName(),
                        },
                        filesChanged: 55,
                        timeSaved: "13h 10m",
                      },
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
                      args: { repos: repoUrl },
                    },
                    id: faker.string.uuid(),
                    data: JSON.stringify([
                      {
                        timestamp: faker.date.anytime(),
                        savedTimeFormatted: "1h 45m",
                      },
                      {
                        timestamp: faker.date.anytime(),
                        savedTimeFormatted: "1h 30m",
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
                      name: "chart_analyzer",
                      args: { repos: repoUrl },
                    },
                    id: faker.string.uuid(),
                    data: JSON.stringify([
                      {
                        timestamp: faker.date.anytime(),
                        use: 0,
                        useContext: 47,
                      },
                      {
                        timestamp: faker.date.anytime(),
                        use: 11,
                        useContext: 42,
                      },
                      {
                        timestamp: faker.date.anytime(),
                        use: 17,
                        useContext: 29,
                      },
                      {
                        timestamp: faker.date.anytime(),
                        use: 21,
                        useContext: 23,
                      },
                      {
                        timestamp: faker.date.anytime(),
                        use: 25,
                        useContext: 20,
                      },
                      {
                        timestamp: faker.date.anytime(),
                        use: 33,
                        useContext: 11,
                      },
                    ]),
                    progress: { total: 100, processed: 50, percentage: 50 },
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
                  title: "Drift (libyears)",
                  data: [
                    {
                      title: "Name",
                      value: "`drift_analyzer_pkg.packageName`",
                    },
                    {
                      title: "Current version",
                      value: "`drift_analyzer_pkg.installed`",
                    },
                    {
                      title: "Stable version",
                      value: "`drift_analyzer_pkg.latest`",
                    },
                    { title: "Behind", value: "`drift_analyzer_pkg.behind`" },
                    { title: "Drift", value: "`drift_analyzer_pkg.drift`" },
                  ],
                },
                {
                  kind: "table",
                  title: "PRs tracker",
                  data: [
                    {
                      title: "Task",
                      value: "`prs_tracker.task`",
                    },
                    {
                      title: "PR",
                      value: "`prs_tracker.pr.url`",
                    },
                    {
                      title: "PR status",
                      description: "Status of the PR",
                      value: "`prs_tracker.status`",
                    },
                    {
                      title: "Reviewer",
                      value: "`prs_tracker.reviewer.name`",
                    },
                    {
                      title: "Files changed",
                      value: "`prs_tracker.filesChanged`",
                    },
                    {
                      title: "Time saved",
                      description: "Estimated time saving from this PR",
                      value: "`prs_tracker.timeSaved`",
                    },
                  ],
                },
                {
                  kind: "primitive",
                  data: {
                    heading: "`timesave_analyzer.savedTimeFormatted`",
                    description:
                      "`timesave_analyzer.lastMonthPercentage` better than last month",
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
