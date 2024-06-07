import { CronJob } from "cron";
import { prisma } from "./db/prisma";
import { PostHogService } from "./services/PostHogService";
import { environment } from "./util";

const cleanupLoginIntentsCron = new CronJob(
  "* * * * *", // cronTime
  async () => {
    const twoMinutesAgo = new Date();
    twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);

    await prisma.userLoginIntent.deleteMany({
      where: {
        createdAt: {
          lte: twoMinutesAgo,
        },
      },
    });
  }, // onTick
  null, // onComplete
  false, // start
);

const syncDatabaseWithPosthogDataCron = new CronJob(
  "0 0 * * *", // cronTime - every hour
  async () => {
    const posthogService = new PostHogService(
      environment.POSTHOG_API_KEY ?? "",
      environment.POSTHOG_PROJECT_ID ?? "",
    );

    const codemodTotalRuns = await posthogService.getCodemodTotalRuns();

    for (const { slug, runs } of codemodTotalRuns) {
      console.log({ slug, runs });

      const codemod = await prisma.codemod.findFirst({
        where: { slug },
      });

      if (codemod) {
        await prisma.codemod.update({
          where: { id: codemod.id },
          data: { totalRuns: runs },
        });
      }
    }
  }, // onTick
  null, // onComplete
  false, // start
);

export const startCronJobs = () => {
  cleanupLoginIntentsCron.start();
  syncDatabaseWithPosthogDataCron.start();
};
