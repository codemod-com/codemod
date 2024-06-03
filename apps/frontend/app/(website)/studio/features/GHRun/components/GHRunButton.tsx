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

export const GHRunButton = memo(() => {
  const [repositoriesToShow, setRepositoriesToShow] = useState<
    GithubRepository[]
  >([]);

  const [codemodExecutionId, setCodemodExecutionId, clearExecutionId] =
    useLocalStorage("codemodExecutionId");
  const [branchesToShow, setBranchesToShow] = useState<GHBranch[]>([]);

  const {
    showModalWithRepositories,
    hideRepositoryModal,
    isRepositoryModalShown,
    areReposLoading,
  } = useOpenRepoModalAfterSignIn(setRepositoriesToShow);

  const showRepoModalToSignedUser = useEnsureUserSigned(
    showModalWithRepositories,
    "openRepoModal",
  );

  const codemodRunStatus = useExecutionStatus({
    codemodExecutionId,
    clearExecutionId,
  });
  const status = codemodRunStatus?.result?.status ?? null;
  const { text, hintText } = getButtonPropsByStatus(status);
  const { onCodemodRun } = useCodemodExecution({
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
