export type BaseEvent = { kind: string } & Record<string, unknown>;

export type TelemetrySenderOptions = {
	cloudRole: string;
	//   // required to persist anonymous session id
	//   persistance: {
	//     getItem(value: string): string | null;
	//     setItem(key: string, value: string): void;
	//   };
	getUserDistinctId: () => Promise<string>;
	allowedEnvelopeTags?: string[];
};

export type TelemetrySender<Event extends BaseEvent> = {
	sendEvent(event: Event): void;
	dispose(): Promise<unknown>;
};
