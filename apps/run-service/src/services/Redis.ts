import { Queue } from "bullmq";
import { Redis } from "ioredis";

import type { parseCodemodRunBody } from "../schemata/schema.js";
import { environment } from "../util.js";

export const redis = environment.REDIS_HOST
  ? new Redis({
      host: String(environment.REDIS_HOST),
      port: Number(environment.REDIS_PORT),
      maxRetriesPerRequest: null,
    })
  : null;

type CodemodRunJob = ReturnType<typeof parseCodemodRunBody> & {
  userId: string;
};

export const queue = redis
  ? new Queue<CodemodRunJob>(environment.TASK_MANAGER_QUEUE_NAME ?? "", {
      connection: redis,
    })
  : null;
