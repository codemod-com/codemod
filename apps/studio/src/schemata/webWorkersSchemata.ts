/* eslint-disable import/group-exports */
import * as S from "@effect/schema/Schema";
import { eventSchema } from "./eventSchemata";

export const webWorkerIncomingMessageSchema = S.struct({
	engine: S.string,
	content: S.string,
	input: S.string,
});

export const parseWebWorkerIncomingMessage = S.parseSync(
	webWorkerIncomingMessageSchema,
);

export type WebWorkerIncomingMessage = S.To<
	typeof webWorkerIncomingMessageSchema
>;

const webWorkerOutgoingMessageSchema = S.struct({
	output: S.union(S.string, S.null, S.undefined),
	events: S.array(eventSchema),
});

export const parseWebWorkerOutgoingMessage = S.parseSync(
	webWorkerOutgoingMessageSchema,
);

export type WebWorkerOutgoingMessage = S.To<
	typeof webWorkerOutgoingMessageSchema
>;
