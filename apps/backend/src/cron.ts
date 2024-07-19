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

const services: Array<{
  name: string;
  url: string;
  type: "http" | "websocket";
  available: boolean;
}> = [
  {
    name: "Backend API",
    url: process.env.BACKEND_API_URL ?? "",
    type: "http",
    available: true,
  },
  {
    name: "Auth Service",
    url: process.env.AUTH_SERVICE_URL ?? "",
    type: "http",
    available: true,
  },
  {
    name: "ModGPT Service",
    url: process.env.MODGPT_SERVICE_URL ?? "",
    type: "http",
    available: true,
  },
  {
    name: "Codemod AI Service",
    url: process.env.CODEMOD_AI_SERVICE_URL ?? "",
    type: "websocket",
    available: true,
  },
  {
    name: "Run Service",
    url: process.env.RUN_SERVICE_URL ?? "",
    type: "http",
    available: true,
  },
];

const systemHealthCheckCron = new CronJob(
  "*/15 * * * *",
  async () => {
    const token = process.env.SLACK_TOKEN ?? "";
    const channel = process.env.SLACK_CHANNEL ?? "";
    const web = new WebClient(token);

    await Promise.all(
      services.map(async (service) => {
        try {
          if (service.type === "http") {
            const response = await axios.get(service.url);

            if (response.status === 200 && service.available === false) {
              await web.chat.postMessage({
                channel: channel,
                text: `${service.name} is now up.`,
              });
              service.available = true;
            }
          } else if (service.type === "websocket") {
            await new Promise((resolve, reject) => {
              const ws = new WebSocket(service.url);

              ws.on("open", async () => {
                if (service.available === false) {
                  await web.chat.postMessage({
                    channel: channel,
                    text: `${service.name} is now up.`,
                  });
                }
                service.available = true;

                ws.close();
                resolve(true);
              });

              ws.on("error", (error) => {
                reject(
                  new Error(`WebSocket connection error: ${error.message}`),
                );
              });
            });
          }
        } catch (error) {
          if (service.available === true) {
            await web.chat.postMessage({
              channel: channel,
              text: `${service.name} is down. Error: ${error}`,
            });

            service.available = false;
          }
        }
      }),
    );
  }, // onTick
  null, // onComplete
  false, // start
);

export const startCronJobs = () => {
  cleanupLoginIntentsCron.start();
  syncDatabaseWithPosthogDataCron.start();
  systemHealthCheckCron.start();
};
