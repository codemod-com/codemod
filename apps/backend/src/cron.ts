import { prisma } from "@codemod-com/database";
import { WebClient } from "@slack/web-api";
import { CronJob } from "cron";
import { PostHogService } from "./services/PostHogService";
import { environment } from "./util";

import axios from "axios";

// TODO: Move crons into independent CronService

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
  "0 * * * *", // cronTime - every hour
  async () => {
    const posthogService = new PostHogService(
      environment.POSTHOG_API_KEY ?? "",
      environment.POSTHOG_PROJECT_ID ?? "",
    );

    let codemodTotalRuns: Awaited<
      ReturnType<typeof posthogService.getCodemodTotalRuns>
    >;
    try {
      codemodTotalRuns = await posthogService.getCodemodTotalRuns();
    } catch (err) {
      console.error("Failed getting total codemod runs from PostHog.");
      console.error((err as Error).message);
      return;
    }

    for (const { slug, runs } of codemodTotalRuns) {
      try {
        const codemod = await prisma.codemod.findFirst({
          where: { slug },
        });

        if (codemod) {
          await prisma.codemod.update({
            where: { id: codemod.id },
            data: { totalRuns: runs },
          });
        }
      } catch (err) {
        console.error("Failed updating codemod runs in the database.");
        console.error((err as Error).message);
      }
    }
  }, // onTick
  null, // onComplete
  false, // start
);

const systemHealthCheckCron = new CronJob(
  "*/10 * * * *",
  async () => {
    const token = environment.SLACK_TOKEN;
    const channel = environment.SLACK_CHANNEL;

    const web = new WebClient(token);

    const services: Array<{ name: string; url: string }> = [
      {
        name: "Backend API",
        url: environment.BACKEND_API_URL ?? "",
      },
      {
        name: "Auth Service",
        url: environment.AUTH_SERVICE_URL ?? "",
      },
      {
        name: "ModGPT Service",
        url: environment.MODGPT_SERVICE_URL ?? "",
      },
      {
        name: "Codemod AI Service",
        url: environment.CODEMOD_AI_SERVICE_URL ?? "",
      },
      {
        name: "Run Service",
        url: environment.RUN_SERVICE_URL ?? "",
      },
    ];

    for (const service of services) {
      try {
        const { status } = await axios.get(service.url);
        if (status !== 200) {
          throw new Error("Service did not respond with OK");
        }
      } catch (error) {
        console.error(`${service.name} is down`, error);

        await web.chat.postMessage({
          channel: channel,
          text: `${service.name} is down. Error: ${error}`,
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
  systemHealthCheckCron.start();
};
