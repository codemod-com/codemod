import * as fs from "node:fs/promises";
import { formatText } from "@codemod-com/utilities";
import { mapValues } from "lodash-es";
import MagicString from "magic-string";
import OpenAI from "openai";
import type { PLazy } from "../PLazy";
import { getAstGrepNodeContext, getFileContext } from "../contexts";
import { FunctionExecutor, fnWrapper } from "../engineHelpers";
import { clc } from "../helpers";

const SYSTEM_PROMPT = `
You are a meticulous engineer assigned to migrate a codebase by updating its code when necessary.

When you write code, the code works on the first try, and is complete. Take into account the current repository's language, code style, and dependencies.

You will be given a Context File, a Migration Description and a Source File. You will rewrite the Source File in order to apply the changes described in the Migration Description.

You will use a Context File to understand the codebase and the Migration Description to apply the changes.
Context file will be surrounded by triple single quotes like this:
'''
context file here
'''

If a line of code is not affected by the migration, you should keep it as it is.

Source file will be split into multiple parts, each part starts with a comment like this:
// codemod#ai#0
part code here
// codemod#ai#0
where 0 is a number that represents the part number.

You must print the modified Source File in the following format:

\`\`\`
modified Source File
\`\`\`

You must preserve parts naming and order.
`;

type CodeSample = {
  filename: string;
  contents: string;
  startPosition: number;
  endPosition: number;
  text: string;
};

class AiHandler {
  private beforesSamples: Record<string, CodeSample[]> = {};
  public query: string | undefined;
  private _usage: OpenAI.Completions.CompletionUsage = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0,
  };

  constructor(private userPrompt: string) {}

  addBefore(before: CodeSample) {
    this.beforesSamples[before.filename] ??= [];
    this.beforesSamples[before.filename]?.push(before);
  }

  private get prompts() {
    return mapValues(
      this.beforesSamples,
      (samples) => `
You are migrating a code, which matches ast-grep pattern:
${this.query ?? ""}

Context file:
'''
${samples[0]?.contents}
'''

${this.userPrompt}

${samples
  .map(
    (before, index) => `
// codemod#ai#${index}
${before.text}
// codemod#ai#${index}

`,
  )
  .join("")}`,
    );
  }

  public get usage() {
    return this._usage;
  }

  public static getReplacements(completionText?: string | null) {
    // Match code block inside ``` and replace those quotes with empty string
    const code = completionText
      ?.match(/```([\s\S]*?)```/g)?.[0]
      ?.replace(/^```/g, "")
      ?.replace(/```$/g, "");

    const replacements: string[] = [];
    const parts = code?.split("\n") ?? [];
    let currentIndex = -1;
    let currentCode = "";
    for (const part of parts) {
      const index = Number.parseInt(
        part.match(/\/\/ codemod#ai#(\d+)/)?.[1] ?? "",
        10,
      );
      if (!Number.isNaN(index)) {
        if (currentIndex === index) {
          replacements.push(currentCode);
          currentCode = "";
        } else {
          currentIndex = index;
        }
        continue;
      }

      currentCode += part;
    }

    return replacements;
  }

  async execute() {
    const apiKey = process.argv
      .find((arg) => arg.startsWith("--OPENAI_API_KEY="))
      ?.replace("--OPENAI_API_KEY=", "");
    if (!apiKey) {
      console.error(
        `Please set OPENAI_API_KEY environment variable like "codemod ... --OPENAI_API_KEY=YOUR_API_KEY"`,
      );
      process.exit(1);
    }
    const openai = new OpenAI({ apiKey });

    await Promise.all(
      Object.entries(this.prompts).map(async ([filename, prompt]) => {
        const response = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          seed: 7,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          temperature: 0.001,
          n: 1,
        });
        const usage = response?.usage;
        if (usage) {
          this._usage.completion_tokens += usage.completion_tokens;
          this._usage.prompt_tokens += usage.prompt_tokens;
          this._usage.total_tokens += usage.total_tokens;
        }
        const completion = response?.choices[0]?.message.content;
        const replacements = AiHandler.getReplacements(completion);
        const foundReplacements: {
          startPosition: number;
          endPosition: number;
          text: string;
        }[] = [];
        const beforeSamples = this.beforesSamples[filename] ?? [];
        for (let i = 0; i < beforeSamples.length; i++) {
          const before = beforeSamples[i] as CodeSample;
          const after = replacements[i] as string;
          foundReplacements.push({
            startPosition: before.startPosition,
            endPosition: before.endPosition,
            text: after,
          });
        }
        if (foundReplacements.length) {
          try {
            const contents = new MagicString(
              await fs.readFile(filename, "utf-8"),
            );
            for (const replacement of foundReplacements) {
              contents.update(
                replacement.startPosition,
                replacement.endPosition,
                replacement.text,
              );
            }
            if (contents.hasChanged()) {
              await fs.writeFile(
                filename,
                await formatText(filename, contents.toString(), true),
              );
              console.log(`${clc.blueBright("FILE")} ${filename}`);
            }
          } catch (e) {
            //
          }
        }
      }),
    );

    console.log(
      `Codemod2.0 ${clc.blueBright("usage")}: ${clc.green("Prompt tokens")}(${
        this._usage.prompt_tokens
      }), ${clc.green("Completion tokens")}(${
        this._usage.completion_tokens
      }), ${clc.green("Total tokens")}(${this._usage.total_tokens})`,
    );
  }
}

export function aiLogic(
  rawPrompt: string | readonly string[],
): PLazy<AiHelpers> & AiHelpers {
  const prompt = typeof rawPrompt === "string" ? rawPrompt : rawPrompt.join("");
  const aiHandler = new AiHandler(prompt);

  return new FunctionExecutor("ai")
    .arguments(() => ({ prompt }))
    .helpers(aiHelpers)
    .executor(async () => {
      const { node, query, contents } = getAstGrepNodeContext();
      const { file } = getFileContext();
      const range = node.range();
      aiHandler.query =
        typeof query === "string" ? query : JSON.stringify(query);
      aiHandler.addBefore({
        filename: file,
        contents: contents.toString(),
        startPosition: range.start.index,
        endPosition: range.end.index,
        text: node.text(),
      });
    })
    .return(async (self) => {
      await aiHandler.execute();
      return self.wrappedHelpers();
    })
    .run();
}

export const ai = fnWrapper("ai", aiLogic);

const aiHelpers = {};
type AiHelpers = typeof aiHelpers;
