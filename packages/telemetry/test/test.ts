import { describe, expect, it, vi } from "vitest";
import { PostHogSender } from "../src/index.js";

const mockedCapture = vi.fn();
vi.mock("posthog-node", async () => {
  return {
    PostHog: function PostHog() {
      return {
        capture: mockedCapture,
      };
    },
  };
});

describe("Should send telemetry", () => {
  it("Should build correct role, properties and event name", () => {
    const sender = new PostHogSender({
      cloudRole: "ROLE",
      distinctId: "test-user",
    });

    sender.sendEvent({
      kind: "event-name",
      message: "Message",
    });

    expect(mockedCapture).toBeCalledWith({
      distinctId: "test-user",
      event: "codemod.ROLE.event-name",
      properties: {
        cloudRole: "ROLE",
        message: "Message",
      },
    });
  });

  it("Should redact file paths", () => {
    const sender = new PostHogSender({
      cloudRole: "ROLE",
      distinctId: "test-user",
    });

    sender.sendEvent({
      kind: "event-name",
      message: "Message with /file/paths",
    });

    expect(mockedCapture).toBeCalledWith({
      distinctId: "test-user",
      event: "codemod.ROLE.event-name",
      properties: {
        cloudRole: "ROLE",
        message: "Message with REDACTED-FILE-PATH",
      },
    });
  });
});
