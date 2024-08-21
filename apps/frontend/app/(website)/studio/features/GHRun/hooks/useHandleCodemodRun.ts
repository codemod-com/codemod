import type {
  CodemodRunRequestPayload,
  GHBranch,
  GithubRepository,
} from "@codemod-com/api-types";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";
import { transpileTs } from "@studio/utils/transpileTs";

type Props = {
  onCodemodRun: (request: CodemodRunRequestPayload) => Promise<void>;
  selectedRepository: GithubRepository | undefined;
  selectedBranch: GHBranch | undefined;
};
export const useHandleCodemodRun = ({
  onCodemodRun,
  selectedRepository,
  selectedBranch,
}: Props) => {
  const { engine } = useSnippetsStore();
  const { content } = useModStore();
  const isCodemodSourceNotEmpty = content?.trim() !== "";

  return async () => {
    if (
      selectedRepository === undefined ||
      selectedBranch === undefined ||
      content === null ||
      !isCodemodSourceNotEmpty ||
      !(engine === "jscodeshift" || engine === "ts-morph") // other engines are not supported by backend API
    ) {
      return;
    }

    const request: CodemodRunRequestPayload & { codemodSource: string } = {
      codemodName: "studio-generated",
      codemodEngine: engine,
      repoUrl: selectedRepository.html_url,
      codemodSource: (await transpileTs(content)).transpiled,
      branch: selectedBranch.name,
    };

    await onCodemodRun(request);
  };
};
