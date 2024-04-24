export type BaseEvent = { kind: string } & Record<string, unknown>;

export type TelemetrySenderOptions = {
  cloudRole: string;
  distinctId: string;
  allowedEnvelopeTags?: string[];
};

export type TelemetrySender<Event extends BaseEvent> = {
  sendEvent(
    event: Event,
    optionOverrides?: Partial<TelemetrySenderOptions>,
  ): void;
  dispose(): Promise<unknown>;
};
