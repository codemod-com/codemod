import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/codemod-utils";
import type { FileInfo } from "jscodeshift";
import { describe, test } from "vitest";
import transform from "../src/index.js";

describe("react-native v074 remove callback from PushNotificationIOS.removeEventListener", () => {
  test("common use case", async () => {
    const input = `
    PushNotificationIOS.removeEventListener('notification', () => {
      console.log('some  callback to remove');
    });  
		`;

    const output = `
    PushNotificationIOS.removeEventListener('notification');
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: input,
    };

    const actualOutput = transform(fileInfo, buildApi(), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\s/gm, ""),
      output.replace(/\s/gm, ""),
    );
  });

  test("variable that stores function", async () => {
    const input = `
    const callback = () => {
      console.log('some  callback to remove');
    };
    PushNotificationIOS.removeEventListener('notification', callback);  
		`;

    const output = `
    PushNotificationIOS.removeEventListener('notification');
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: input,
    };

    const actualOutput = transform(fileInfo, buildApi(), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\s/gm, ""),
      output.replace(/\s/gm, ""),
    );
  });
});
