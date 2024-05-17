import type { Event } from "@studio/schemata/eventSchemata";

export class EventManager {
  private __events: Event[] = [];

  public constructor() {}

  public pushEvent<T>(
    event: [T] extends [Omit<Event, "hashDigest">] ? T : never,
  ): number {
    let hashDigest: string = crypto.randomUUID();

    // @ts-expect-error
    let newEvent: Event = {
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
    let hashDigest: string = crypto.randomUUID();

    // @ts-expect-error
    let newEvent: Event = {
      ...event,
      hashDigest,
    };

    this.__events[index] = newEvent;
  }

  public getEvents(): Array<Event> {
    return this.__events;
  }
}
