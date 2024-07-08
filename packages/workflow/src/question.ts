import inquirer, { type Answers } from "inquirer";
import { FunctionExecutor, fnWrapper } from "./engineHelpers.js";

type Arguments = Parameters<typeof inquirer.prompt>;

/**
 * Ask a question using [inquirer](https://www.npmjs.com/package/inquirer)
 * @param args [questions, answers]
 * @returns Promise<Answers>
 */
export function questionLogic<Return extends Answers>(
  ...args: Arguments
): Promise<Return> {
  let response: Return;
  return new FunctionExecutor("question")
    .arguments(() => ({ questions: args[0], answers: args[1] }))
    .executor(async (next, self) => {
      const { questions, answers } = self.getArguments();
      response = (await inquirer.prompt(questions, answers)) as any;
      await next?.();
    })
    .return(() => response)
    .run();
}

export const question = fnWrapper("question", questionLogic);
