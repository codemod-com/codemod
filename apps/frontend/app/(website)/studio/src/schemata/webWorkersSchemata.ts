import {
  type InferOutput,
  array,
  nullish,
  object,
  parse,
  string,
} from "valibot";
import { eventSchema } from "./eventSchemata";

export const webWorkerIncomingMessageSchema = object({
  engine: string(),
  content: string(),
  input: string(),
});

export const parseWebWorkerIncomingMessage = (input: unknown) =>
  parse(webWorkerIncomingMessageSchema, input);

export type WebWorkerIncomingMessage = InferOutput<
  typeof webWorkerIncomingMessageSchema
>;

const webWorkerOutgoingMessageSchema = object({
  output: nullish(string()),
  events: array(eventSchema),
});

export const parseWebWorkerOutgoingMessage = (input: unknown) =>
  parse(webWorkerOutgoingMessageSchema, input);

export type WebWorkerOutgoingMessage = Readonly<
  InferOutput<typeof webWorkerOutgoingMessageSchema>
>;
