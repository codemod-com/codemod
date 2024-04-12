import {
	type Output,
	literal,
	object,
	optional,
	parse,
	string,
	union,
	unknown,
} from "valibot";
import { consoleKindSchema } from "./schemata/consoleKindSchema.js";

const workerThreadMessageSchema = union([
	object({
		kind: literal("commands"),
		commands: unknown(),
		path: optional(string()),
	}),
	object({
		kind: literal("error"),
		message: string(),
		path: optional(string()),
	}),
	object({
		kind: literal("console"),
		consoleKind: consoleKindSchema,
		message: string(),
	}),
	object({
		kind: literal("runCodemod"),
		path: string(),
		data: string(),
	}),
]);

export type WorkerThreadMessage = Output<typeof workerThreadMessageSchema>;

export const decodeWorkerThreadMessage = (input: unknown) =>
	parse(workerThreadMessageSchema, input);
