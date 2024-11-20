import { type InferInput, object, optional, string } from "valibot";

export const createAPIKeyRequestSchema = object({
  name: optional(string()),
  /**
   * Format: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format
   */
  expiresAt: optional(string()),
});

export const deleteAPIKeysRequestSchema = object({
  includes: string(),
});

export type DeleteAPIKeysRequest = InferInput<
  typeof deleteAPIKeysRequestSchema
>;

export type CreateAPIKeyRequest = InferInput<typeof createAPIKeyRequestSchema>;

export type CreateAPIKeyResponse = { key: string };

export type ListAPIKeysResponse = {
  keys: {
    start: string;
    name?: string;
    createdAt: number;
    expiresAt?: number;
  }[];
};

export type DeleteAPIKeysResponse = {
  keys: {
    start: string;
    name?: string;
  }[];
};
