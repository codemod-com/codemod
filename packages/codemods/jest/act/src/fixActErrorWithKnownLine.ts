import { files } from "@codemod.com/workflow";
import {
  addActImport,
  addWaitForImport,
  getLineBoundaries,
  wrapExpressionWithinBoundaries,
} from "./files.js";
import type { JestJsonAssertionResult, JestJsonTestResult } from "./jest.js";
import { getLineFromJestOutput } from "./jest.js";

export async function fixActErrorWithKnownLine(
  test: JestJsonTestResult,
  assertion: JestJsonAssertionResult,
  wrapperToAdd: "act" | "waitFor",
  makeAsync?: boolean,
) {
  if (
    !assertion.failureMessages.some((output) =>
      output.includes("a test was not wrapped in act("),
    )
  ) {
    return false;
  }

  const line = getLineFromJestOutput(
    test.name,
    assertion.failureMessages.join(""),
  );
  if (!line) {
    return false;
  }

  if (!test.name.includes(line.filename)) {
    return false;
  }

  console.log(
    `${line.filename}:${line.line}:${line.column} has missing act() call`,
  );

  let changed = false;
  await files(`**/${line.filename}`).jsFam(async () => {
    const lineBoundaries = await getLineBoundaries(line.line);
    if (!lineBoundaries) {
      return;
    }

    if (
      await wrapExpressionWithinBoundaries(
        lineBoundaries,
        wrapperToAdd,
        makeAsync,
      )
    ) {
      changed = true;
      switch (wrapperToAdd) {
        case "act":
          await addActImport();
          break;
        case "waitFor":
          await addWaitForImport();
          break;
      }
    }
  });

  return changed;
}
