import type { CodemodRunJobData } from "@codemod-com/utilities";
import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { environment } from "../util.js";

const TASK_MANAGER_QUEUE_NAME =
  environment.NODE_ENV === "staging"
    ? `${environment.TASK_MANAGER_QUEUE_NAME}_STAGING`
    : environment.TASK_MANAGER_QUEUE_NAME;

export const redis = environment.REDIS_HOST
  ? new Redis({
      host: String(environment.REDIS_HOST),
      port: Number(environment.REDIS_PORT),
      maxRetriesPerRequest: null,
    })
  : null;

export const queue = redis
  ? new Queue<CodemodRunJobData>(TASK_MANAGER_QUEUE_NAME ?? "", {
      connection: redis,
    })
  : null;
