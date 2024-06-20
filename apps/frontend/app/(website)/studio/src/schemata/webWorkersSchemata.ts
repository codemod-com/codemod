import { type Output, array, nullish, object, parse, string } from "valibot";
import { eventSchema } from "./eventSchemata";

export let webWorkerIncomingMessageSchema = object({
  engine: string(),
  content: string(),
  input: string(),
});

export let parseWebWorkerIncomingMessage = (input: unknown) =>
  parse(webWorkerIncomingMessageSchema, input);

export type WebWorkerIncomingMessage = Output<
  typeof webWorkerIncomingMessageSchema
>;

let webWorkerOutgoingMessageSchema = object({
  output: nullish(string()),
  events: array(eventSchema),
});

export let parseWebWorkerOutgoingMessage = (input: unknown) =>
  parse(webWorkerOutgoingMessageSchema, input);

export type WebWorkerOutgoingMessage = Readonly<
  Output<typeof webWorkerOutgoingMessageSchema>
>;
