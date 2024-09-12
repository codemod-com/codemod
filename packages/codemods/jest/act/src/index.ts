import type { Api } from "@codemod.com/workflow";
import { contexts, files } from "@codemod.com/workflow";
import {
  type JestJsonAssertionResult,
  type JestJsonOuput,
  type JestJsonTestResult,
  JestRunner,
  getJestBrokenTests,
} from "./jest.js";

async function tryFixError(
  allTests: JestJsonOuput,
  brokenTest: JestJsonTestResult,
  assertion: JestJsonAssertionResult,
  cb: (
    test: JestJsonTestResult,
    assertion: JestJsonAssertionResult,
  ) => Promise<boolean>,
) {
  let innerBrokenTest = brokenTest;
  let innerAssertion = assertion;
  let hasErrors = true;

  let originalContent = "";
  await files(brokenTest.name, async () => {
    originalContent = await contexts.getFileContext().contents();
  });

  do {
    const result = await getJestBrokenTests(
      {
        ...allTests,
        testResults: [{ ...brokenTest, assertionResults: [assertion] }],
      },
      "nx",
      ["test", "netlify-react-ui"],
    );

    if (!result.some((res) => !!res.assertionResults.length)) {
      hasErrors = false;
      break;
    }
    innerBrokenTest = result[0] as any;
    innerAssertion = result[0]?.assertionResults[0] as any;
  } while (await cb(innerBrokenTest, innerAssertion));

  // Revert file
  if (hasErrors) {
    console.log(`Reverting file ${brokenTest.name}`);
    await files(brokenTest.name, async () => {
      const file = contexts.getFileContext();
      file.setContents(originalContent);
      await file.save();
    });
  } else {
    console.log(`File ${brokenTest.name} fixed`);
  }

  return !hasErrors;
}

export async function workflow({ exec }: Api) {
  const runner = new JestRunner("nx", ["test", "netlify-react-ui"]);

  for await (const [test, assertion, failedLine] of runner.failedLines()) {
    console.log(
      `Failed line: ${failedLine.filename}:${failedLine.line}:${failedLine.column}`,
    );
    for await (const result of runner.fixError(test, assertion, failedLine, [
      // async ({ startIndex, endIndex }) => {
      //   let changed = false;
      //   let addAct = false;
      //   let addWaitFor = false;
      //   await astGrep({ rule: { kind: "expression_statement" } }).replace(
      //     async ({ getNode }) => {
      //       const expression = getNode();
      //       const nodeStart = expression.range().start.index;
      //       const nodeEnd = expression.range().end.index;
      //       const isNeededNode =
      //         (startIndex <= nodeStart && nodeStart <= endIndex) ||
      //         (startIndex <= nodeEnd && nodeEnd <= endIndex);
      //       if (isNeededNode) {
      //         console.log(expression.text());
      //       } else {
      //         return;
      //       }
      //       if (expression.text().includes("waitForLoader")) {
      //         addWaitFor = true;
      //         changed = true;
      //         return `await waitFor(() => { ${expression.text()} });`;
      //       }
      //       return undefined;
      //     },
      //   );
      //   if (addAct) {
      //     await addActImport();
      //   }
      //   if (addWaitFor) {
      //     await addWaitForImport();
      //   }
      //   return changed;
      // },
    ])) {
      console.log(result);
    }
  }
  // const [allTests, stderr] = await getJestTests("nx", [
  //   "test",
  //   "netlify-react-ui",
  //   // "--testFile",
  //   // "src/components/Domains/CustomDomainTask/CustomDomainTask.spec.tsx",
  // ]);

  // if (!allTests) {
  //   return;
  // }

  // const brokenTests = await getJestBrokenTests(allTests, "nx", [
  //   "test",
  //   "netlify-react-ui",
  // ]);

  // for (const brokenTest of brokenTests) {
  //   for (const assertion of brokenTest.assertionResults) {
  //     if (
  //       await tryFixError(
  //         allTests,
  //         brokenTest,
  //         assertion,
  //         (brokenTest, assertion) =>
  //           fixActErrorWithKnownLine(brokenTest, assertion, "act", false),
  //       )
  //     ) {
  //       continue;
  //     }
  //     if (
  //       await tryFixError(
  //         allTests,
  //         brokenTest,
  //         assertion,
  //         (brokenTest, assertion) =>
  //           fixActErrorWithKnownLine(brokenTest, assertion, "act", true),
  //       )
  //     ) {
  //       continue;
  //     }
  //     if (
  //       await tryFixError(
  //         allTests,
  //         brokenTest,
  //         assertion,
  //         (brokenTest, assertion) =>
  //           fixActErrorWithKnownLine(brokenTest, assertion, "waitFor", false),
  //       )
  //     ) {
  //       continue;
  //     }
  //     if (
  //       await tryFixError(
  //         allTests,
  //         brokenTest,
  //         assertion,
  //         (brokenTest, assertion) =>
  //           fixActErrorWithKnownLine(brokenTest, assertion, "waitFor", true),
  //       )
  //     ) {
  //       continue;
  //     }
  //   }
  // }

  // await exec("nx", ["lint", "netlify-react-ui", "--fix"]);
}
