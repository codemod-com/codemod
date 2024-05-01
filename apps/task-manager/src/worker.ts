import "dotenv/config";

import { type Job, Worker } from "bullmq";

import { AuthService } from "./services/Auth";
import { connection } from "./services/Redis";

import { runCodemodJob } from "./jobs/runCodemod";
import { environment } from "./util";

const { TASK_MANAGER_QUEUE_NAME, CLERK_SECRET_KEY } = environment;

export enum TaskManagerJobs {
  CODEMOD_RUN = "CODEMOD_RUN",
}

const worker = new Worker(
  TASK_MANAGER_QUEUE_NAME,
  async (job: Job) => {
    const { id, name, data } = job;

    const auth = new AuthService(CLERK_SECRET_KEY);
    const token = await auth.getAuthToken(job.data.userId);

    if (!token) worker.close();

    switch (name) {
      case TaskManagerJobs.CODEMOD_RUN:
        try {
          await runCodemodJob({
            jobId: id,
            token,
            ...data,
          });
        } catch (error) {
          console.error("[status]: Job have failed");
        }
        break;

      default:
        console.warn("[warn]: Unknown job type");
        break;
    }
  },
  {
    connection,
  },
);

worker.on("completed", (job: Job) => {
  console.log(`[status]: Task ${job.id} completed successfully`);
});

worker.on("error", (err: Error) => {
  console.error(`[error]: Worker encountered an error: ${err}`);
});

worker.on("active", (job: Job) => {
  console.log(`[status]: Task ${job.id} is now active and being processed`);
});

worker.on("paused", () => {
  console.log("[status]: Worker has been paused");
});

worker.on("resumed", () => {
  console.log("[status]: Worker has resumed processing tasks");
});

worker.on("closing", () => {
  console.log("[status]: Worker is closing down");
});

worker.on("closed", () => {
  console.log("[status]: Worker has been closed");
});
