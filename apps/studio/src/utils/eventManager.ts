import type { Event } from "~/schemata/eventSchemata";

export class EventManager {
	private __events: Event[] = [];

	public constructor() {}

	public pushEvent<T>(
		event: [T] extends [Omit<Event, "hashDigest">] ? T : never,
	): number {
		const hashDigest: string = crypto.randomUUID();

		// @ts-expect-error
		const newEvent: Event = {
			...event,
			hashDigest,
		};

		this.__events.push(newEvent);

		return this.__events.length - 1;
	}

	public updateEvent<T>(
		event: [T] extends [Omit<Event, "hashDigest">] ? T : never,
		index: number,
	): void {
		const hashDigest: string = crypto.randomUUID();

		// @ts-expect-error
		const newEvent: Event = {
			...event,
			hashDigest,
		};

		this.__events[index] = newEvent;
	}

	public getEvents(): ReadonlyArray<Event> {
		return this.__events;
	}
}
