import { type Output, object, string } from "valibot";

export const BearerTokenHeaders = object({
  authorization: string(),
});

export type BearerTokenHeaders = Output<typeof BearerTokenHeaders>;
