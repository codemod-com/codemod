import { type Output, object, string } from "valibot";

export const GetIntentParams = object({
  id: string(),
});

export type GetIntentParams = Output<typeof GetIntentParams>;

export const GetIntentQuery = object({
  iv: string(),
});

export type GetIntentQuery = Output<typeof GetIntentQuery>;

export const PopulateIntentQuery = object({
  sessionId: string(),
  iv: string(),
});

export type PopulateIntentQuery = Output<typeof PopulateIntentQuery>;
