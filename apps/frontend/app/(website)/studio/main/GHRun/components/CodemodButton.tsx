import { Check as CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { Button } from "@studio/components/ui/button";
import { useEnsureUserSigned } from "@studio/hooks/useEnsureUserSigned";
import { useExecutionStatus } from "@studio/main/GHRun";
import { getButtonPropsByStatus } from "@studio/main/GHRun";
import { ProgressBar } from "@studio/main/GHRun/components/ProgressBar";
import { useOpenRepoModalAfterSignIn } from "@studio/main/GHRun/hooks/useOpenRepoModalAfterSignIn";
import { useUserSession } from "@studio/store/zustand/userSession";
import type { GHBranch, GithubRepository } from "be-types";
import { useState } from "react";
import { RepositoryModal } from "./RepositoryModal";

export const CodemodButton = () => {
  const [repositoriesToShow, setRepositoriesToShow] = useState<
    GithubRepository[]
  >([]);

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

  const { codemodExecutionId } = useUserSession();
  const codemodRunStatus = useExecutionStatus(codemodExecutionId);
  const status = codemodRunStatus?.result?.status ?? null;
  const { text, hintText } = getButtonPropsByStatus(status);

  return (
    <>
      <RepositoryModal
        branchesToShow={branchesToShow}
        setBranchesToShow={setBranchesToShow}
        hideRepositoryModal={hideRepositoryModal}
        isRepositoryModalShown={isRepositoryModalShown}
        repositoriesToShow={repositoriesToShow}
        areReposLoading={areReposLoading}
      />
      {codemodRunStatus !== null && (
        <ProgressBar codemodRunStatus={codemodRunStatus} />
      )}
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
};
