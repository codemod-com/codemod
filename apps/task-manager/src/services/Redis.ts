import Redis, { type RedisOptions } from "ioredis";
import type { CodemodMetadata } from "../jobs/runCodemod";
import { environment } from "../util";
import type { ExecutionProgress } from "./CodemodRunner";

const { REDIS_HOST, REDIS_PORT, NODE_ENV } = environment;

export class RedisGetError extends Error {}
export class RedisSetError extends Error {}
export class RedisKeyMissedError extends Error {}

export type RedisValueData = {
  status: string;
  message: string;
  link?: string;
};

export class RedisService {
  private readonly __redis: Redis;
  private __codemodMetadata: CodemodMetadata | null;

  constructor(host: string, port: string) {
    this.__redis = new Redis({
      host: String(host),
      port: Number(port),
      maxRetriesPerRequest: null,
    });
    this.__codemodMetadata = null;
  }

  public async set({
    status,
    message,
    progress,
    link,
  }: {
    status: string;
    message?: string;
    progress?: ExecutionProgress;
    link?: string;
  }): Promise<void> {
    try {
      if (!this.__statusKey) {
        throw new RedisKeyMissedError("Status key is missing!");
      }

      const value: {
        status: string;
        message?: string;
        progress?: ExecutionProgress;
        link?: string;
      } = { status };

      if (message) {
        value.message = message;
      }

      if (progress) {
        value.progress = progress;
      }

      if (link) {
        value.link = link;
      }

      await this.__redis.set(this.__statusKey, JSON.stringify(value));
    } catch (error) {
      const { message } = error as Error;

      throw new RedisSetError(
        `Cannot set the value to Redis! Reason: ${message}`,
      );
    }
  }

  public async get(): Promise<RedisValueData | null> {
    try {
      if (!this.__statusKey) {
        throw new RedisKeyMissedError("Status key is missing!");
      }

      const data = await this.__redis.get(this.__statusKey);
      return data ? (JSON.parse(data) as RedisValueData) : null;
    } catch (error) {
      const { message } = error as Error;

      throw new RedisGetError(
        `Cannot get the value from Redis! Reason: ${message}`,
      );
    }
  }

  public set codemodMetadata(codemodMetadata: CodemodMetadata) {
    this.__codemodMetadata = codemodMetadata;
  }

  public get connection(): Redis {
    return this.__redis;
  }

  private get __statusKey(): string | null {
    if (this.__codemodMetadata) {
      const { jobId } = this.__codemodMetadata;
      return `job-${jobId}::status`;
    }

    return null;
  }
}

export const redis = new RedisService(REDIS_HOST, REDIS_PORT);
export const connection = redis.connection;
