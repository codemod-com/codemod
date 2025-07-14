import assert from "node:assert";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { execPath } from "node:process";
import { after, before, test } from "node:test";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

test("should run the codemod successfully", () => {
  const outputFilePath = path.join(__dirname, "fixtures/input.js");
  const expectedFilePath = path.join(__dirname, "fixtures/expected.js");
  const inputTempFilePath = path.join(__dirname, "fixtures/input-temp.js");

  assert.ok(fs.existsSync(outputFilePath), "Output file does not exist");
  assert.ok(fs.existsSync(expectedFilePath), "Expected file does not exist");

  // make input-temp.js
  // then replace the content of input.js with the content of input-temp.js
  before(() => {
    const inputContent = fs.readFileSync(outputFilePath, "utf-8");
    fs.writeFileSync(inputTempFilePath, inputContent, "utf-8");
    fs.writeFileSync(outputFilePath, inputContent, "utf-8");
  });

  after(() => {
    fs.writeFileSync(
      outputFilePath,
      fs.readFileSync(inputTempFilePath, "utf-8"),
    );
    fs.unlinkSync(inputTempFilePath);
  });

  const result = spawnSync(
    execPath,
    [
      path.join(__dirname, "fixtures/workflow.ts"),
      "--input",
      path.join(__dirname, "fixtures/**.js"),
      "--exclude",
      "**/expected.js",
    ],
    {
      encoding: "utf-8",
      stdio: "inherit",
    },
  );

  assert.strictEqual(result.status, 0, "Codemod did not run successfully");

  const outputContent = fs.readFileSync(outputFilePath, "utf-8");
  const expectedContent = fs.readFileSync(expectedFilePath, "utf-8");

  assert.strictEqual(
    outputContent,
    expectedContent,
    "Output content does not match expected content",
  );
});

test("should handle sync workflow", () => {
  const outputFilePath = path.join(__dirname, "fixtures/input.js");
  const expectedFilePath = path.join(__dirname, "fixtures/expected.js");
  const inputTempFilePath = path.join(__dirname, "fixtures/input-temp.js");

  assert.ok(fs.existsSync(outputFilePath), "Output file does not exist");
  assert.ok(fs.existsSync(expectedFilePath), "Expected file does not exist");

  // make input-temp.js
  // then replace the content of input.js with the content of input-temp.js
  before(() => {
    const inputContent = fs.readFileSync(outputFilePath, "utf-8");
    fs.writeFileSync(inputTempFilePath, inputContent, "utf-8");
    fs.writeFileSync(outputFilePath, inputContent, "utf-8");
  });

  after(() => {
    fs.writeFileSync(
      outputFilePath,
      fs.readFileSync(inputTempFilePath, "utf-8"),
    );
    fs.unlinkSync(inputTempFilePath);
  });

  const result = spawnSync(
    execPath,
    [
      path.join(__dirname, "fixtures/workflow-sync.ts"),
      "--input",
      path.join(__dirname, "fixtures/**.js"),
      "--exclude",
      "**/expected.js",
    ],
    {
      encoding: "utf-8",
      stdio: "inherit",
    },
  );

  assert.strictEqual(result.status, 0, "Codemod did not run successfully");

  const outputContent = fs.readFileSync(outputFilePath, "utf-8");
  const expectedContent = fs.readFileSync(expectedFilePath, "utf-8");

  assert.strictEqual(
    outputContent,
    expectedContent,
    "Output content does not match expected content",
  );
});

test("should handle workflow with error", () => {
  const result = spawnSync(
    execPath,
    [
      path.join(__dirname, "fixtures/workflow-with-error.ts"),
      "--input",
      path.join(__dirname, "fixtures/**.js"),
      "--exclude",
      "**/expected.js",
    ],
    {
      encoding: "utf-8",
      stdio: "pipe",
    },
  );

  assert.ok(
    result.stderr.includes("This is a test error in the workflow codemod"),
  );
});

test("should handle invalid language gracefully", () => {
  const result = spawnSync(
    execPath,
    [
      path.join(__dirname, "fixtures/workflow-wrong-lang.ts"),
      "--input",
      path.join(__dirname, "fixtures/**.js"),
      "--exclude",
      "**/expected.js",
      "--language",
      "invalid-language",
    ],
    {
      encoding: "utf-8",
      stdio: "pipe",
    },
  );

  assert.notStrictEqual(result.signal, 1, "Codemod should have failed");
  assert.ok(result.stderr.includes("Unsupported language: invalid-language"));
});

test("should error on missing input", () => {
  const result = spawnSync(
    execPath,
    [path.join(__dirname, "fixtures/workflow.ts")],
    {
      encoding: "utf-8",
      stdio: "pipe",
    },
  );

  assert.notStrictEqual(result.status, 0, "Codemod should have failed");
  assert.ok(
    result.stderr.includes("Input file or directory path is required."),
  );
});

test("should handle if any files are found to process", () => {
  const result = spawnSync(
    execPath,
    [
      path.join(__dirname, "fixtures/workflow.ts"),
      "--input",
      path.join(__dirname, "fixtures/nonexistent/**.js"),
    ],
    {
      encoding: "utf-8",
      stdio: "pipe",
    },
  );

  assert.strictEqual(result.status, 0, "Codemod should run successfully");
  assert.ok(result.stderr.includes("No files found to process."));
});
