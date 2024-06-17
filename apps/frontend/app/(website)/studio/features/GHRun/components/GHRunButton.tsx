import {
  ProgressBar,
  getButtonPropsByStatus,
  useExecutionStatus,
  useOpenRepoModalAfterSignIn,
} from "@features/GHRun";
import { Check as CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { Button } from "@studio/components/ui/button";
import { useEnsureUserSigned } from "@studio/hooks/useEnsureUserSigned";
import { useLocalStorage } from "@studio/hooks/useLocalStorage";
import type { GHBranch, GithubRepository } from "be-types";
import { memo, useState } from "react";
import { useCodemodExecution } from "../hooks/useCodemodExecution";
import { RepositoryModal } from "./RepositoryModal";

export let GHRunButton = memo(() => {
  let [repositoriesToShow, setRepositoriesToShow] = useState<
    GithubRepository[]
  >([]);

  let [codemodExecutionId, setCodemodExecutionId, clearExecutionId] =
    useLocalStorage("codemodExecutionId");
  let [branchesToShow, setBranchesToShow] = useState<GHBranch[]>([]);

  let {
    showModalWithRepositories,
    hideRepositoryModal,
    isRepositoryModalShown,
    areReposLoading,
  } = useOpenRepoModalAfterSignIn(setRepositoriesToShow);

  let showRepoModalToSignedUser = useEnsureUserSigned(
    showModalWithRepositories,
    "openRepoModal",
  );

  let codemodRunStatus = useExecutionStatus({
    codemodExecutionId,
    clearExecutionId,
  });
  let status = codemodRunStatus?.result?.status ?? null;
  let { text, hintText } = getButtonPropsByStatus(status);
  let { onCodemodRun } = useCodemodExecution({
    codemodExecutionId,
    setCodemodExecutionId,
  });

  return (
    <>
      <RepositoryModal
        onCodemodRun={onCodemodRun}
        branchesToShow={branchesToShow}
        setBranchesToShow={setBranchesToShow}
        hideRepositoryModal={hideRepositoryModal}
        isRepositoryModalShown={isRepositoryModalShown}
        repositoriesToShow={repositoriesToShow}
        areReposLoading={areReposLoading}
      />
      {codemodRunStatus && <ProgressBar codemodRunStatus={codemodRunStatus} />}
      <Button
        onClick={showRepoModalToSignedUser}
        size="xs"
        variant="outline"
        className="flex gap-1"
        hint={<p className="font-normal">{hintText}</p>}
        disabled={status === "executing codemod" || status === "progress"}
      >
        <CheckIcon />
        {text}
      </Button>
    </>
  );
});

GHRunButton.displayName = "GHRunButton";
