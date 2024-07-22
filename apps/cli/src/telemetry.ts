import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import { getCurrentUserData } from "#utils.js";

export type TelemetryEvent =
  | Readonly<{
      kind: "codemodExecuted";
      fileCount: number;
      executionId: string;
      codemodName: string;
      cliVersion: string;
    }>
  | Readonly<{
      kind: "failedToExecuteCommand";
      commandName: string;
      cliVersion: string;
    }>
  | Readonly<{
      kind: "codemodPublished";
      codemodName: string;
      version: string;
      cliVersion: string;
    }>;

/**
 * We need to assign unique identifier for users that are not signed in for correct telemetry tracking
 */

const getDistinctId = async (configurationDirectoryPath: string) => {
  try {
    const sessionContent = await readFile(
      join(configurationDirectoryPath, "session.json"),
      "utf-8",
    );

    return JSON.parse(sessionContent).id;
  } catch (e) {
    return null;
  }
};

const generateDistinctId = async (configurationDirectoryPath: string) => {
  await mkdir(configurationDirectoryPath, { recursive: true });

  const id = randomBytes(16).toString("hex");
  await writeFile(
    join(configurationDirectoryPath, "session.json"),
    JSON.stringify({ id }),
  );

  return id;
};

const getUserDistinctId = async (): Promise<string> => {
  const configDir = join(homedir(), ".codemod");

  const userData = await getCurrentUserData();

  if (userData !== null) {
    return userData.user.id;
  }

  const distinctId = await getDistinctId(configDir);

  if (distinctId !== null) {
    return distinctId;
  }

  return await generateDistinctId(configDir);
};

export { generateDistinctId, getDistinctId, getUserDistinctId };
