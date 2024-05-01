import Redis, { type RedisOptions } from "ioredis";
import type { CodemodMetadata } from "../jobs/runCodemod";
import { environment } from "../util";

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
  private readonly __options: RedisOptions;
  private readonly __redis: Redis;
  private __codemodMetadata: CodemodMetadata | null;

  constructor(host: string, port: string) {
    this.__codemodMetadata = null;
    this.__options = {
      host: String(host),
      port: Number(port),
      maxRetriesPerRequest: null,
    };
    this.__redis = new Redis(
      NODE_ENV === "development"
        ? this.__options
        : { ...this.__options, tls: {} },
    );
  }

  public async set({
    status,
    message,
    link,
  }: {
    status: string;
    message: string;
    link?: string;
  }): Promise<void> {
    try {
      if (!this.__statusKey) {
        throw new RedisKeyMissedError("Status key is missing!");
      }

      await this.__redis.set(
        this.__statusKey,
        JSON.stringify({ status, message, link }),
      );
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
