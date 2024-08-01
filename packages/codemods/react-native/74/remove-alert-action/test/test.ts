import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/codemod-utils";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react-native v0.74 remove alertAction", () => {
  it("should remove prop if it is a string", async () => {
    const input = `
	  PushNotificationIOS.presentLocalNotification({ alertBody: 'body', alertAction: 'view' });
		  `;

    const output = `
	  PushNotificationIOS.presentLocalNotification({ alertBody: 'body' });
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

  it("should remove prop if it is variable", async () => {
    const input = `
	  const alertAction = 'view';
	  PushNotificationIOS.presentLocalNotification({ alertBody: 'body', alertAction });
		  `;

    const output = `
	  PushNotificationIOS.presentLocalNotification({ alertBody: 'body' });
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

  it("shouldn't remove prop if it is variable but used somewhere else", async () => {
    const input = `
	  const alertAction = 'view';
	  PushNotificationIOS.presentLocalNotification({ alertBody: 'body', alertAction });
	  console.log(alertAction);
		  `;

    const output = `
	  const alertAction = 'view';
	  PushNotificationIOS.presentLocalNotification({ alertBody: 'body' });
	  console.log(alertAction);
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
