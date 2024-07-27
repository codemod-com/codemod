import { exec } from "node:child_process";
import { promisify } from "node:util";

export const execPromise = promisify(exec);

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const isGeneratorEmpty = async (
  genFunc: () => AsyncGenerator<unknown> | Generator<unknown>,
) => {
  const tempGen = genFunc();
  const { done } = await tempGen.next();

  return done;
};
