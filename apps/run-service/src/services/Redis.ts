import type { CodemodRunJobData } from "@codemod-com/api-types";
import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { environment } from "../util.js";

export const redis = environment.REDIS_HOST
  ? new Redis({
      host: String(environment.REDIS_HOST),
      port: Number(environment.REDIS_PORT),
      maxRetriesPerRequest: null,
    })
  : null;

export const queue = redis
  ? new Queue<CodemodRunJobData>(environment.TASK_MANAGER_QUEUE_NAME ?? "", {
      connection: redis,
    })
  : null;
