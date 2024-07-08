import { prisma } from "@codemod-com/database";
import { WebClient } from "@slack/web-api";
import axios from "axios";
import { CronJob } from "cron";
import WebSocket from "ws";
import { PostHogService } from "./services/PostHogService";
import { environment } from "./util";

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

    const services: Array<{
      name: string;
      url: string;
      type: "http" | "websocket";
    }> = [
      {
        name: "Backend API",
        url: environment.BACKEND_API_URL ?? "",
        type: "http",
      },
      {
        name: "Auth Service",
        url: environment.AUTH_SERVICE_URL ?? "",
        type: "http",
      },
      {
        name: "ModGPT Service",
        url: environment.MODGPT_SERVICE_URL ?? "",
        type: "http",
      },
      {
        name: "Codemod AI Service",
        url: environment.CODEMOD_AI_SERVICE_URL ?? "",
        type: "websocket",
      },
      {
        name: "Run Service",
        url: environment.RUN_SERVICE_URL ?? "",
        type: "http",
      },
    ];

    for (const service of services) {
      try {
        if (service.type === "http") {
          const { status } = await axios.get(service.url);
          if (status !== 200) {
            throw new Error("Service did not respond with OK");
          }
        } else if (service.type === "websocket") {
          await new Promise((resolve, reject) => {
            const ws = new WebSocket(service.url);

            ws.on("open", () => {
              ws.close();
              resolve(true);
            });

            ws.on("error", (error) => {
              reject(new Error(`WebSocket connection error: ${error.message}`));
            });

            ws.on("close", (code) => {
              if (code !== 1000) {
                reject(new Error(`WebSocket closed with code: ${code}`));
              }
            });
          });
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
