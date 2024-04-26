import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, test } from "vitest";
import transform from "../src/index.js";

describe("react-native v074 migrate to fireIntervalSeconds", () => {
  test("common use case", async () => {
    const input = `
    PushNotificationIOS.scheduleLocalNotification({
        repeatInterval: 'minute',
    });
    PushNotificationIOS.scheduleLocalNotification({
        repeatInterval: 'year',
    });
		`;

    const output = `
    PushNotificationIOS.scheduleLocalNotification({
        fireIntervalSeconds: 60,
    });
    PushNotificationIOS.scheduleLocalNotification({
        fireIntervalSeconds: 31536000,
    });
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: input,
    };

    const actualOutput = transform(fileInfo, buildApi("js"), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\s/gm, ""),
      output.replace(/\s/gm, ""),
    );
  });
});
