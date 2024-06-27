import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getConfigurationDirectoryPath, getCurrentUserData } from "../utils";

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
  const configurationDirectoryPath = getConfigurationDirectoryPath();

  const userData = await getCurrentUserData();

  if (userData !== null) {
    return userData.user.id;
  }

  const distinctId = await getDistinctId(configurationDirectoryPath);

  if (distinctId !== null) {
    return distinctId;
  }

  return await generateDistinctId(configurationDirectoryPath);
};

export { getDistinctId, generateDistinctId, getUserDistinctId };
