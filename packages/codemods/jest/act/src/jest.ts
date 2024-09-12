import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { contexts, exec, files } from "@codemod.com/workflow";
import { getLineBoundaries } from "./files.js";

const BEGIN_WITH = "(\x1B[22m\x1B[2m";
const END_WITH = "\x1B[2m";

export type JestJsonAssertionResult = {
  ancestorTitles: string[];
  failureMessages: string[];
  fullName: string;
  location: string;
  status: "passed" | "failed" | "pending";
  title: "adds 1 + 2 to equal 3";
};

export type JestJsonTestResult = {
  assertionResults: JestJsonAssertionResult[];
  endTime: number;
  message: string;
  name: string;
  startTime: number;
  status: "passed" | "failed" | "pending" | "todo" | "skipped";
  summary: string;
};

export type JestJsonOuput = {
  numFailedTestSuites: number;
  numFailedTests: number;
  numPassedTestSuites: number;
  numPassedTests: number;
  numPendingTestSuites: number;
  numPendingTests: number;
  numRuntimeErrorTestSuites: number;
  numTodoTests: number;
  numTotalTestSuites: number;
  numTotalTests: number;
  openHandles: string[];
  snapshot: {
    added: number;
    didUpdate: boolean;
    failure: boolean;
    filesAdded: number;
    filesRemoved: number;
    filesRemovedList: string[];
    filesUnmatched: number;
    filesUpdated: number;
    matched: number;
    total: number;
    unchecked: number;
    uncheckedKeysByFile: string[];
    unmatched: number;
    updated: number;
  };
  startTime: number;
  success: boolean;
  testResults: JestJsonTestResult[];
  wasInterrupted: boolean;
};

export async function execJest(command: string, args?: string[]) {
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, crypto.randomBytes(16).toString("hex"));

  let stderr = "";
  try {
    stderr = (
      await exec(
        command,
        [
          ...(args ?? []),
          "--json",
          "--outputFile",
          tmpFile,
          "--bail",
          Number.MAX_SAFE_INTEGER.toString(),
        ],
        { skipLog: true },
      ).stderr()
    ).join("");
    return [
      JSON.parse(await fs.readFile(tmpFile, { encoding: "utf-8" })),
      stderr,
    ] as [JestJsonOuput, string];
  } catch (e) {
    return [undefined, stderr] as [undefined, string];
  } finally {
    await fs.rm(tmpFile, { force: true, recursive: true });
  }
}

export async function getJestTests(command: string, args?: string[]) {
  return await execJest(command, [
    ...(args ?? []),
    // "--testNamePattern",
    // "abracadabraabracadabra",
  ]);
}

export class JestRunner {
  private cacheReady = false;
  private tests: JestJsonTestResult[] = [];

  constructor(
    private command: string,
    private args?: string[],
    private useCache = true,
  ) {}

  private static getCacheFile() {
    return path.join(os.tmpdir(), "rtl-migration-act.json");
  }

  private async readAllTests() {
    if (await this.readCache()) {
      return;
    }
    console.log("Getting all tests..");
    const [json, stderr] = await getJestTests(this.command, [
      ...(this.args ?? []),
      "--testNamePattern",
      "abracadabraabracadabra",
    ]);
    if (!json) {
      throw new Error("Failed to get jest tests");
    }

    this.tests = json.testResults;
    this.cacheReady = true;
  }

  private async readCache() {
    if (this.cacheReady) {
      return true;
    }

    try {
      const cache = JSON.parse(
        await fs.readFile(JestRunner.getCacheFile(), { encoding: "utf-8" }),
      );
      this.tests = cache;

      this.cacheReady = true;
      console.log(`Cache loaded from file ${JestRunner.getCacheFile()}`);
      return true;
    } catch {
      return false;
    } finally {
      this.saveCache();
    }
  }

  private async saveCache() {
    setTimeout(async () => {
      if (this.cacheReady) {
        await fs.writeFile(
          JestRunner.getCacheFile(),
          JSON.stringify(this.tests),
        );
      }
      this.saveCache();
    }, 10000);
  }

  private async testAssertion(
    test: JestJsonTestResult,
    assertion: JestJsonAssertionResult,
  ) {
    const { fullName } = assertion;
    const [res, stderr] = await runJestSingleTest(
      test.name,
      fullName,
      this.command,
      this.args,
    );

    if (!res) {
      // jest process exit
      assertion.status = "failed";
      return assertion;
    }

    const found = res.testResults[0]?.assertionResults.find(
      (assertion) => assertion.fullName === fullName,
    );
    if (found) {
      if (stderr.includes("console.error")) {
        // jest process exit
        found.status = "failed";
        found.failureMessages.push(stderr);
      }
      return found;
    }

    assertion.status = "failed";

    return assertion;
  }

  public async *failedTests() {
    await this.readAllTests();
    for (const test of this.tests) {
      // if (
      //   !test.assertionResults.some(
      //     ({ fullName }) =>
      //       fullName ===
      //       "Connect/DataLayersCard Empty should render empty state",
      //   )
      // ) {
      //   continue;
      // }
      if (test.status !== "passed") {
        // retest all assertions
        test.assertionResults = await Promise.all(
          test.assertionResults.map(async (assertion) => {
            if (["passed", "todo"].includes(assertion.status)) {
              return assertion;
            }

            return await this.testAssertion(test, assertion);
          }),
        );
      }
      if (test.assertionResults.every(({ status }) => status === "passed")) {
        test.status = "passed";
      } else if (
        test.assertionResults.some(({ status }) => status === "failed")
      ) {
        test.status = "failed";
      }
      for (const assertion of test.assertionResults) {
        if (assertion.status === "failed") {
          yield [test, assertion] as [
            JestJsonTestResult,
            JestJsonAssertionResult,
          ];
        }
      }
    }
  }

  public async *failedLines() {
    for await (const [test, assertion] of this.failedTests()) {
      const lines = getLineFromJestOutput(
        test.name,
        assertion.failureMessages.join(""),
      )
        .map((line) => JSON.stringify(line))
        .filter((line, index, lines) => lines.indexOf(line) === index)
        .map((line) => JSON.parse(line)) as ReturnType<
        typeof getLineFromJestOutput
      >;
      for (const line of lines) {
        yield [test, assertion, line] as [
          JestJsonTestResult,
          JestJsonAssertionResult,
          typeof line,
        ];
      }
    }
  }

  public printStats() {
    const stats = {} as Record<string, number>;
    for (const test of this.tests) {
      const testKey = `tests ${test.status}`;
      stats[testKey] = (stats[testKey] ?? 0) + 1;
      for (const assertion of test.assertionResults) {
        const assertionKey = `assertions ${assertion.status}`;
        stats[assertionKey] = (stats[assertionKey] ?? 0) + 1;
      }
    }
    console.log(
      Object.entries(stats)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", "),
    );
  }

  public async *fixError(
    test: JestJsonTestResult,
    assertion: JestJsonAssertionResult,
    failedLine: ReturnType<typeof getLineFromJestOutput>[0],
    modifiers: ((boundaries: {
      startIndex: number;
      endIndex: number;
    }) => Promise<boolean>)[],
  ) {
    let hasErrors = true;

    await files(test.name, async () => {
      const file = contexts.getFileContext();
      const originalContent = await file.contents();
      const lineBoundaries = await getLineBoundaries(failedLine.line);

      if (!lineBoundaries) {
        return;
      }

      // Iterate over all modifiers strategy
      for (const modifier of modifiers) {
        const hasChanged = await modifier(lineBoundaries);
        if (hasChanged) {
          const result = await this.testAssertion(test, assertion);
          console.log(result);
          if (result.status === "passed") {
            hasErrors = false;
            return;
          }

          if (result.status === "failed") {
            console.log(`Reverting changes in ${test.name}`);
            file.setContents(originalContent);
            await file.save();
          }
        }
      }
    });

    return hasErrors;
  }
}

export async function runJestSingleTest(
  fileName: string,
  testName: string,
  command: string,
  args?: string[],
) {
  return await execJest(command, [
    ...(args ?? []),
    "--testFile",
    fileName,
    "--testNamePattern",
    testName,
  ]);
}

export async function getJestBrokenTests(
  output: JestJsonOuput,
  command: string,
  args?: string[],
) {
  let success = 0;
  let failed = 0;
  const failedTestResults = [] as JestJsonOuput["testResults"][0][];

  for (const testResult of output.testResults) {
    const { name, assertionResults } = testResult;
    const assertions = (
      await Promise.all(
        assertionResults.map(async (assertionResult) => {
          const { fullName } = assertionResult;
          const [res, stderr] = await runJestSingleTest(
            name,
            fullName,
            command,
            args,
          );

          if (!res) {
            // jest process exit
            assertionResult.status = "failed";
            return assertionResult;
          }

          const found = res.testResults[0]?.assertionResults.find(
            (assertion) => assertion.fullName === fullName,
          );
          if (found) {
            if (stderr.includes("console.error")) {
              // jest process exit
              found.status = "failed";
              found.failureMessages.push(stderr);
            }
            return found;
          }

          assertionResult.status = "failed";

          return assertionResult;
        }),
      )
    ).filter(
      Boolean,
    ) as JestJsonOuput["testResults"][0]["assertionResults"][0][];

    const failedAssertions = assertions.filter(
      ({ status }) => status === "failed",
    );

    if (failedAssertions.length) {
      failedTestResults.push({
        ...testResult,
        assertionResults: failedAssertions,
      });
    }
    success += assertions.length - failedAssertions.length;
    failed += failedAssertions.length;
    console.log({ success, failed });
  }

  return failedTestResults;
}

export function getLineFromJestOutput(filename: string, output?: string) {
  if (typeof output !== "string") {
    return [];
  }
  // console.log(output, JSON.stringify(output));

  const lines = [] as { filename: string; line: number; column: number }[];
  let searchFrom = 0;
  const length = output.length;

  while (searchFrom < length) {
    const start = output.indexOf(BEGIN_WITH, searchFrom);
    if (start < 0) {
      break;
    }
    const end =
      start +
      BEGIN_WITH.length +
      output.slice(start + BEGIN_WITH.length).indexOf(END_WITH);
    if (end < 0) {
      break;
    }
    const foundFilename = output.slice(start + BEGIN_WITH.length, end);
    const line = output.slice(end + END_WITH.length).match(/:(\d+):(\d+)/);
    if (!line) {
      break;
    }
    lines.push({
      filename: foundFilename,
      line: Number(line[1]),
      column: Number(line[2]),
    });
    searchFrom = end + END_WITH.length;
  }

  const regex = `(${filename}):(\\d+):(\\d+)`;
  const linesFoundWithRegex = output.matchAll(new RegExp(regex, "gm"));
  if (linesFoundWithRegex) {
    for (const found of linesFoundWithRegex) {
      lines.push({
        filename: path.relative(contexts.getCwdContext().cwd, found[1] ?? ""),
        line: Number(found[2]),
        column: Number(found[3]),
      });
    }
  }

  return lines.filter(({ filename: fname }) => filename.includes(fname));
}
