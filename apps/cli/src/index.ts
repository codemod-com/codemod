#!/usr/bin/env node
import { isMainThread } from "node:worker_threads";
import { writeLogs } from "./utils.js";

if (isMainThread) {
  import("./main.js")
    .then(({ main }) => main())
    .catch(async (error) => {
      if (error instanceof Error) {
        console.error(JSON.stringify({ message: error.message }));
      }

      console.log(
        await writeLogs({
          prefix: "CLI failed with an unexpected error.",
          content: error,
          fatal: true,
        }),
      );
    });
} else {
  import("./worker.js").then(({ executeWorkerThread }) =>
    executeWorkerThread(),
  );
}
