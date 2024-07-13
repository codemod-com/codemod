import { useModGPT } from "@features/modGPT/useAiService/useModGpt";
import { useEffect } from "react";
import sendChat from "./sendMessage";

export const generateCodemodHumanNamePrompt = (codemod: string) => `
You are a jscodeshift codemod and javascript expert. 
Come up with a precise name to be used for the following jscodeshift codemod below.
If the codemod is aimed at making any changes to a particular framework or library, the format
should be "framework/version/name", where framework is the name of the framework or library,
version is a major version (meaning one or two digits), and name is a short name for the codemod
written in kebab-case. If you can't determine which framework this is for, you can just return the name
written in kebab-case.
Do not return any text other than the codemod name.
\`\`\`
${codemod}
\`\`\`
`;

export async function getHumanCodemodName(
  codemod: string,
  token: string | null,
): Promise<string> {
  if (token === null) {
    return "codemod";
  }

  try {
    if (!codemod) {
      throw new Error("codemod content not found");
    }

    let codemodName = "";
    if (token !== null) {
      // Ask LLM to come up with a name for the given codemod
      const codemodNameOrError = await sendChat({
        message: generateCodemodHumanNamePrompt(codemod),
        token,
      });

      if (codemodNameOrError.isLeft()) {
        console.error(codemodNameOrError.getLeft());
      } else {
        codemodName = codemodNameOrError.get();
      }
    }

    return codemodName;
  } catch (error) {
    console.error(error);

    return "codemod";
  }
}
