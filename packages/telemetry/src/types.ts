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
  /**
   * @description Sends event without redacting event properties.
   * Use only when event does not contain sensitive data
   */
  sendDangerousEvent(
    event: Event,
    optionOverrides?: Partial<TelemetrySenderOptions>,
  ): void;
  dispose(): Promise<unknown>;
};
