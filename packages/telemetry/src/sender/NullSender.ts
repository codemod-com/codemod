import type { BaseEvent, TelemetrySender } from "src/types.js";

export class NullSender<Event extends BaseEvent>
	implements TelemetrySender<Event>
{
	public sendEvent() {}
	public async dispose() {
		return Promise.resolve();
	}
}
